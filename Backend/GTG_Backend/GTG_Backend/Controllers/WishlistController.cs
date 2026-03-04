using System.Security.Claims;
using GTG_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WishlistController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/wishlist
        [HttpGet]
        public async Task<ActionResult> GetWishlist()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var items = await _context.WishlistItems
                .Where(w => w.UserId == userId)
                .Include(w => w.Product)
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => new
                {
                    id = w.Id,
                    productId = w.ProductId,
                    name = w.Product != null ? w.Product.Name : "",
                    price = w.Product != null ? w.Product.Price : 0,
                    image = w.Product != null && w.Product.ImageUrl != null
                        ? (w.Product.ImageUrl.StartsWith("http") ? w.Product.ImageUrl : $"{baseUrl}/{w.Product.ImageUrl.TrimStart('/')}")
                        : (string?)null,
                    stock = w.Product != null ? w.Product.Stock : 0,
                    discount = w.Product != null ? w.Product.Discount : 0,
                    rating = w.Product != null ? w.Product.Rating : 0,
                    createdAt = w.CreatedAt,
                })
                .ToListAsync();

            return Ok(new { items, count = items.Count });
        }

        // POST: api/wishlist/{productId}
        [HttpPost("{productId}")]
        public async Task<ActionResult> AddToWishlist(int productId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            // Kiểm tra product tồn tại
            var productExists = await _context.Products.AnyAsync(p => p.Id == productId);
            if (!productExists)
                return NotFound(new { success = false, message = "Sản phẩm không tồn tại" });

            // Kiểm tra đã có trong wishlist chưa
            var exists = await _context.WishlistItems
                .AnyAsync(w => w.UserId == userId && w.ProductId == productId);

            if (exists)
                return Ok(new { success = true, message = "Sản phẩm đã có trong danh sách yêu thích" });

            _context.WishlistItems.Add(new WishlistItem
            {
                UserId = userId.Value,
                ProductId = productId,
                CreatedAt = DateTime.Now,
            });

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã thêm vào danh sách yêu thích" });
        }

        // DELETE: api/wishlist/{productId}
        [HttpDelete("{productId}")]
        public async Task<ActionResult> RemoveFromWishlist(int productId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var item = await _context.WishlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

            if (item == null)
                return NotFound(new { success = false, message = "Sản phẩm không có trong danh sách yêu thích" });

            _context.WishlistItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Đã xóa khỏi danh sách yêu thích" });
        }

        // GET: api/wishlist/check/{productId}
        [HttpGet("check/{productId}")]
        public async Task<ActionResult> CheckWishlist(int productId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var exists = await _context.WishlistItems
                .AnyAsync(w => w.UserId == userId && w.ProductId == productId);

            return Ok(new { isInWishlist = exists });
        }

        // GET: api/wishlist/ids
        [HttpGet("ids")]
        public async Task<ActionResult> GetWishlistIds()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var productIds = await _context.WishlistItems
                .Where(w => w.UserId == userId)
                .Select(w => w.ProductId)
                .ToListAsync();

            return Ok(new { productIds });
        }

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
}
