# Hướng Dẫn Cấu Hình Biến Môi Trường (Environment Variables)

Dự án sử dụng cơ chế đọc biến môi trường để nạp `appsettings.json`. Điều này rất hữu ích để bảo mật hệ thống khi triển khai (deploy).
Các key cấu hình gốc ở backend của bạn tương ứng với các biến môi trường sau (dùng dấu hai chấm `:` hoặc hai gạch dưới `__` tùy hệ điều hành):

## Danh Sách Cấu Hình Cần Thiết

| AppSettings Key               | Key Biến Môi Trường (Windows/Linux)      | Mô Tả                                      |
| ----------------------------- | ---------------------------------------- | ------------------------------------------ |
| `Gemini:ApiKey`               | `Gemini__ApiKey`                         | API Key của Google Gemini                  |
| `Nvidia:ApiKey`               | `Nvidia__ApiKey`                         | API Key của NVIDIA NIM                     |
| `VnPay:TmnCode`               | `VnPay__TmnCode`                         | Terminal ID của VNPAY (VD: `RN538HVN`)     |
| `VnPay:HashSecret`            | `VnPay__HashSecret`                      | Khóa bí mật hash dữ liệu của VNPAY         |
| `Resend:ApiKey`               | `Resend__ApiKey`                         | API Key của Resend (gửi email tự động)     |
| `Jwt:Key`                     | `Jwt__Key`                               | Secret Key dùng để ký token JWT (Tối thiểu 32 ký tự) |
| `ConnectionStrings:DefaultConnection` | `ConnectionStrings__DefaultConnection` | Chuỗi kết nối Database SQL Server          |

*(Lưu ý: Hầu hết các hệ điều hành hỗ trợ dấu gạch dưới kép `__` thay cho dấu hai chấm `:` để duyệt cấp độ cấu hình JSON).*

---

## 🪟 1. Cấu Hình Trên Windows

### A. Dùng Command Prompt (cmd)
Mở cửa sổ `cmd` và chạy các lệnh `setx` sau để lưu vĩnh viễn:

```cmd
setx Gemini__ApiKey "YOUR_GEMINI_API_KEY"
setx Nvidia__ApiKey "YOUR_NVDIA_API_KEY"
setx VnPay__TmnCode "RN538HVN"
setx VnPay__HashSecret "YOUR_VNPAY_HASH_SECRET"
setx Resend__ApiKey "YOUR_RESEND_API_KEY"
setx Jwt__Key "YOUR_JWT_SECRET_KEY_MUST_BE_MIN_32_CHARS"
```
*(Yêu cầu phải Reset lại Visual Studio code, Terminal hoặc máy tính nếu biến chưa được nhận ngay).*

### B. Dùng PowerShell (Cục bộ thời gian thực cho phiên đó)
```powershell
$env:Gemini__ApiKey="YOUR_GEMINI_API_KEY"
$env:Nvidia__ApiKey="YOUR_NVDIA_API_KEY"
$env:VnPay__TmnCode="RN538HVN"
$env:VnPay__HashSecret="YOUR_VNPAY_HASH_SECRET"
```

### C. Dùng Visual Studio (Hồ sơ Launch Settings)
Nếu bạn chạy backend bằng Visual Studio 2022:
1. Mở file `Properties\launchSettings.json`.
2. Trong profile đang chạy (VD: `GTG_Backend`), tìm `environmentVariables`.
3. Khai báo các biến như sau:
   ```json
   "environmentVariables": {
     "ASPNETCORE_ENVIRONMENT": "Development",
     "Gemini:ApiKey": "YOUR_KEY",
     "Nvidia:ApiKey": "YOUR_KEY",
     "VnPay:TmnCode": "RN538HVN",
     "VnPay:HashSecret": "YOUR_KEY"
   }
   ```

---

## 🐧 2. Cấu Hình Trên Linux (Ubuntu/Debian/CentOS)

Trên Linux, tên biến môi trường không nhận dấu hai chấm `:`. BẮT BUỘC phải thay bằng 2 dấu gạch dưới `__`.

