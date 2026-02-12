namespace GTG_Backend.DTOs
{
    // Request DTOs
    public class CreateReviewRequest
    {
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    // Response DTOs
    public class ProductDetailResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int Stock { get; set; }
        public bool InStock { get; set; }
        public string? Image { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int Discount { get; set; }
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
    }

    public class ReviewResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int Likes { get; set; }
    }

    public class ReviewListResponse
    {
        public List<ReviewResponse> Reviews { get; set; } = new();
        public int TotalCount { get; set; }
        public double AverageRating { get; set; }
    }
}