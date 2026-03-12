namespace GTG_Backend.DTOs
{
    // ========== Request DTOs ==========
    public class CreateOrderRequest
    {
        public List<OrderItemRequest> Items { get; set; } = new();
        public string ShippingFullName { get; set; } = string.Empty;
        public string ShippingPhone { get; set; } = string.Empty;
        public string? ShippingEmail { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
        public string? ShippingCity { get; set; }
        public string? ShippingDistrict { get; set; }
        public string? ShippingWard { get; set; }
        public string? Note { get; set; }
        public string PaymentMethod { get; set; } = "cod";
        public decimal TotalAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public string? VoucherCode { get; set; }
    }

    public class OrderItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

    public class CancelOrderRequest
    {
        public string? Reason { get; set; }
    }

    // ========== Response DTOs ==========
    public class CreateOrderResponse
    {
        public int Id { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? PaymentUrl { get; set; }
    }

    public class OrderResponse
    {
        public int Id { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string StatusText { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        
        // Shipping info - flat
        public string ShippingFullName { get; set; } = string.Empty;
        public string ShippingPhone { get; set; } = string.Empty;
        public string? ShippingEmail { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
        public string? ShippingCity { get; set; }
        public string? ShippingDistrict { get; set; }
        public string? ShippingWard { get; set; }
        public string? Note { get; set; }
        public string? VoucherCode { get; set; }
        public decimal DiscountAmount { get; set; }

        public List<OrderItemResponse> Items { get; set; } = new();
    }

    public class OrderItemResponse
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImage { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}