### A. Xuất biến môi trường thời gian thực (Terminal đang mở)
```bash
export Gemini__ApiKey="YOUR_GEMINI_API_KEY"
export Nvidia__ApiKey="YOUR_NVDIA_API_KEY"
export VnPay__TmnCode="RN538HVN"
export VnPay__HashSecret="YOUR_VNPAY_HASH_SECRET"
export Resend__ApiKey="YOUR_RESEND_API_KEY"
export Jwt__Key="YOUR_JWT_SECRET_KEY_MUST_BE_MIN_32_CHARS"
```

### B. Xuất biến vĩnh viễn cho máy chủ (Production Server)

Mở file thiết lập môi trường hệ thống:
```bash
sudo nano /etc/environment
```
Và thêm nội dung vào cuối file:
```ini
Gemini__ApiKey="YOUR_GEMINI_API_KEY"
Nvidia__ApiKey="YOUR_NVDIA_API_KEY"
VnPay__TmnCode="RN538HVN"
VnPay__HashSecret="YOUR_VNPAY_HASH_SECRET"
Resend__ApiKey="YOUR_RESEND_API_KEY"
Jwt__Key="YOUR_JWT_SECRET_KEY"
ConnectionStrings__DefaultConnection="Server=localhost;Database=GTG_LinhKienPC;User Id=sa;Password=my123Password;TrustServerCertificate=True"
```
Lưu lại (Ctrl+O, Enter) và thoát (Ctrl+X). Áp dụng thay đổi:
```bash
source /etc/environment
```

### C. Khi chạy file bằng service systemd (Cho server Ubuntu NGINX/Apache)
Nếu bạn deploy .NET Core bằng `systemd`, bạn sẽ nạp biến nằm trong file cấu hình `.service`:

```bash
sudo nano /etc/systemd/system/gtg-backend.service
```

Thêm trực tiếp vào dưới từ khóa `[Service]`:
```ini
[Service]
WorkingDirectory=/var/www/gtg-backend
ExecStart=/usr/bin/dotnet /var/www/gtg-backend/GTG_Backend.dll
Restart=always

Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=Gemini__ApiKey=YOUR_GEMINI_API_KEY
Environment=Nvidia__ApiKey=YOUR_NVDIA_API_KEY
Environment=VnPay__TmnCode=RN538HVN
Environment=VnPay__HashSecret=YOUR_VNPAY_HASH_SECRET
```
Sau đó khởi động lại app:
```bash
sudo systemctl daemon-reload
sudo systemctl restart gtg-backend.service
```

---

## 🌍 3. Cách Đổi Môi Trường (Development sang Production / Staging)

Trong ASP.NET Core, môi trường (Environment) được quyết định hoàn toàn bởi biến môi trường có tên là **`ASPNETCORE_ENVIRONMENT`**.

Nếu không khai báo biến này, ứng dụng sẽ mặc định chạy ở chế độ **Production**.

Các giá trị môi trường thường dùng:
- `Development`: Dùng khi đang code (hiện lỗi chi tiết màn hình vàng Swagger, kết nối database local).
- `Production`: Dùng khi đưa lên live thực tế ở server khách hàng (che lỗi thật, ưu tiên hiệu năng).
- `Staging`: Môi trường kiểm thử (test) có cấu hình gần giống Production nhất.

### Cách cấu hình để chuyển môi trường:

**Trên Windows (cmd):**
```cmd
setx ASPNETCORE_ENVIRONMENT "Production"
```

**Trên Linux (export tạm thời lúc chạy tay):**
```bash
export ASPNETCORE_ENVIRONMENT="Production"
dotnet /path/to/GTG_Backend.dll
```

**Trên Linux (Systemd Service / Chạy thực tế):**
Bạn sửa file service của bạn như đã hướng dẫn ở mục 2C, đảm bảo có dòng:
```ini
Environment=ASPNETCORE_ENVIRONMENT=Production
```

**Trong Docker (docker-compose.yml):**
```yaml
environment:
  - ASPNETCORE_ENVIRONMENT=Production
```

Khi đổi môi trường thành `Production`, ứng dụng sẽ tự động ưu tiên nạp file cấu hình theo tên tương ứng: `appsettings.Production.json` (nếu có) chồng lên `appsettings.json` gốc, bỏ qua file `appsettings.Development.json`.
