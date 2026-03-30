using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace GTG_Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // BẮT BUỘC ÉP ỨNG DỤNG LẮNG NGHE CỔNG 5000 TỪ MỌI IP 
            // (kể cả trên VPS Linux hay Windows)
            builder.WebHost.UseUrls("http://0.0.0.0:5000");

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                });

            // CORS
            var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:5173";
            var origins = frontendUrl.Split(',').Select(u => u.Trim()).ToArray();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins(origins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            // Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // JWT
            var jwtSettings = builder.Configuration.GetSection("Jwt");
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSettings["Key"]!))
                };

                // Đọc JWT từ HttpOnly Cookie nếu không có Authorization header
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var token = context.Request.Cookies["auth_token"]
                                 ?? context.Request.Cookies["admin_token"];
                        if (!string.IsNullOrEmpty(token))
                        {
                            context.Token = token;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // AI Services — Multi-Model (Strategy Pattern)
            builder.Services.AddHttpClient<GTG_Backend.Services.GeminiProvider>();
            builder.Services.AddHttpClient<GTG_Backend.Services.NvidiaProvider>(client =>
            {
                client.Timeout = TimeSpan.FromSeconds(180);
            });
            builder.Services.AddScoped<GTG_Backend.Services.IAiService, GTG_Backend.Services.GeminiProvider>();
            builder.Services.AddScoped<GTG_Backend.Services.IAiService, GTG_Backend.Services.NvidiaProvider>();
            builder.Services.AddScoped<GTG_Backend.Services.AiChatService>();

            // VnPay Payment Service
            builder.Services.AddSingleton<GTG_Backend.Services.VnPayService>();

            // Email Service (gọi Resend REST API trực tiếp)
            builder.Services.AddHttpClient("ResendClient");
            builder.Services.AddTransient<GTG_Backend.Services.EmailService>();

            var app = builder.Build();

            // Cấu hình ForwardedHeaders cho Nginx
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | 
                                   Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto
            });

            //if (app.Environment.IsDevelopment())
            //{
                app.UseSwagger();
                app.UseSwaggerUI();
            //}

            app.UseHttpsRedirection();

            // ✅ Static Files - PHẢI có để serve ảnh
            app.UseStaticFiles();

            // ✅ CORS - trước Authentication
            app.UseCors("AllowFrontend");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            static string MaskSecret(string? value)
            {
                if (string.IsNullOrWhiteSpace(value)) return "EMPTY";
                if (value.Length <= 6) return "***";
                return $"{value[..3]}***{value[^3..]} (len={value.Length})";
            }

            app.Logger.LogInformation("ASPNETCORE_ENVIRONMENT: {Env}", app.Environment.EnvironmentName);
            app.Logger.LogInformation("Gemini:ApiKey => {Value}", MaskSecret(builder.Configuration["Gemini:ApiKey"]));
            app.Logger.LogInformation("Nvidia:ApiKey => {Value}", MaskSecret(builder.Configuration["Nvidia:ApiKey"]));
            app.Logger.LogInformation("VnPay:TmnCode => {Value}", MaskSecret(builder.Configuration["VnPay:TmnCode"]));
            app.Logger.LogInformation("VnPay:HashSecret => {Value}", MaskSecret(builder.Configuration["VnPay:HashSecret"]));
            app.Logger.LogInformation("Resend:ApiKey => {Value}", MaskSecret(builder.Configuration["Resend:ApiKey"]));
            app.Logger.LogInformation("Jwt:Key => {Value}", MaskSecret(builder.Configuration["Jwt:Key"]));

            var conn = builder.Configuration.GetConnectionString("DefaultConnection");
            app.Logger.LogInformation("ConnectionStrings:DefaultConnection => {Status}", string.IsNullOrWhiteSpace(conn) ? "EMPTY" : "OK");

            app.Run();
        }
    }
}
