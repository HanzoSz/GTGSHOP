using GTG_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminSearchController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminSearchController(AppDbContext context) => _context = context;

        // GET: api/admin/search?q=...
        [HttpGet("search")]
        public async Task<ActionResult> GlobalSearch([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
                return Ok(new { products = Array.Empty<object>(), orders = Array.Empty<object>(), customers = Array.Empty<object>() });

            var keyword = q.Trim().ToLower();
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            // Tìm sản phẩm (tối đa 5)
            var products = await _context.Products
                .Where(p => p.Name.ToLower().Contains(keyword))
                .Take(5)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.Stock,
                    Image = p.ImageUrl != null ? baseUrl + p.ImageUrl : null
                })
                .ToListAsync();

            // Tìm đơn hàng (tối đa 5)
            var orders = await _context.Orders
                .Where(o => o.OrderCode.ToLower().Contains(keyword) ||
                            o.ShippingFullName.ToLower().Contains(keyword) ||
                            o.ShippingPhone.Contains(keyword))
                .OrderByDescending(o => o.CreatedAt)
                .Take(5)
                .Select(o => new
                {
                    o.Id,
                    o.OrderCode,
                    o.ShippingFullName,
                    o.TotalAmount,
                    o.Status,
                    o.CreatedAt
                })
                .ToListAsync();

            // Tìm khách hàng (tối đa 5)
            var customers = await _context.Users
                .Include(u => u.Role)
                .Where(u => (u.Role == null || u.Role.RoleName == "Customer") &&
                            (u.FullName.ToLower().Contains(keyword) ||
                             u.Email.ToLower().Contains(keyword) ||
                             (u.PhoneNumber != null && u.PhoneNumber.Contains(keyword))))
                .Take(5)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(new { products, orders, customers });
        }

        // GET: api/admin/notifications
        [HttpGet("notifications")]
        public async Task<ActionResult> GetNotifications()
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            // 1. Đơn hàng mới (pending) — 24h qua
            var since = DateTime.Now.AddHours(-24);
            var newOrders = await _context.Orders
                .Where(o => o.Status == "pending" && o.CreatedAt >= since)
                .OrderByDescending(o => o.CreatedAt)
                .Take(10)
                .Select(o => new
                {
                    Type = "new_order",
                    o.Id,
                    Title = $"Đơn hàng mới #{o.OrderCode}",
                    Message = $"{o.ShippingFullName} — {o.TotalAmount:N0}₫",
                    o.CreatedAt
                })
                .ToListAsync();

            // 2. Sản phẩm sắp hết hàng (stock <= 5)
            var lowStockProducts = await _context.Products
                .Where(p => p.Stock <= 5 && p.Stock > 0)
                .OrderBy(p => p.Stock)
                .Take(5)
                .Select(p => new
                {
                    Type = "low_stock",
                    p.Id,
                    Title = $"Sắp hết hàng",
                    Message = $"{p.Name} — còn {p.Stock} sản phẩm",
                    CreatedAt = DateTime.Now // current time for sorting
                })
                .ToListAsync();

            // 3. Sản phẩm hết hàng hoàn toàn
            var outOfStock = await _context.Products
                .Where(p => p.Stock == 0)
                .Take(5)
                .Select(p => new
                {
                    Type = "out_of_stock",
                    p.Id,
                    Title = "Hết hàng",
                    Message = p.Name,
                    CreatedAt = DateTime.Now
                })
                .ToListAsync();

            // Gộp tất cả notifications
            var all = newOrders
                .Select(n => new { n.Type, n.Id, n.Title, n.Message, n.CreatedAt })
                .Concat(lowStockProducts.Select(n => new { n.Type, n.Id, n.Title, n.Message, n.CreatedAt }))
                .Concat(outOfStock.Select(n => new { n.Type, n.Id, n.Title, n.Message, n.CreatedAt }))
                .OrderByDescending(n => n.Type == "new_order" ? 1 : 0) // Ưu tiên đơn hàng mới
                .ThenByDescending(n => n.CreatedAt)
                .Take(15)
                .ToList();

            return Ok(new
            {
                items = all,
                unreadCount = newOrders.Count
            });
        }
    }
}
