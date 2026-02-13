using GTG_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Controllers
{
    [Route("api/admin/dashboard")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminDashboardController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/dashboard
        [HttpGet]
        public async Task<ActionResult> GetDashboard()
        {
            // === STATS ===
            var totalRevenue = await _context.Orders
                .Where(o => o.Status != "cancelled")
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            var totalOrders = await _context.Orders.CountAsync();

            var totalProducts = await _context.Products.CountAsync();

            var totalCustomers = await _context.Users
                .Include(u => u.Role)
                .CountAsync(u => u.Role == null || u.Role.RoleName == "Customer");

            // Stats tháng trước để so sánh
            var startOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            var startOfLastMonth = startOfMonth.AddMonths(-1);

            var revenueThisMonth = await _context.Orders
                .Where(o => o.Status != "cancelled" && o.CreatedAt >= startOfMonth)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            var revenueLastMonth = await _context.Orders
                .Where(o => o.Status != "cancelled" && o.CreatedAt >= startOfLastMonth && o.CreatedAt < startOfMonth)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            var ordersThisMonth = await _context.Orders
                .CountAsync(o => o.CreatedAt >= startOfMonth);

            var ordersLastMonth = await _context.Orders
                .CountAsync(o => o.CreatedAt >= startOfLastMonth && o.CreatedAt < startOfMonth);

            var customersThisMonth = await _context.Users
                .CountAsync(u => u.CreatedAt >= startOfMonth);

            var customersLastMonth = await _context.Users
                .CountAsync(u => u.CreatedAt >= startOfLastMonth && u.CreatedAt < startOfMonth);

            // === RECENT ORDERS (5 đơn mới nhất) ===
            var recentOrders = await _context.Orders
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.CreatedAt)
                .Take(5)
                .Select(o => new
                {
                    o.Id,
                    o.OrderCode,
                    o.ShippingFullName,
                    o.TotalAmount,
                    o.Status,
                    o.CreatedAt,
                    ItemCount = o.OrderItems != null ? o.OrderItems.Count : 0
                })
                .ToListAsync();

            // === TOP SELLING PRODUCTS ===
            var topProducts = await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => oi.Order != null && oi.Order.Status != "cancelled")
                .GroupBy(oi => new { oi.ProductId, oi.ProductName })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName,
                    TotalSold = g.Sum(x => x.Quantity),
                    TotalRevenue = g.Sum(x => x.Quantity * x.Price)
                })
                .OrderByDescending(x => x.TotalRevenue)
                .Take(5)
                .ToListAsync();

            // === ORDER STATUS BREAKDOWN ===
            var ordersByStatus = await _context.Orders
                .GroupBy(o => o.Status)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            return Ok(new
            {
                stats = new
                {
                    totalRevenue,
                    totalOrders,
                    totalProducts,
                    totalCustomers,
                    revenueThisMonth,
                    revenueLastMonth,
                    ordersThisMonth,
                    ordersLastMonth,
                    customersThisMonth,
                    customersLastMonth
                },
                recentOrders,
                topProducts,
                ordersByStatus
            });
        }
    }
}
