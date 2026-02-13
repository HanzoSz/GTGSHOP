using System.Security.Claims;
using GTG_Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Controllers
{
    [Route("api/admin/orders")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminOrdersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/orders
        [HttpGet]
        public async Task<ActionResult> GetAllOrders(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? status = null)
        {
            var query = _context.Orders
                .Include(o => o.OrderItems)
                .AsQueryable();

            // Filter by status
            if (!string.IsNullOrEmpty(status))
                query = query.Where(o => o.Status == status);

            // Search
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(o =>
                    o.OrderCode.ToLower().Contains(search) ||
                    o.ShippingFullName.ToLower().Contains(search) ||
                    o.ShippingPhone.Contains(search));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new
                {
                    o.Id,
                    o.OrderCode,
                    o.CreatedAt,
                    o.UpdatedAt,
                    o.Status,
                    StatusText = GetStatusText(o.Status),
                    o.TotalAmount,
                    o.ShippingFee,
                    o.PaymentMethod,
                    o.ShippingFullName,
                    o.ShippingPhone,
                    o.ShippingEmail,
                    o.ShippingAddress,
                    o.ShippingCity,
                    o.ShippingDistrict,
                    o.ShippingWard,
                    o.Note,
                    o.CancelReason,
                    Items = o.OrderItems!.Select(oi => new
                    {
                        oi.ProductId,
                        oi.ProductName,
                        oi.ProductImage,
                        oi.Quantity,
                        oi.Price
                    }).ToList()
                })
                .ToListAsync();

            return Ok(new
            {
                items = orders,
                totalItems,
                totalPages,
                currentPage = page,
                pageSize
            });
        }

        // GET: api/admin/orders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.Id == id)
                .Select(o => new
                {
                    o.Id,
                    o.OrderCode,
                    o.CreatedAt,
                    o.UpdatedAt,
                    o.Status,
                    StatusText = GetStatusText(o.Status),
                    o.TotalAmount,
                    o.ShippingFee,
                    o.PaymentMethod,
                    o.ShippingFullName,
                    o.ShippingPhone,
                    o.ShippingEmail,
                    o.ShippingAddress,
                    o.ShippingCity,
                    o.ShippingDistrict,
                    o.ShippingWard,
                    o.Note,
                    o.CancelReason,
                    Items = o.OrderItems!.Select(oi => new
                    {
                        oi.ProductId,
                        oi.ProductName,
                        oi.ProductImage,
                        oi.Quantity,
                        oi.Price
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            return Ok(order);
        }

        // PUT: api/admin/orders/{id}/status
        [HttpPut("{id}/status")]
        public async Task<ActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            // Validate transition
            var validTransitions = new Dictionary<string, string[]>
            {
                { "pending", new[] { "confirmed", "cancelled" } },
                { "confirmed", new[] { "shipping", "cancelled" } },
                { "shipping", new[] { "delivered" } },
            };

            if (!validTransitions.ContainsKey(order.Status) ||
                !validTransitions[order.Status].Contains(request.Status))
            {
                return BadRequest(new { message = $"Không thể chuyển từ '{GetStatusText(order.Status)}' sang '{GetStatusText(request.Status)}'" });
            }

            // Hoàn stock nếu hủy
            if (request.Status == "cancelled" && order.OrderItems != null)
            {
                foreach (var item in order.OrderItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                        product.Stock += item.Quantity;
                }
            }

            order.Status = request.Status;
            order.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công" });
        }

        private static string GetStatusText(string status) => status switch
        {
            "pending" => "Chờ xác nhận",
            "confirmed" => "Đã xác nhận",
            "shipping" => "Đang giao hàng",
            "delivered" => "Đã giao hàng",
            "cancelled" => "Đã hủy",
            _ => "Không xác định"
        };
    }

    // DTO
    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}