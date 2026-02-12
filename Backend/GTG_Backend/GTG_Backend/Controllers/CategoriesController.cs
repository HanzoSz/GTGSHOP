using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Controllers
{
    [Route("api/[controller]")]
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
                    slug = c.Name.ToLower()
                        .Replace("cpu - bộ vi xử lý", "cpu")
                        .Replace("vga - card đồ họa", "vga")
                        .Replace("ssd / hdd", "ssd")
                        .Replace("case pc", "case")
                        .Replace("nguồn psu", "psu")
                        .Replace("tản nhiệt", "cooling")
                        .Replace(" ", "-"),
                    productCount = _context.Products.Count(p => p.CategoryId == c.Id)
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
                productCount = await _context.Products.CountAsync(p => p.CategoryId == id)
            });
        }
    }
}