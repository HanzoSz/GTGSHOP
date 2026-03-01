using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GTG_Backend.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(20)]
        public string OrderCode { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "pending";

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingFee { get; set; }

        [Required]
        [StringLength(20)]
        public string PaymentMethod { get; set; } = "cod";

        // Shipping Info
        [Required]
        [StringLength(100)]
        public string ShippingFullName { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string ShippingPhone { get; set; } = string.Empty;

        [StringLength(100)]
        public string? ShippingEmail { get; set; }  // ✅ Thêm lại

        [Required]
        [StringLength(255)]
        public string ShippingAddress { get; set; } = string.Empty;

        [StringLength(100)]
        public string? ShippingCity { get; set; }

        [StringLength(100)]
        public string? ShippingDistrict { get; set; }

        [StringLength(100)]
        public string? ShippingWard { get; set; }

        public string? Note { get; set; }

        // ✅ Thêm lý do hủy
        public string? CancelReason { get; set; }

        [StringLength(20)]
        public string PaymentStatus { get; set; } = "unpaid"; // unpaid, paid, failed

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        public virtual ICollection<OrderItem>? OrderItems { get; set; }
    }
}