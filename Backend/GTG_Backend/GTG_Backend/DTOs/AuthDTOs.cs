namespace GTG_Backend.DTOs
{
    // ========== Request DTOs ==========
    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    // ✅ Thêm DTO cho Profile
    public class UpdateProfileRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }         // ✅ Thêm Email
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    // ========== Response DTOs ==========
    public class AuthResponse
    {
        public string? Token { get; set; }   // <-- đổi sang nullable
        public UserDto User { get; set; } = null!;
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class MessageResponse
    {
        public string Message { get; set; } = string.Empty;
    }

    public class ProfileResponse
    {
        public string Message { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }
}