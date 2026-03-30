using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GTG_Backend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        // Nullable vì user Google không cần password
        public string? PasswordHash { get; set; }

        [Phone]
        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }

        // Google OAuth
        [StringLength(20)]
        public string AuthProvider { get; set; } = "Local"; // "Local" hoặc "Google"

        public string? GoogleId { get; set; }

        // Forgot Password
        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Khóa ngoại liên kết với bảng Role
        [Required]
        public int RoleId { get; set; }

        [ForeignKey("RoleId")]
        public virtual Role? Role { get; set; }

        // Quan hệ với lịch sử Chatbot AI (PI 2.1)
        public virtual ICollection<ChatHistory>? ChatHistories { get; set; }
    }
}
