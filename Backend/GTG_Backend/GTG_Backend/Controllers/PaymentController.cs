using System.Security.Claims;
using GTG_Backend.DTOs;
using GTG_Backend.Models;
using GTG_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Controllers
{
    [Route("api/payment")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly VnPayService _vnPayService;
        private readonly EmailService _emailService;

        public PaymentController(AppDbContext context, VnPayService vnPayService, EmailService emailService)
        {
            _context = context;
            _vnPayService = vnPayService;
            _emailService = emailService;
        }

        /// <summary>
        /// Tạo URL thanh toán VnPay cho đơn hàng đã tạo
        /// </summary>
        [HttpPost("vnpay/create")]
        [Authorize]
        public async Task<ActionResult<VnPayPaymentResponse>> CreateVnPayUrl([FromBody] VnPayPaymentRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var order = await _context.Orders.FirstOrDefaultAsync(
                o => o.Id == request.OrderId && o.UserId == userId);

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            if (order.PaymentMethod != "vnpay")
                return BadRequest(new { message = "Đơn hàng không sử dụng phương thức VnPay" });

            if (order.PaymentStatus == "paid")
                return BadRequest(new { message = "Đơn hàng đã được thanh toán" });

            // Lấy IP client
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "127.0.0.1";

            // Tổng tiền bao gồm phí ship
            var totalPayment = order.TotalAmount + order.ShippingFee;

            var paymentUrl = _vnPayService.CreatePaymentUrl(
                order.OrderCode, totalPayment, request.BankCode, ipAddress);

            return Ok(new VnPayPaymentResponse
            {
                PaymentUrl = paymentUrl,
                OrderCode = order.OrderCode
            });
        }

        /// <summary>
        /// VnPay callback - VnPay redirect về đây sau khi thanh toán
        /// </summary>
        [HttpGet("vnpay/callback")]
        [AllowAnonymous]
        public async Task<IActionResult> VnPayCallback()
        {
            // Lấy tất cả query params từ VnPay
            var vnpayData = new Dictionary<string, string>();
            foreach (var (key, value) in Request.Query)
            {
                if (!string.IsNullOrEmpty(key))
                {
                    vnpayData[key] = value.ToString();
                }
            }

            // Validate callback
            var result = _vnPayService.ValidateCallback(vnpayData);

            // Tìm đơn hàng theo OrderCode (vnp_TxnRef)
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderCode == result.OrderCode);

            if (order != null)
            {
                if (result.IsSuccess)
                {
                    order.PaymentStatus = "paid";
                    order.Status = "confirmed"; // Tự động xác nhận khi thanh toán thành công

                    // Gửi email xác nhận đơn hàng sau khi VnPay thanh toán thành công
                    if (!string.IsNullOrEmpty(order.ShippingEmail) && order.OrderItems != null)
                    {
                        await _emailService.SendOrderConfirmationAsync(order, order.OrderItems.ToList(), order.ShippingEmail);
                    }
                }
                else
                {
                    order.PaymentStatus = "failed";
                }
                order.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();
            }

            // Redirect về frontend với thông tin kết quả
            var frontendUrl = "http://gtgshop.nghiencongnghe.id.vn/payment/vnpay/return";
            var redirectUrl = $"{frontendUrl}?success={result.IsSuccess}&orderCode={result.OrderCode}&message={Uri.EscapeDataString(result.Message)}";

            return Redirect(redirectUrl);
        }

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
}
