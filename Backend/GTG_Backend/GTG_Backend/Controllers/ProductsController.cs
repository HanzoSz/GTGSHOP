using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using GTG_Backend;
using GTG_Backend.Models;
using GTG_Backend.DTOs;

namespace GTG_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Mapping slug -> category names
        private static readonly Dictionary<string, string[]> CategoryMapping = 
            new(StringComparer.OrdinalIgnoreCase)
        {
            { "cpu", new[] { "CPU", "CPU - Bộ vi xử lý", "Bộ vi xử lý", "Processor" } },
            { "vga", new[] { "VGA", "VGA - Card đồ họa", "Card đồ họa", "GPU" } },
            { "mainboard", new[] { "Mainboard", "Bo mạch chủ", "Motherboard" } },
            { "ram", new[] { "RAM", "Bộ nhớ", "Memory" } },
            { "ssd", new[] { "SSD", "SSD / HDD", "HDD", "Ổ cứng", "Storage" } },
            { "case", new[] { "Case", "Case PC", "Vỏ case", "Thùng máy" } },
            { "psu", new[] { "PSU", "Nguồn PSU", "Nguồn", "Power Supply" } },
            { "cooling", new[] { "Cooling", "Tản nhiệt", "Cooler", "Fan" } }
        };

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        // GET: api/products?search=i9&limit=6&categoryId=1
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetProducts(
            [FromQuery] string? search = null,
            [FromQuery] int? limit = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] string? categorySlug = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sort = null)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var query = _context.Products
                .Include(p => p.Category)
                .AsQueryable();

            // ✅ FILTER BY CATEGORY ID
            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            // ✅ FILTER BY CATEGORY SLUG
            if (!string.IsNullOrWhiteSpace(categorySlug))
            {
                var catId = await GetCategoryIdBySlug(categorySlug);
                if (catId.HasValue)
                {
                    query = query.Where(p => p.CategoryId == catId.Value);
                }
            }

            // ✅ SEARCH
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTerm = search.ToLower().Trim();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(searchTerm) ||
                    (p.Description != null && p.Description.ToLower().Contains(searchTerm))
                );
            }

            // Filter by price
            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);
            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            // Sort
            query = sort switch
            {
                "price-asc" => query.OrderBy(p => p.Price),
                "price-desc" => query.OrderByDescending(p => p.Price),
                "rating" => query.OrderByDescending(p => p.Rating),
                "newest" => query.OrderByDescending(p => p.Id),
                "name" => query.OrderBy(p => p.Name),
                _ => query.OrderByDescending(p => p.Id)
            };

            // Limit
            if (limit.HasValue && limit.Value > 0)
                query = query.Take(limit.Value);

            // ✅ Map response - THÊM imageUrl
            var products = await query.Select(p => new
            {
                id = p.Id,
                name = p.Name,
                price = p.Price,
                originalPrice = p.Discount > 0
                    ? Math.Round(p.Price / (1 - p.Discount / 100m), 0)
                    : (decimal?)null,
                image = p.ImageUrl != null
                    ? (p.ImageUrl.StartsWith("http") ? p.ImageUrl : $"{baseUrl}/{p.ImageUrl.TrimStart('/')}")
                    : null,
                imageUrl = p.ImageUrl != null    // ✅ THÊM FIELD NÀY
                    ? (p.ImageUrl.StartsWith("http") ? p.ImageUrl : $"{baseUrl}/{p.ImageUrl.TrimStart('/')}")
                    : null,
                rating = p.Rating,
                reviews = p.Reviews,
                discount = p.Discount,
                stock = p.Stock,
                inStock = p.Stock > 0,
                categoryId = p.CategoryId,
                categoryName = p.Category != null ? p.Category.Name : null,
                description = p.Description,
                techSpecs = p.TechSpecs
            }).ToListAsync();

            return Ok(products);
        }

        // ✅ GET: api/products/category/{slugOrId}  - Hỗ trợ cả slug và categoryId
        [HttpGet("category/{slugOrId}")]
        public async Task<ActionResult> GetProductsByCategory(
            string slugOrId,
            [FromQuery] int? limit = null,
            [FromQuery] string? sort = null)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            Models.Category? category = null;

            // Nếu là số → tìm trực tiếp theo CategoryId
            if (int.TryParse(slugOrId, out var categoryId))
            {
                category = await _context.Categories.FindAsync(categoryId);
                if (category == null)
                {
                    return NotFound(new { message = $"Category với ID={categoryId} không tồn tại" });
                }
            }
            else
            {
                // Nếu là slug → dùng CategoryMapping
                if (!CategoryMapping.TryGetValue(slugOrId.ToLower(), out var categoryNames))
                {
                    return NotFound(new { message = $"Category '{slugOrId}' không tồn tại" });
                }

                category = await _context.Categories
                    .FirstOrDefaultAsync(c => categoryNames
                        .Any(name => c.Name.ToLower().Contains(name.ToLower()) || 
                                     name.ToLower().Contains(c.Name.ToLower())));

                if (category == null)
                {
                    var allCategories = await _context.Categories.Select(c => c.Name).ToListAsync();
                    return NotFound(new
                    {
                        message = $"Category '{slugOrId}' không tồn tại trong database",
                        availableCategories = allCategories,
                        lookingFor = categoryNames
                    });
                }
            }

            // ✅ LỌC SẢN PHẨM THEO CATEGORY ID
            var query = _context.Products
                .Where(p => p.CategoryId == category.Id)
                .AsQueryable();

            // Sort
            query = sort switch
            {
                "price-asc" => query.OrderBy(p => p.Price),
                "price-desc" => query.OrderByDescending(p => p.Price),
                "rating" => query.OrderByDescending(p => p.Rating),
                "newest" => query.OrderByDescending(p => p.Id),
                _ => query.OrderByDescending(p => p.Id)
            };

            // Limit
            if (limit.HasValue && limit.Value > 0)
                query = query.Take(limit.Value);

            var products = await query.Select(p => new
            {
                id = p.Id,
                name = p.Name,
                price = p.Price,
                originalPrice = p.Discount > 0
                    ? Math.Round(p.Price / (1 - p.Discount / 100m), 0)
                    : (decimal?)null,
                image = p.ImageUrl != null
                    ? (p.ImageUrl.StartsWith("http") ? p.ImageUrl : $"{baseUrl}/{p.ImageUrl.TrimStart('/')}")
                    : null,
                imageUrl = p.ImageUrl != null    // ✅ THÊM FIELD NÀY
                    ? (p.ImageUrl.StartsWith("http") ? p.ImageUrl : $"{baseUrl}/{p.ImageUrl.TrimStart('/')}")
                    : null,
                rating = p.Rating,
                reviews = p.Reviews,
                discount = p.Discount,
                stock = p.Stock,
                inStock = p.Stock > 0,
                categoryId = p.CategoryId,
                categoryName = category.Name,
                description = p.Description
            }).ToListAsync();

            return Ok(new
            {
                category = new { id = category.Id, name = category.Name, slug = slugOrId },
                products,
                total = products.Count
            });
        }

        // ✅ GET: api/products/{id} - Chi tiết sản phẩm
        [HttpGet("{id:int}")]
        public async Task<ActionResult<object>> GetProduct(int id)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound(new { message = "Sản phẩm không tồn tại" });

            // Tính giá gốc từ discount
            decimal? originalPrice = product.Discount > 0
                ? Math.Round(product.Price / (1 - product.Discount / 100m), 0)
                : null;

            // Tạo full image URL
            var fullImageUrl = product.ImageUrl != null
                ? (product.ImageUrl.StartsWith("http") ? product.ImageUrl : $"{baseUrl}/{product.ImageUrl.TrimStart('/')}")
                : null;

            return Ok(new
            {
                id = product.Id,
                name = product.Name,
                description = product.Description,
                price = product.Price,
                originalPrice,
                stock = product.Stock,
                inStock = product.Stock > 0,
                image = fullImageUrl,       // ✅ Giữ field "image"
                imageUrl = fullImageUrl,    // ✅ Thêm field "imageUrl" cho Frontend
                categoryId = product.CategoryId,
                categoryName = product.Category?.Name,
                discount = product.Discount,
                rating = product.Rating,
                reviewCount = product.Reviews,
                techSpecs = product.TechSpecs   // ✅ Thông số kỹ thuật JSON
            });
        }

        // ✅ GET: api/products/sale - Lấy sản phẩm đang giảm giá (có phân trang)
        [HttpGet("sale")]
        public async Task<ActionResult> GetSaleProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] string? sort = null)
        {
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var query = _context.Products
                .Include(p => p.Category)
                .Where(p => p.Discount > 0)
                .AsQueryable();

            // Filter by category
            if (categoryId.HasValue && categoryId.Value > 0)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            // Search
            if (!string.IsNullOrEmpty(search))
            {
                var searchTerm = search.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(searchTerm) ||
                    (p.Description != null && p.Description.ToLower().Contains(searchTerm)));
            }

            var totalItems = await query.CountAsync();

            // Sort
            query = sort switch
            {
                "price-asc" => query.OrderBy(p => p.Price),
                "price-desc" => query.OrderByDescending(p => p.Price),
                "discount-desc" => query.OrderByDescending(p => p.Discount),
                "newest" => query.OrderByDescending(p => p.Id),
                _ => query.OrderByDescending(p => p.Discount) // Mặc định: giảm giá cao nhất
            };

            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    id = p.Id,
                    name = p.Name,
                    price = p.Price,
                    originalPrice = Math.Round(p.Price / (1 - p.Discount / 100m), 0),
                    image = p.ImageUrl != null
                        ? (p.ImageUrl.StartsWith("http") ? p.ImageUrl : $"{baseUrl}/{p.ImageUrl.TrimStart('/')}")
                        : null,
                    imageUrl = p.ImageUrl != null
                        ? (p.ImageUrl.StartsWith("http") ? p.ImageUrl : $"{baseUrl}/{p.ImageUrl.TrimStart('/')}")
                        : null,
                    rating = p.Rating,
                    reviews = p.Reviews,
                    discount = p.Discount,
                    stock = p.Stock,
                    inStock = p.Stock > 0,
                    categoryId = p.CategoryId,
                    categoryName = p.Category != null ? p.Category.Name : null,
                })
                .ToListAsync();

            return Ok(new
            {
                items = products,
                totalItems,
                totalPages,
                currentPage = page,
                pageSize
            });
        }

        // ✅ GET: api/products/{id}/reviews - Lấy danh sách đánh giá
        [HttpGet("{id:int}/reviews")]
        public async Task<ActionResult<ReviewListResponse>> GetProductReviews(int id)
        {
            // Kiểm tra sản phẩm tồn tại
            var productExists = await _context.Products.AnyAsync(p => p.Id == id);
            if (!productExists)
                return NotFound(new { message = "Sản phẩm không tồn tại" });

            var reviews = await _context.ProductReviews
                .Where(r => r.ProductId == id)
                .Include(r => r.User)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewResponse
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.User != null ? r.User.FullName : "Ẩn danh",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    Likes = r.Likes
                })
                .ToListAsync();

            var averageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;

            return Ok(new ReviewListResponse
            {
                Reviews = reviews,
                TotalCount = reviews.Count,
                AverageRating = Math.Round(averageRating, 1)
            });
        }

        // ✅ POST: api/products/{id}/reviews - Thêm đánh giá mới
        [Authorize]
        [HttpPost("{id:int}/reviews")]
        public async Task<ActionResult> CreateReview(int id, [FromBody] CreateReviewRequest request)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { message = "Vui lòng đăng nhập" });

            // Kiểm tra sản phẩm tồn tại
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound(new { message = "Sản phẩm không tồn tại" });

            // Validate rating
            if (request.Rating < 1 || request.Rating > 5)
                return BadRequest(new { message = "Đánh giá phải từ 1-5 sao" });

            // Kiểm tra user đã review chưa
            var existingReview = await _context.ProductReviews
                .FirstOrDefaultAsync(r => r.ProductId == id && r.UserId == userId);

            if (existingReview != null)
                return BadRequest(new { message = "Bạn đã đánh giá sản phẩm này rồi" });

            // Tạo review mới
            var review = new ProductReview
            {
                ProductId = id,
                UserId = userId.Value,
                Rating = request.Rating,
                Comment = request.Comment?.Trim() ?? "",
                CreatedAt = DateTime.Now,
                Likes = 0
            };

            _context.ProductReviews.Add(review);

            // Cập nhật rating và reviewCount của product
            var allRatings = await _context.ProductReviews
                .Where(r => r.ProductId == id)
                .Select(r => r.Rating)
                .ToListAsync();

            allRatings.Add(request.Rating);

            product.Rating = Math.Round(allRatings.Average(), 1);
            product.Reviews = allRatings.Count;

            await _context.SaveChangesAsync();

            // Lấy thông tin user
            var user = await _context.Users.FindAsync(userId);

            return Ok(new
            {
                message = "Đánh giá thành công",
                review = new ReviewResponse
                {
                    Id = review.Id,
                    UserId = review.UserId,
                    UserName = user?.FullName ?? "Ẩn danh",
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt,
                    Likes = 0
                }
            });
        }

        // ✅ PUT: api/products/{id}/reviews/{reviewId}/like - Like đánh giá
        [Authorize]
        [HttpPut("{id:int}/reviews/{reviewId:int}/like")]
        public async Task<ActionResult> LikeReview(int id, int reviewId)
        {
            var review = await _context.ProductReviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.ProductId == id);

            if (review == null)
                return NotFound(new { message = "Đánh giá không tồn tại" });

            review.Likes++;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã thích đánh giá", likes = review.Likes });
        }

        // ✅ DELETE: api/products/{id}/reviews/{reviewId} - Xóa đánh giá (chỉ owner)
        [Authorize]
        [HttpDelete("{id:int}/reviews/{reviewId:int}")]
        public async Task<ActionResult> DeleteReview(int id, int reviewId)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var review = await _context.ProductReviews
                .FirstOrDefaultAsync(r => r.Id == reviewId && r.ProductId == id);

            if (review == null)
                return NotFound(new { message = "Đánh giá không tồn tại" });

            if (review.UserId != userId)
                return Forbid();

            _context.ProductReviews.Remove(review);

            // Cập nhật lại rating của product
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                var remainingRatings = await _context.ProductReviews
                    .Where(r => r.ProductId == id && r.Id != reviewId)
                    .Select(r => r.Rating)
                    .ToListAsync();

                product.Rating = remainingRatings.Any() ? Math.Round(remainingRatings.Average(), 1) : 0;
                product.Reviews = remainingRatings.Count;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa đánh giá" });
        }

        // Helper methods
        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        private async Task<int?> GetCategoryIdBySlug(string slug)
        {
            if (!CategoryMapping.TryGetValue(slug.ToLower(), out var categoryNames))
                return null;

            var category = await _context.Categories
                .FirstOrDefaultAsync(c => categoryNames
                    .Any(name => c.Name.ToLower().Contains(name.ToLower())));

            return category?.Id;
        }

        // PUT, POST, DELETE giữ nguyên...
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id) return BadRequest();
            _context.Entry(product).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Products.Any(e => e.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetProduct", new { id = product.Id }, product);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
