using System.ComponentModel.DataAnnotations;

namespace GTG_Backend.Models
{
    public class Role
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string RoleName { get; set; } = string.Empty; // Ví dụ: Admin, Customer

        // Quan hệ 1-n: Một quyền có thể thuộc về nhiều người dùng
        public virtual ICollection<User>? Users { get; set; }
    }
}
