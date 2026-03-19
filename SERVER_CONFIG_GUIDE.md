# Hướng dẫn cấu hình Server khi Server Frontend và Backend Khác Nhau

Khi bạn triển khai Frontend (FE) và Backend (BE) lên 2 server khác nhau (khác domain hoặc khác port), điều quan trọng nhất là bạn đang giao tiếp **Cross-Origin** (khác nguồn gốc). 

Dựa vào mã nguồn backend hiện tại của bạn, dưới đây là chi tiết những thứ bạn **bắt buộc phải cấu hình lại trong Backend** để hệ thống có thể hoạt động được.

## 1. Cấu hình CORS (Bắt buộc)
Hiện tại trong `Program.cs` file của bạn đang hardcode (gắn cứng) domain của React ở local là `http://localhost:5173`. Bạn cần thay thế nó bằng URL thực tế của Frontend khi lên production.

*Bạn nên chuyển URL này vào `appsettings.json` để dễ quản lý theo từng môi trường:*

**Trong `appsettings.json` (thêm cấu hình FrontendUrl):**
```json
{
  "FrontendUrl": "https://domain-frontend-cua-ban.com",
  // ... các cấu hình khác
}
```

**Trong `Program.cs` (Sửa lại phần CORS):**
```csharp
var frontendUrl = builder.Configuration["FrontendUrl"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(frontendUrl) // Đọc từ appsettings thay vì gõ cứng
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Bắt buộc cho việc gửi Cookie chéo domain
    });
});
```

## 2. Yêu cầu về HTTPS & Cookies (Rất Quan Trọng)
Trong file `AuthController.cs`, bạn đang thiết lập Cookie JWT như sau:
```csharp
SameSite = SameSiteMode.None,
Secure = true,
```
Vì FE và BE nằm ở 2 domain khác nhau, **trình duyệt chỉ cho phép gửi Cookie chéo domain (Cross-Site) nếu Cookie đó có cờ `Secure = true` và `SameSite = None` (như hệ thống hiện tại đang làm)**. 

👉 **Lưu ý đặc biệt quan trọng:** Cờ `Secure = true` yêu cầu Backend của bạn **BẮT BUỘC PHẢI CHẠY TRÊN HTTPS** (có chứng chỉ SSL hợp lệ). Nếu server BE chỉ chạy trên HTTP, trình duyệt (đặc biệt là Chrome/Edge/Safari) sẽ tự động từ chối lưu và gửi đi dòng Cookie này, dẫn đến việc người dùng không thể đăng nhập hoặc bị báo lỗi 401 Unauthorized liên tục dù đã login đúng.

## 3. Sửa lại các URL bị gõ cứng (Hardcode)
Trong `AuthController.cs` ở hàm **`ForgotPassword`** (chức năng quên mật khẩu), domain local của frontend đang bị gắn cứng:
```csharp
var resetLink = $"http://localhost:5173/reset-password?token={resetToken}&email={Uri.EscapeDataString(user.Email)}";
```
👉 Bạn cần thay đổi đoạn này để lấy URL từ cấu hình thay vì viết cố định:
```csharp
var frontendUrl = _configuration["FrontendUrl"];
var resetLink = $"{frontendUrl}/reset-password?token={resetToken}&email={Uri.EscapeDataString(user.Email)}";
```

## 4. Cấu hình các thiết lập biến môi trường (Production)
Hãy tạo một file `appsettings.Production.json` trên server (hoặc thiết lập System Environment Variables) để cấu hình các giá trị thực tế của môi trường chạy.

Đừng quên thay đổi những giá trị sau:
* **`ConnectionStrings:DefaultConnection`**: Đổi IP từ `localhost` thành IP kết nối của Database Server. Đảm bảo user sa/password đều đúng.
* **`Jwt:Audience` / `Jwt:Issuer`**: Khớp với URL hệ thống thật của bạn.
* **`VnPay:ReturnUrl`**: Đừng quên đổi `https://your-domain.com/api/payment/vnpay/callback` trong cấu hình thành URL Public thật của backend ở ngoài internet.

---

### 💡 Lưu ý nhỏ phía Frontend:
Trong mã nguồn Frontend React/NextJS của bạn, đối với các thư viện gọi API bằng `axios` hoặc `fetch`, hãy đảm bảo:
1. Base URL khi khởi tạo Axios hoặc gọi API đều trỏ về địa chỉ public (domain/IP internet) của backend.
2. **Gọi API luôn phải đi kèm config `withCredentials: true`** để trình duyệt chấp nhận việc đính kèm các `auth_token` Cookie vào các HTTP request gửi lên cho server cross-domain bảo vệ.
