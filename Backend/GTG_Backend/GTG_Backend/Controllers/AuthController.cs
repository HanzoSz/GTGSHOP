using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GTG_Backend.DTOs;
using GTG_Backend.Models;
using GTG_Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace GTG_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly EmailService _emailService;

        public AuthController(AppDbContext context, IConfiguration configuration, EmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<MessageResponse>> Register(RegisterRequest request)
        {
            // Kiểm tra email đã tồn tại
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new MessageResponse { Message = "Email đã được sử dụng" });
            }

            // Lấy role Customer (mặc định)
            var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Customer");
            if (customerRole == null)
            {
                return BadRequest(new MessageResponse { Message = "Lỗi hệ thống: Không tìm thấy role" });
            }

            // Tạo user mới
            var user = new User
            {
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FullName = request.FullName,
                PhoneNumber = request.Phone,
                RoleId = customerRole.Id,
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new MessageResponse { Message = "Đăng ký thành công" });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            // Tìm user theo email
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return Unauthorized(new MessageResponse { Message = "Email hoặc mật khẩu không đúng" });
            }

            // Kiểm tra password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new MessageResponse { Message = "Email hoặc mật khẩu không đúng" });
            }

            // Tạo JWT token
            var token = GenerateJwtToken(user);

            // Set HttpOnly cookie
            var roleName = user.Role?.RoleName ?? "Customer";
            var cookieName = roleName == "Admin" ? "admin_token" : "auth_token";
            var expireMinutes = double.Parse(_configuration["Jwt:ExpireMinutes"]!);

            Response.Cookies.Append(cookieName, token, new CookieOptions
            {
                HttpOnly = true,       // JS không đọc được → chống XSS
                Secure = true,         // Chỉ gửi qua HTTPS
                SameSite = SameSiteMode.None,  // Cross-origin (localhost:5173 → localhost:7033)
                Expires = DateTimeOffset.Now.AddMinutes(expireMinutes),
                Path = "/"
            });

            return Ok(new AuthResponse
            {
                Token = null,  // Không trả token trong body nữa (đã lưu trong cookie)
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Phone = user.PhoneNumber,
                    Address = user.Address,
                    Role = roleName,
                    CreatedAt = user.CreatedAt
                }
            });
        }

        // ✅ POST: api/auth/logout - Đăng xuất (xóa cookie)
        [HttpPost("logout")]
        [AllowAnonymous]
        public IActionResult Logout()
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/"
            };
            Response.Cookies.Delete("auth_token", cookieOptions);
            Response.Cookies.Delete("admin_token", cookieOptions);
            return Ok(new MessageResponse { Message = "Đăng xuất thành công" });
        }

        // ✅ GET: api/auth/me - Kiểm tra auth status từ cookie (dùng khi reload page)
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<AuthResponse>> GetCurrentUser()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new MessageResponse { Message = "Chưa đăng nhập" });

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return Unauthorized(new MessageResponse { Message = "User không tồn tại" });

            return Ok(new AuthResponse
            {
                Token = null,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Phone = user.PhoneNumber,
                    Address = user.Address,
                    Role = user.Role?.RoleName ?? "Customer",
                    CreatedAt = user.CreatedAt
                }
            });
        }

        // ✅ GET: api/auth/profile - Lấy thông tin user hiện tại
        [Authorize]
        [HttpGet("profile")]
        public async Task<ActionResult<UserDto>> GetProfile()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new MessageResponse { Message = "Vui lòng đăng nhập" });

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new MessageResponse { Message = "User không tồn tại" });

            return Ok(new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.PhoneNumber,
                Address = user.Address,
                Role = user.Role?.RoleName ?? "Customer",
                CreatedAt = user.CreatedAt
            });
        }

        // ✅ PUT: api/auth/profile - Cập nhật thông tin user
        [Authorize]
        [HttpPut("profile")]
        public async Task<ActionResult<ProfileResponse>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new MessageResponse { Message = "Vui lòng đăng nhập" });

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound(new MessageResponse { Message = "User không tồn tại" });

            // Validate FullName
            if (string.IsNullOrWhiteSpace(request.FullName))
                return BadRequest(new MessageResponse { Message = "Họ tên không được để trống" });

            // ✅ Validate và update Email (nếu có thay đổi)
            if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
            {
                // Kiểm tra email hợp lệ
                if (!IsValidEmail(request.Email))
                    return BadRequest(new MessageResponse { Message = "Email không hợp lệ" });

                // Kiểm tra email đã tồn tại
                if (await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != userId))
                    return BadRequest(new MessageResponse { Message = "Email đã được sử dụng bởi tài khoản khác" });

                user.Email = request.Email.Trim().ToLower();
            }

            // Update các field khác
            user.FullName = request.FullName.Trim();
            user.PhoneNumber = request.PhoneNumber?.Trim();
            user.Address = request.Address?.Trim();

            await _context.SaveChangesAsync();

            return Ok(new ProfileResponse
            {
                Message = "Cập nhật thông tin thành công",
                User = new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Phone = user.PhoneNumber,
                    Address = user.Address,
                    Role = user.Role?.RoleName ?? "Customer",
                    CreatedAt = user.CreatedAt
                }
            });
        }

        // ✅ POST: api/auth/change-password - Đổi mật khẩu
        [Authorize]
        [HttpPost("change-password")]
        public async Task<ActionResult<MessageResponse>> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new MessageResponse { Message = "Vui lòng đăng nhập" });

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new MessageResponse { Message = "User không tồn tại" });

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return BadRequest(new MessageResponse { Message = "Mật khẩu hiện tại không đúng" });

            // Validate new password
            if (string.IsNullOrEmpty(request.NewPassword) || request.NewPassword.Length < 6)
                return BadRequest(new MessageResponse { Message = "Mật khẩu mới phải có ít nhất 6 ký tự" });

            // Hash and save new password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new MessageResponse { Message = "Đổi mật khẩu thành công" });
        }

        // ✅ POST: api/auth/forgot-password - Quên mật khẩu
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<ActionResult<MessageResponse>> ForgotPassword(ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(new MessageResponse { Message = "Vui lòng nhập email" });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                // Trả về thành công ngay cả khi email không tồn tại (bảo mật)
                return Ok(new MessageResponse { Message = "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." });
            }

            // Tạo reset token
            var resetToken = Guid.NewGuid().ToString("N"); // 32 ký tự hex, không có dấu gạch
            user.ResetToken = resetToken;
            user.ResetTokenExpiry = DateTime.Now.AddMinutes(15);
            await _context.SaveChangesAsync();

            // Tạo link reset password
            var resetLink = $"http://localhost:5173/reset-password?token={resetToken}&email={Uri.EscapeDataString(user.Email)}";

            // Gửi email
            await _emailService.SendPasswordResetAsync(user.Email, user.FullName, resetLink);

            return Ok(new MessageResponse { Message = "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." });
        }

        // ✅ POST: api/auth/reset-password - Đặt lại mật khẩu
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<ActionResult<MessageResponse>> ResetPassword(ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.NewPassword))
                return BadRequest(new MessageResponse { Message = "Thông tin không hợp lệ" });

            if (request.NewPassword.Length < 6)
                return BadRequest(new MessageResponse { Message = "Mật khẩu phải có ít nhất 6 ký tự" });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return BadRequest(new MessageResponse { Message = "Token không hợp lệ hoặc đã hết hạn" });

            // Kiểm tra token
            if (user.ResetToken != request.Token)
                return BadRequest(new MessageResponse { Message = "Token không hợp lệ hoặc đã hết hạn" });

            // Kiểm tra hết hạn
            if (user.ResetTokenExpiry == null || user.ResetTokenExpiry < DateTime.Now)
                return BadRequest(new MessageResponse { Message = "Token đã hết hạn. Vui lòng yêu cầu lại." });

            // Hash mật khẩu mới và cập nhật
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            await _context.SaveChangesAsync();

            return Ok(new MessageResponse { Message = "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới." });
        }

        // Helper: Generate JWT Token
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "Customer")
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(double.Parse(jwtSettings["ExpireMinutes"]!)),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Helper: Get UserId from Token
        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        // Helper: Validate Email format
        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}