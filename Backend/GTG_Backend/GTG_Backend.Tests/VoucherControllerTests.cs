using System.Reflection;
using System.Security.Claims;
using GTG_Backend.Controllers;
using GTG_Backend.Models;
using GTG_Backend.Tests.TestHelpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Tests;

public class VoucherControllerTests
{
    [Fact]
    public async Task ClaimVoucher_Should_CreateVoucher_ForFirstTimeUser()
    {
        using var context = TestDbContextFactory.Create();
        context.Users.Add(new User
        {
            Id = 1,
            FullName = "Test User",
            Email = "u1@test.com",
            PasswordHash = "hash",
            RoleId = 1
        });
        await context.SaveChangesAsync();

        var controller = new VouchersController(context);
        SetUser(controller, 1);

        var result = await controller.ClaimVoucher();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, ok.StatusCode ?? 200);

        var voucher = await context.Vouchers.FirstOrDefaultAsync(v => v.UserId == 1);
        Assert.NotNull(voucher);
        Assert.StartsWith("GTG-", voucher!.Code);
        Assert.InRange(voucher.DiscountPercent, 5, 20);
        Assert.False(voucher.IsUsed);
    }

    [Fact]
    public async Task ClaimVoucher_Should_ReturnConflict_WhenUserAlreadyHasVoucher()
    {
        using var context = TestDbContextFactory.Create();
        context.Vouchers.Add(new Voucher
        {
            UserId = 2,
            Code = "GTG-ABC123",
            DiscountPercent = 10,
            IsUsed = false
        });
        await context.SaveChangesAsync();

        var controller = new VouchersController(context);
        SetUser(controller, 2);

        var result = await controller.ClaimVoucher();

        var conflict = Assert.IsType<ConflictObjectResult>(result);
        var message = GetProperty<string>(conflict.Value!, "message");
        Assert.Equal("Bạn đã nhận voucher rồi", message);
    }

    [Fact]
    public async Task ValidateVoucher_Should_ReturnValidFalse_ForUsedVoucher()
    {
        using var context = TestDbContextFactory.Create();
        context.Vouchers.Add(new Voucher
        {
            UserId = 3,
            Code = "GTG-USED01",
            DiscountPercent = 12,
            IsUsed = true
        });
        await context.SaveChangesAsync();

        var controller = new VouchersController(context);
        SetUser(controller, 3);

        var result = await controller.ValidateVoucher(new ValidateVoucherRequest { Code = "GTG-USED01" });

        var ok = Assert.IsType<OkObjectResult>(result);
        var valid = GetProperty<bool>(ok.Value!, "valid");
        Assert.False(valid);
    }

    private static void SetUser(ControllerBase controller, int userId)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        ], "TestAuth"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }

    private static T GetProperty<T>(object source, string propertyName)
    {
        var prop = source.GetType().GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.IgnoreCase);
        Assert.NotNull(prop);
        return (T)prop!.GetValue(source)!;
    }
}
