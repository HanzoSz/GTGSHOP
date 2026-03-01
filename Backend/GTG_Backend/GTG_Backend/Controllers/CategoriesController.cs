using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GTG_Backend.Models;

namespace GTG_Backend.Controllers
{
    [Route("api/categories")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<ActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    ProductCount = _context.Products.Count(p => p.CategoryId == c.Id)
                })
                .ToListAsync();
            return Ok(categories);
        }

        // GET: api/categories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Category không tồn tại" });

            return Ok(new
            {
                category.Id,
                category.Name,
                ProductCount = await _context.Products.CountAsync(p => p.CategoryId == id)
            });
        }

        // POST: api/categories
        [HttpPost]
        public async Task<ActionResult> CreateCategory([FromBody] CategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Tên danh mục không được để trống" });

            // Kiểm tra trùng tên
            var exists = await _context.Categories.AnyAsync(c => c.Name.ToLower() == dto.Name.Trim().ToLower());
            if (exists)
                return BadRequest(new { message = "Danh mục này đã tồn tại" });

            var category = new Category
            {
                Name = dto.Name.Trim()
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tạo danh mục thành công",
                category = new { category.Id, category.Name }
            });
        }

        // PUT: api/categories/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateCategory(int id, [FromBody] CategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Tên danh mục không được để trống" });

            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Category không tồn tại" });

            // Kiểm tra trùng tên (trừ chính nó)
            var exists = await _context.Categories.AnyAsync(c => c.Id != id && c.Name.ToLower() == dto.Name.Trim().ToLower());
            if (exists)
                return BadRequest(new { message = "Tên danh mục đã tồn tại" });

            category.Name = dto.Name.Trim();
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật danh mục thành công",
                category = new { category.Id, category.Name }
            });
        }

        // DELETE: api/categories/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Category không tồn tại" });

            // Kiểm tra có sản phẩm trong danh mục không
            var productCount = await _context.Products.CountAsync(p => p.CategoryId == id);
            if (productCount > 0)
                return BadRequest(new { message = $"Không thể xoá! Danh mục đang có {productCount} sản phẩm." });

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xoá danh mục thành công" });
        }
    }

    public class CategoryDto
    {
        public string Name { get; set; } = string.Empty;
    }
}