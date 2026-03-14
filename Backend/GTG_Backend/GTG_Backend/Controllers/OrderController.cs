using System.Security.Claims;
using GTG_Backend.DTOs;
using GTG_Backend.Models;
using GTG_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly VnPayService _vnPayService;
        private readonly EmailService _emailService;

        public OrdersController(AppDbContext context, VnPayService vnPayService, EmailService emailService)
        {
            _context = context;
            _vnPayService = vnPayService;
            _emailService = emailService;
        }

        // POST: api/orders
        [HttpPost]
        public async Task<ActionResult<CreateOrderResponse>> CreateOrder(CreateOrderRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            if (request.Items == null || !request.Items.Any())
                return BadRequest(new { message = "Giỏ hàng trống" });

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var orderCode = $"ORD{DateTime.Now:yyyyMMddHHmmss}{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

            // ✅ Bọc trong transaction — đảm bảo tất cả hoặc không gì cả
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // === VALIDATION TRƯỚC KHI GHI DỮ LIỆU ===

                // Validate voucher nếu có
                Voucher? voucher = null;
                if (!string.IsNullOrEmpty(request.VoucherCode))
                {
                    voucher = await _context.Vouchers
                        .FirstOrDefaultAsync(v => v.Code == request.VoucherCode && v.UserId == userId.Value && !v.IsUsed);

                    if (voucher == null)
                        return BadRequest(new { message = "Mã voucher không hợp lệ hoặc đã sử dụng" });
                }

                // Validate tất cả sản phẩm + tính TotalAmount từ DB (không tin frontend)
                var orderItems = new List<OrderItem>();
                decimal calculatedTotal = 0;
                foreach (var item in request.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                        return BadRequest(new { message = $"Sản phẩm ID {item.ProductId} không tồn tại" });

                    if (product.Stock < item.Quantity)
                        return BadRequest(new { message = $"Sản phẩm {product.Name} không đủ số lượng (còn {product.Stock})" });

                    // Lấy giá từ DB — không dùng item.Price từ frontend
                    var unitPrice = product.Price;
                    calculatedTotal += unitPrice * item.Quantity;

                    // Trừ stock
                    product.Stock -= item.Quantity;

                    // Chuẩn bị OrderItem
                    orderItems.Add(new OrderItem
                    {
                        ProductId = item.ProductId,
                        ProductName = product.Name,
                        ProductImage = product.ImageUrl != null
                            ? (product.ImageUrl.StartsWith("http") ? product.ImageUrl : $"{baseUrl}/{product.ImageUrl.TrimStart('/')}")
                            : null,
                        Quantity = item.Quantity,
                        Price = unitPrice  // ✅ Giá từ DB
                    });
                }

                // === GHI DỮ LIỆU (sau khi validate xong) ===

                // Tạo Order
                var order = new Order
                {
                    UserId = userId.Value,
                    OrderCode = orderCode,
                    Status = "pending",
                    TotalAmount = calculatedTotal,  // ✅ Tính từ DB, không tin frontend
                    ShippingFee = request.ShippingFee,
                    PaymentMethod = request.PaymentMethod,
                    ShippingFullName = request.ShippingFullName,
                    ShippingPhone = request.ShippingPhone,
                    ShippingEmail = request.ShippingEmail,
                    ShippingAddress = request.ShippingAddress,
                    ShippingCity = request.ShippingCity,
                    ShippingDistrict = request.ShippingDistrict,
                    ShippingWard = request.ShippingWard,
                    Note = request.Note,
                    CreatedAt = DateTime.Now
                };

                // Áp dụng voucher
                if (voucher != null)
                {
                    var discountAmount = order.TotalAmount * voucher.DiscountPercent / 100;
                    order.VoucherCode = voucher.Code;
                    order.DiscountAmount = discountAmount;
                    order.TotalAmount = order.TotalAmount - discountAmount;

                    voucher.IsUsed = true;
                    voucher.UsedAt = DateTime.UtcNow;
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync(); // Cần ID cho OrderItems

                // Gán OrderId cho items + voucher
                foreach (var oi in orderItems)
                    oi.OrderId = order.Id;
                _context.OrderItems.AddRange(orderItems);

                if (voucher != null)
                    voucher.OrderId = order.Id;

                // Xóa giỏ hàng
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart?.CartItems != null)
                    _context.CartItems.RemoveRange(cart.CartItems);

                // ✅ Lưu tất cả + commit transaction
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // === SAU TRANSACTION (side-effects không ảnh hưởng data) ===

                // VnPay URL
                string? paymentUrl = null;
                if (request.PaymentMethod == "vnpay")
                {
                    var ipAddress = HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "127.0.0.1";
                    var totalPayment = order.TotalAmount + order.ShippingFee;
                    paymentUrl = _vnPayService.CreatePaymentUrl(orderCode, totalPayment, null, ipAddress);
                }

                // Gửi email xác nhận (COD gửi ngay)
                if (request.PaymentMethod == "cod" && !string.IsNullOrEmpty(request.ShippingEmail))
                {
                    await _emailService.SendOrderConfirmationAsync(order, orderItems, request.ShippingEmail);
                }

                return Ok(new CreateOrderResponse
                {
                    Id = order.Id,
                    OrderCode = orderCode,
                    Status = "pending",
                    Message = "Đặt hàng thành công",
                    PaymentUrl = paymentUrl
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"❌ CreateOrder failed: {ex.Message}");
                return StatusCode(500, new { message = "Đặt hàng thất bại. Vui lòng thử lại." });
            }
        }

        // GET: api/orders
        [HttpGet]
        public async Task<ActionResult<List<OrderResponse>>> GetOrders()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderResponse
                {
                    Id = o.Id,
                    OrderCode = o.OrderCode,
                    CreatedAt = o.CreatedAt,
                    Status = o.Status,
                    StatusText = GetStatusText(o.Status),
                    TotalAmount = o.TotalAmount,
                    ShippingFee = o.ShippingFee,
                    PaymentMethod = o.PaymentMethod,
                    PaymentStatus = o.PaymentStatus,
                    ShippingFullName = o.ShippingFullName,
                    ShippingPhone = o.ShippingPhone,
                    ShippingEmail = o.ShippingEmail,
                    ShippingAddress = o.ShippingAddress,
                    ShippingCity = o.ShippingCity,
                    ShippingDistrict = o.ShippingDistrict,
                    ShippingWard = o.ShippingWard,
                    Note = o.Note,
                    VoucherCode = o.VoucherCode,
                    DiscountAmount = o.DiscountAmount,
                    Items = o.OrderItems!.Select(oi => new OrderItemResponse
                    {
                        ProductId = oi.ProductId,
                        ProductName = oi.ProductName,
                        ProductImage = oi.ProductImage,
                        Quantity = oi.Quantity,
                        Price = oi.Price
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponse>> GetOrder(int id)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var order = await _context.Orders
                .Where(o => o.Id == id && o.UserId == userId)
                .Select(o => new OrderResponse
                {
                    Id = o.Id,
                    OrderCode = o.OrderCode,
                    CreatedAt = o.CreatedAt,
                    Status = o.Status,
                    StatusText = GetStatusText(o.Status),
                    TotalAmount = o.TotalAmount,
                    ShippingFee = o.ShippingFee,
                    PaymentMethod = o.PaymentMethod,
                    PaymentStatus = o.PaymentStatus,
                    ShippingFullName = o.ShippingFullName,
                    ShippingPhone = o.ShippingPhone,
                    ShippingEmail = o.ShippingEmail,
                    ShippingAddress = o.ShippingAddress,
                    ShippingCity = o.ShippingCity,
                    ShippingDistrict = o.ShippingDistrict,
                    ShippingWard = o.ShippingWard,
                    Note = o.Note,
                    VoucherCode = o.VoucherCode,
                    DiscountAmount = o.DiscountAmount,
                    Items = o.OrderItems!.Select(oi => new OrderItemResponse
                    {
                        ProductId = oi.ProductId,
                        ProductName = oi.ProductName,
                        ProductImage = oi.ProductImage,
                        Quantity = oi.Quantity,
                        Price = oi.Price
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            return Ok(order);
        }

        // PUT: api/orders/{id}/cancel
        [HttpPut("{id}/cancel")]
        public async Task<ActionResult> CancelOrder(int id, [FromBody] CancelOrderRequest? request)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            // Kiểm tra tồn tại
            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            // Kiểm tra quyền sở hữu
            if (order.UserId != userId)
                return Forbid();

            // Kiểm tra trạng thái
            if (order.Status != "pending" && order.Status != "confirmed")
                return BadRequest(new { message = "Chỉ có thể hủy đơn hàng đang chờ xác nhận hoặc đã xác nhận" });

            // Hoàn lại stock
            if (order.OrderItems != null)
            {
                foreach (var item in order.OrderItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                        product.Stock += item.Quantity;
                }
            }

            // Cập nhật trạng thái và lý do hủy
            order.Status = "cancelled";
            order.CancelReason = request?.Reason;
            order.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đơn hàng đã được hủy thành công" });
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

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
}