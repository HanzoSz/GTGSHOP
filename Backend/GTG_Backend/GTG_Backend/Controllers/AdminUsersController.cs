using GTG_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Controllers
{
    [Route("api/admin/users")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminUsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/users
        [HttpGet]
        public async Task<ActionResult> GetAllUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? role = null)
        {
            var query = _context.Users
                .Include(u => u.Role)
                .AsQueryable();

            // Filter by role
            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role != null && u.Role.RoleName == role);

            // Search
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(search) ||
                    u.Email.ToLower().Contains(search) ||
                    (u.PhoneNumber != null && u.PhoneNumber.Contains(search)));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.Address,
                    u.CreatedAt,
                    RoleName = u.Role != null ? u.Role.RoleName : "Customer",
                    // Thống kê đơn hàng
                    OrderCount = _context.Orders.Count(o => o.UserId == u.Id),
                    TotalSpent = _context.Orders
                        .Where(o => o.UserId == u.Id && o.Status != "cancelled")
                        .Sum(o => (decimal?)o.TotalAmount) ?? 0,
                    LastOrderDate = _context.Orders
                        .Where(o => o.UserId == u.Id)
                        .OrderByDescending(o => o.CreatedAt)
                        .Select(o => (DateTime?)o.CreatedAt)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(new
            {
                items = users,
                totalItems,
                totalPages,
                currentPage = page,
                pageSize
            });
        }

        // GET: api/admin/users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.PhoneNumber,
                    u.Address,
                    u.CreatedAt,
                    RoleName = u.Role != null ? u.Role.RoleName : "Customer",
                    OrderCount = _context.Orders.Count(o => o.UserId == u.Id),
                    TotalSpent = _context.Orders
                        .Where(o => o.UserId == u.Id && o.Status != "cancelled")
                        .Sum(o => (decimal?)o.TotalAmount) ?? 0,
                    // Danh sách đơn hàng gần nhất
                    RecentOrders = _context.Orders
                        .Where(o => o.UserId == u.Id)
                        .OrderByDescending(o => o.CreatedAt)
                        .Take(5)
                        .Select(o => new
                        {
                            o.Id,
                            o.OrderCode,
                            o.CreatedAt,
                            o.Status,
                            o.TotalAmount,
                            ItemCount = o.OrderItems != null ? o.OrderItems.Count : 0
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "Không tìm thấy khách hàng" });

            return Ok(user);
        }

        // GET: api/admin/users/stats
        [HttpGet("stats")]
        public async Task<ActionResult> GetStats()
        {
            var totalUsers = await _context.Users
                .Include(u => u.Role)
                .CountAsync(u => u.Role == null || u.Role.RoleName == "Customer");

            var totalAdmins = await _context.Users
                .Include(u => u.Role)
                .CountAsync(u => u.Role != null && u.Role.RoleName == "Admin");

            // Khách mới tháng này
            var startOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            var newUsersThisMonth = await _context.Users
                .CountAsync(u => u.CreatedAt >= startOfMonth);

            // Khách có đơn hàng
            var usersWithOrders = await _context.Orders
                .Select(o => o.UserId)
                .Distinct()
                .CountAsync();

            return Ok(new
            {
                totalUsers,
                totalAdmins,
                newUsersThisMonth,
                usersWithOrders
            });
        }
    }
}
