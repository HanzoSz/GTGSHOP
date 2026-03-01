using System.ComponentModel.DataAnnotations.Schema;

namespace GTG_Backend.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int CategoryId { get; set; }
        public virtual Category? Category { get; set; }
        public double Rating { get; set; } = 5.0;
        public int Reviews { get; set; } = 0;
        public int Discount { get; set; } = 0;
        public string? TechSpecs { get; set; }
    }
}
