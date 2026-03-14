using GTG_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<ChatHistory> ChatHistories { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<ProductReview> ProductReviews { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // === UNIQUE INDEXES ===
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Order>()
                .HasIndex(o => o.OrderCode)
                .IsUnique();

            modelBuilder.Entity<Voucher>()
                .HasIndex(v => v.Code)
                .IsUnique();

            // === COMPOSITE INDEX ===
            // Mỗi user chỉ wishlist 1 sản phẩm 1 lần
            modelBuilder.Entity<WishlistItem>()
                .HasIndex(w => new { w.UserId, w.ProductId })
                .IsUnique();

            // === DECIMAL PRECISION ===
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(o => o.ShippingFee).HasColumnType("decimal(18,2)");
                entity.Property(o => o.DiscountAmount).HasColumnType("decimal(18,2)");
            });

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.Price)
                .HasColumnType("decimal(18,2)");
                

            // === CASCADE DELETE ===
            // Xóa Order → xóa luôn OrderItems
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order) // Sửa ở đây: Chỉ định rõ thuộc tính Order trong OrderItem
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Xóa Cart → xóa luôn CartItems
            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.Cart) // Sửa ở đây: Chỉ định rõ thuộc tính Cart trong CartItem
                .WithMany(c => c.CartItems)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            // === PERFORMANCE INDEXES ===
            modelBuilder.Entity<Order>()
                .HasIndex(o => o.UserId);

            modelBuilder.Entity<OrderItem>()
                .HasIndex(oi => oi.OrderId);

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.CategoryId);
        }
    }
}
