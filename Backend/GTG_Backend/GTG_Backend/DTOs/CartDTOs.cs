namespace GTG_Backend.DTOs
{
    // Response DTOs
    public class CartResponse
    {
        public List<CartItemDto> Items { get; set; } = new();
    }

    public class CartItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Image { get; set; }
        public int Quantity { get; set; }
        public int Stock { get; set; }
    }

    // Request DTOs
    public class SyncCartRequest
    {
        public List<SyncCartItem> Items { get; set; } = new();
    }

    public class SyncCartItem
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class SyncCartResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
    }
}