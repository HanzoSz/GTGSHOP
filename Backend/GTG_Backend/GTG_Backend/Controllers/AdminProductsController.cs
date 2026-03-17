using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GTG_Backend.DTOs;
using GTG_Backend.Models;

namespace GTG_Backend.Controllers
{
    [Route("api/admin/products")]
    [ApiController]
    [Authorize]
    public class AdminProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/products
        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<ProductListDto>>> GetProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] string? status = null)
        {
            var query = _context.Products.Include(p => p.Category).AsQueryable();

            if (!string.IsNullOrEmpty(search))
                query = query.Where(p => p.Name.Contains(search));

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            if (!string.IsNullOrEmpty(status))
            {
                if (status == "instock") query = query.Where(p => p.Stock > 10);
                else if (status == "low") query = query.Where(p => p.Stock > 0 && p.Stock <= 10);
                else if (status == "outofstock") query = query.Where(p => p.Stock == 0);
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var items = await query
                .OrderByDescending(p => p.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new ProductListDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Stock = p.Stock,
                    Description = p.Description ?? string.Empty,   // fix CS8601
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                    ImageUrl = p.ImageUrl ?? string.Empty,         // fix CS8601
                    Discount = p.Discount,
                    Rating = p.Rating,
                    Reviews = p.Reviews
                })
                .ToListAsync();

            return Ok(new PaginatedResponse<ProductListDto>
            {
                Items = items,
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = page,
                PageSize = pageSize
            });
        }

        // POST: api/admin/products
        [HttpPost]
        public async Task<ActionResult<ProductListDto>> CreateProduct(ProductCreateDto dto)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Tên sản phẩm không được để trống" });
            if (dto.Price <= 0)
                return BadRequest(new { message = "Giá phải lớn hơn 0" });
            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null)
                return BadRequest(new { message = "Danh mục không tồn tại" });

            var product = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Stock = dto.Stock,
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                ImageUrl = dto.ImageUrl,
                Discount = dto.Discount,
                Rating = 0,
                Reviews = 0
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(new ProductListDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                Stock = product.Stock,
                Description = product.Description,
                CategoryId = product.CategoryId,
                CategoryName = category.Name,
                ImageUrl = product.ImageUrl,
                Discount = product.Discount,
                Rating = product.Rating,
                Reviews = product.Reviews
            });
        }

        // PUT: api/admin/products/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ProductListDto>> UpdateProduct(int id, ProductCreateDto dto)
        {
            var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
            if (product == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm" });

            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null)
                return BadRequest(new { message = "Danh mục không tồn tại" });

            product.Name = dto.Name;
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.Description = dto.Description;
            product.CategoryId = dto.CategoryId;
            product.ImageUrl = dto.ImageUrl;
            product.Discount = dto.Discount;

            await _context.SaveChangesAsync();

            return Ok(new ProductListDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                Stock = product.Stock,
                Description = product.Description,
                CategoryId = product.CategoryId,
                CategoryName = category.Name,
                ImageUrl = product.ImageUrl,
                Discount = product.Discount,
                Rating = product.Rating,
                Reviews = product.Reviews
            });
        }

        // DELETE: api/admin/products/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm" });

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/admin/products/upload-image
        [HttpPost("upload-image")]
        [Authorize]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Chưa chọn file" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var ext = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(ext))
                return BadRequest(new { message = "Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)" });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "File không được vượt quá 5MB" });

            var fileName = $"{Guid.NewGuid()}{ext}";
            var uploadPath = Path.Combine("wwwroot", "images", "products");
            Directory.CreateDirectory(uploadPath);
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Trả về đường dẫn tương đối để lưu vào DB
            return Ok(new { imageUrl = $"images/products/{fileName}" });
        }
    }
}