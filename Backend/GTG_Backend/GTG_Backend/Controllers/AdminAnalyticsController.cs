using GTG_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Controllers
{
    [Route("api/admin/analytics")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminAnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminAnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/analytics
        [HttpGet]
        public async Task<ActionResult> GetAnalytics()
        {
            var today = DateTime.Now.Date;
            var tomorrow = today.AddDays(1);

            // === KEY METRICS ===
            var totalRevenue = await _context.Orders
                .Where(o => o.Status != "cancelled")
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            var ordersToday = await _context.Orders
                .CountAsync(o => o.CreatedAt >= today && o.CreatedAt < tomorrow);

            var newCustomersToday = await _context.Users
                .CountAsync(u => u.CreatedAt >= today && u.CreatedAt < tomorrow);

            var totalOrders = await _context.Orders.CountAsync();
            var cancelledOrders = await _context.Orders.CountAsync(o => o.Status == "cancelled");
            var cancelRate = totalOrders > 0 ? Math.Round((double)cancelledOrders / totalOrders * 100, 1) : 0;

            // === DAILY REVENUE (14 ngày gần nhất) ===
            var startDate = today.AddDays(-13);
            var dailyRevenue = await _context.Orders
                .Where(o => o.Status != "cancelled" && o.CreatedAt >= startDate)
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .ToListAsync();

            // Tạo đầy đủ 14 ngày (kể cả ngày không có doanh thu)
            var revenueChart = new List<object>();
            for (int i = 0; i < 14; i++)
            {
                var date = startDate.AddDays(i);
                var dayRevenue = dailyRevenue.FirstOrDefault(d => d.Date == date);
                revenueChart.Add(new
                {
                    date = date.ToString("dd/MM"),
                    fullDate = date.ToString("yyyy-MM-dd"),
                    revenue = dayRevenue?.Revenue ?? 0,
                    // Tuần này (7 ngày gần nhất) vs tuần trước
                    isThisWeek = i >= 7
                });
            }

            // Tổng tuần này vs tuần trước
            var thisWeekStart = today.AddDays(-6);
            var lastWeekStart = today.AddDays(-13);

            var revenueThisWeek = await _context.Orders
                .Where(o => o.Status != "cancelled" && o.CreatedAt >= thisWeekStart)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            var revenueLastWeek = await _context.Orders
                .Where(o => o.Status != "cancelled" && o.CreatedAt >= lastWeekStart && o.CreatedAt < thisWeekStart)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            // === CATEGORY SALES (Pie Chart) ===
            var categorySales = await _context.OrderItems
                .Include(oi => oi.Product)
                    .ThenInclude(p => p!.Category)
                .Where(oi => oi.Order != null && oi.Order.Status != "cancelled" && oi.Product != null && oi.Product.Category != null)
                .GroupBy(oi => new { oi.Product!.Category!.Id, oi.Product.Category.Name })
                .Select(g => new
                {
                    CategoryId = g.Key.Id,
                    CategoryName = g.Key.Name,
                    TotalQuantity = g.Sum(x => x.Quantity),
                    TotalRevenue = g.Sum(x => x.Quantity * x.Price)
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ToListAsync();

            // === TOP SELLERS (Top 5 sản phẩm) ===
            var topSellers = await _context.OrderItems
                .Where(oi => oi.Order != null && oi.Order.Status != "cancelled")
                .GroupBy(oi => new { oi.ProductId, oi.ProductName })
                .Select(g => new
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName,
                    TotalSold = g.Sum(x => x.Quantity),
                    TotalRevenue = g.Sum(x => x.Quantity * x.Price),
                    AveragePrice = g.Average(x => x.Price)
                })
                .OrderByDescending(x => x.TotalSold)
                .Take(5)
                .ToListAsync();

            // Lấy thêm stock hiện tại cho top sellers
            var topProductIds = topSellers.Select(t => t.ProductId).ToList();
            var productStocks = await _context.Products
                .Where(p => topProductIds.Contains(p.Id))
                .Select(p => new { p.Id, p.Stock, p.ImageUrl })
                .ToListAsync();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var topSellersWithStock = topSellers.Select(t =>
            {
                var stock = productStocks.FirstOrDefault(p => p.Id == t.ProductId);
                return new
                {
                    t.ProductId,
                    t.ProductName,
                    t.TotalSold,
                    t.TotalRevenue,
                    t.AveragePrice,
                    CurrentStock = stock?.Stock ?? 0,
                    ImageUrl = stock?.ImageUrl != null ? $"{baseUrl}{stock.ImageUrl}" : null
                };
            }).ToList();

            return Ok(new
            {
                keyMetrics = new
                {
                    totalRevenue,
                    ordersToday,
                    newCustomersToday,
                    cancelRate,
                    totalOrders,
                    cancelledOrders
                },
                revenueChart,
                revenueThisWeek,
                revenueLastWeek,
                categorySales,
                topSellers = topSellersWithStock
            });
        }
    }
}
