using System.Reflection;
using GTG_Backend.Controllers;
using GTG_Backend.Models;
using GTG_Backend.Tests.TestHelpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Tests;

public class AdminProductsControllerTests
{
    [Fact]
    public async Task GetProducts_Should_FilterByStatusLow_AndPaginate()
    {
        using var context = TestDbContextFactory.Create();
        context.Categories.Add(new Category { Id = 1, Name = "CPU" });
        context.Products.AddRange(
            new Product { Id = 1, Name = "P1", Price = 100, Stock = 20, CategoryId = 1, Discount = 0, Rating = 0, Reviews = 0 },
            new Product { Id = 2, Name = "P2", Price = 100, Stock = 5, CategoryId = 1, Discount = 0, Rating = 0, Reviews = 0 },
            new Product { Id = 3, Name = "P3", Price = 100, Stock = 0, CategoryId = 1, Discount = 0, Rating = 0, Reviews = 0 }
        );
        await context.SaveChangesAsync();

        var controller = new AdminProductsController(context);

        var result = await controller.GetProducts(page: 1, pageSize: 10, status: "low");

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var totalItems = GetProperty<int>(ok.Value!, "totalItems");
        var itemsObj = GetProperty<object>(ok.Value!, "items");

        Assert.Equal(1, totalItems);
        var enumerable = Assert.IsAssignableFrom<System.Collections.IEnumerable>(itemsObj);
        Assert.Single(enumerable.Cast<object>());
    }

    [Fact]
    public async Task CreateProduct_Should_ReturnBadRequest_WhenCategoryNotFound()
    {
        using var context = TestDbContextFactory.Create();
        var controller = new AdminProductsController(context);

        var dto = new ProductCreateDto
        {
            Name = "CPU Test",
            Price = 1000,
            Stock = 10,
            Description = "desc",
            CategoryId = 999,
            ImageUrl = "images/products/x.jpg",
            Discount = 0
        };

        var result = await controller.CreateProduct(dto);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task DeleteProduct_Should_ReturnNoContent_WhenDeleted()
    {
        using var context = TestDbContextFactory.Create();
        context.Products.Add(new Product
        {
            Id = 10,
            Name = "Delete Me",
            Price = 100,
            Stock = 1,
            CategoryId = 1
        });
        await context.SaveChangesAsync();

        var controller = new AdminProductsController(context);

        var result = await controller.DeleteProduct(10);

        Assert.IsType<NoContentResult>(result);
        Assert.False(await context.Products.AnyAsync(p => p.Id == 10));
    }

    private static T GetProperty<T>(object source, string propertyName)
    {
        var prop = source.GetType().GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.IgnoreCase);
        Assert.NotNull(prop);
        return (T)prop!.GetValue(source)!;
    }
}
