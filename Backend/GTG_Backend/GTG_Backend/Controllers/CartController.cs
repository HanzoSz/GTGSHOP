using System.Security.Claims;
using GTG_Backend.DTOs;
using GTG_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/cart
        [HttpGet]
        public async Task<ActionResult<CartResponse>> GetCart()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var cart = await _context.Carts
                .Include(c => c.CartItems!)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || cart.CartItems == null)
            {
                return Ok(new CartResponse { Items = new List<CartItemDto>() });
            }

            var items = cart.CartItems.Select(ci => new CartItemDto
            {
                Id = ci.Id,
                ProductId = ci.ProductId,
                Name = ci.Product?.Name ?? "",
                Price = ci.Product?.Price ?? 0,
                Image = ci.Product?.ImageUrl != null
                    ? (ci.Product.ImageUrl.StartsWith("http") ? ci.Product.ImageUrl : $"{baseUrl}/{ci.Product.ImageUrl.TrimStart('/')}")
                    : null,
                Quantity = ci.Quantity,
                Stock = ci.Product?.Stock ?? 0
            }).ToList();

            return Ok(new CartResponse { Items = items });
        }

        // POST: api/cart/sync
        [HttpPost("sync")]
        public async Task<ActionResult<SyncCartResponse>> SyncCart(SyncCartRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            // Tìm hoặc tạo cart
            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId.Value,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            // Xóa cart items cũ bằng direct SQL — tránh concurrency conflict
            await _context.CartItems
                .Where(ci => ci.CartId == cart.Id)
                .ExecuteDeleteAsync();

            // Thêm cart items mới
            foreach (var item in request.Items)
            {
                // Kiểm tra product tồn tại
                var productExists = await _context.Products.AnyAsync(p => p.Id == item.ProductId);
                if (!productExists) continue;

                _context.CartItems.Add(new CartItem
                {
                    CartId = cart.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    CreatedAt = DateTime.Now
                });
            }

            cart.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new SyncCartResponse { Success = true, Message = "Đồng bộ giỏ hàng thành công" });
        }

        // POST: api/cart/add
        [HttpPost("add")]
        public async Task<ActionResult<SyncCartResponse>> AddToCart([FromBody] SyncCartItem item)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            // Kiểm tra product
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product == null)
                return NotFound(new SyncCartResponse { Success = false, Message = "Sản phẩm không tồn tại" });

            // Tìm hoặc tạo cart
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId.Value,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            // Kiểm tra item đã tồn tại trong cart
            var existingItem = cart.CartItems?.FirstOrDefault(ci => ci.ProductId == item.ProductId);
            if (existingItem != null)
            {
                existingItem.Quantity += item.Quantity;
            }
            else
            {
                _context.CartItems.Add(new CartItem
                {
                    CartId = cart.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    CreatedAt = DateTime.Now
                });
            }

            cart.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new SyncCartResponse { Success = true, Message = "Đã thêm vào giỏ hàng" });
        }

        // DELETE: api/cart/{productId}
        [HttpDelete("{productId}")]
        public async Task<ActionResult<SyncCartResponse>> RemoveFromCart(int productId)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
                return NotFound(new SyncCartResponse { Success = false, Message = "Giỏ hàng trống" });

            var cartItem = cart.CartItems?.FirstOrDefault(ci => ci.ProductId == productId);
            if (cartItem == null)
                return NotFound(new SyncCartResponse { Success = false, Message = "Sản phẩm không có trong giỏ" });

            _context.CartItems.Remove(cartItem);
            cart.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new SyncCartResponse { Success = true, Message = "Đã xóa khỏi giỏ hàng" });
        }

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
}