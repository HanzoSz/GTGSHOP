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
    public class VouchersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VouchersController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/vouchers/claim
        [HttpPost("claim")]
        public async Task<ActionResult> ClaimVoucher()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var existing = await _context.Vouchers
                .FirstOrDefaultAsync(v => v.UserId == userId.Value);

            if (existing != null)
            {
                return Conflict(new
                {
                    message = "Bạn đã nhận voucher rồi",
                    voucher = new
                    {
                        code = existing.Code,
                        discountPercent = existing.DiscountPercent
                    }
                });
            }

            var random = new Random();
            var discountPercent = random.Next(5, 21);
            var code = GenerateVoucherCode();

            // Đảm bảo code không trùng
            while (await _context.Vouchers.AnyAsync(v => v.Code == code))
            {
                code = GenerateVoucherCode();
            }

            var voucher = new Voucher
            {
                Code = code,
                UserId = userId.Value,
                DiscountPercent = discountPercent,
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                code = voucher.Code,
                discountPercent = voucher.DiscountPercent,
                message = "Nhận voucher thành công!"
            });
        }

        // GET: api/vouchers/my
        [HttpGet("my")]
        public async Task<ActionResult> GetMyVouchers()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var vouchers = await _context.Vouchers
                .Where(v => v.UserId == userId.Value && !v.IsUsed)
                .Select(v => new
                {
                    code = v.Code,
                    discountPercent = v.DiscountPercent,
                    createdAt = v.CreatedAt
                })
                .ToListAsync();

            return Ok(vouchers);
        }

        // POST: api/vouchers/validate
        [HttpPost("validate")]
        public async Task<ActionResult> ValidateVoucher([FromBody] ValidateVoucherRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var voucher = await _context.Vouchers
                .FirstOrDefaultAsync(v => v.Code == request.Code && v.UserId == userId.Value && !v.IsUsed);

            if (voucher == null)
            {
                return Ok(new { valid = false, message = "Mã không hợp lệ / đã sử dụng" });
            }

            return Ok(new { valid = true, discountPercent = voucher.DiscountPercent });
        }

        private static string GenerateVoucherCode()
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var random = new Random();
            var code = new string(Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray());
            return $"GTG-{code}";
        }

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }

    public class ValidateVoucherRequest
    {
        public string Code { get; set; } = string.Empty;
    }
}
