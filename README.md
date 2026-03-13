# GTGSHOP – PC Parts E‑Commerce (Fullstack)

GTGSHOP là hệ thống **bán linh kiện PC** (Fullstack) gồm:
- **Frontend**: React + TypeScript + Vite + TailwindCSS  
- **Backend**: ASP.NET Core Web API + Entity Framework Core  
- **Database**: SQL Server  
- Tích hợp: **VNPay**, **Email (Resend)**, **AI Chat (Gemini)**

---

## 1) Tính năng chính

### Người dùng (Client)
- Đăng ký / Đăng nhập (JWT)
- Xem danh sách sản phẩm, tìm kiếm, lọc theo danh mục
- Giỏ hàng (Cart) + đặt hàng
- Thanh toán:
  - **COD**
  - **VNPay** (sandbox)
- Voucher giảm giá
- Wishlist (yêu thích)
- Review/Rating sản phẩm
- Build PC (gợi ý & kiểm tra tương thích linh kiện – socket/ram/psu/case…)

### Quản trị (Admin)
- Quản lý sản phẩm, danh mục
- Quản lý đơn hàng / trạng thái đơn
- Quản lý người dùng / role

---

## 2) Kiến trúc hệ thống

```text
┌─────────────────────┐        HTTP/REST        ┌─────────────────────────┐
│ Frontend (Vite)     │  ────────────────────►  │ Backend (.NET Web API)  │
│ React + TypeScript  │  ◄────────────────────  │ Controllers + Services  │
│ Port: 5173          │        JWT Auth         │ Port: 7033              │
└─────────┬───────────┘                         └─────────────┬───────────┘
          │                                                   │
          │                                                   │ EF Core
          ▼                                                   ▼
   Static build (dist)                                  SQL Server Database
                                                            │
                                                            ├─ VNPay
                                                            ├─ Resend (Email)
                                                            └─ Gemini (AI Chat)
```

---

## 3) Database Diagram (ERD)

> ERD hiện tại của hệ thống (Products, Orders, OrderItems, Users, Roles, Carts, Reviews, Wishlist, Vouchers, ChatHistories…)

![ERD](image1)

---

## 4) Công nghệ sử dụng

**Frontend**
- React + TypeScript
- Vite
- TailwindCSS
- React Router

**Backend**
- ASP.NET Core Web API
- Entity Framework Core
- JWT Authentication

**Third‑party**
- VNPay (Payment)
- Resend (Send email)
- Gemini API (AI Chat)

---

## 5) Yêu cầu môi trường

- Node.js >= 18
- .NET SDK >= 8 (khuyến nghị)
- SQL Server (LocalDB / SQL Server Express / SQL Server)
- (Tuỳ chọn) tài khoản/keys:
  - Resend API key
  - Gemini API key
  - VNPay sandbox config

---

## 6) Setup & Run (Local)

### 6.1 Clone repo
```bash
git clone https://github.com/HanzoSz/GTGSHOP.git
cd GTGSHOP
```

---

## 7) Backend (.NET) – Setup & Run

### 7.1 Cấu hình database & secrets
Mở file:
- `Backend/GTG_Backend/GTG_Backend/appsettings.json`

Cập nhật các biến:
- `ConnectionStrings:DefaultConnection`
- `Jwt:Key` (>= 32 ký tự)
- `Gemini:ApiKey`
- `Resend:ApiKey`
- `VnPay:TmnCode`, `VnPay:HashSecret`, `VnPay:ReturnUrl`

Ví dụ (minh ho��):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=GTG_LinhKienPC;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "YOUR_SECRET_KEY_AT_LEAST_32_CHARACTERS",
    "Issuer": "GTG_Backend",
    "Audience": "GTG_Frontend",
    "ExpireMinutes": 60
  }
}
```

> Gợi ý: Không nên commit key thật lên GitHub. Nên dùng `appsettings.Development.json` hoặc User Secrets cho local.

### 7.2 Chạy migrations (nếu dự án có migrations)
Tại thư mục backend (tuỳ cấu trúc solution, có thể cần chạy ở đúng folder chứa `.csproj`):
```bash
cd Backend/GTG_Backend/GTG_Backend
dotnet ef database update
```

Nếu chưa cài EF Tools:
```bash
dotnet tool install --global dotnet-ef
```

### 7.3 Run backend
```bash
dotnet run
```

Backend mặc định (tham khảo theo cấu hình dev):
- HTTPS: `https://localhost:7033`
- API base: `https://localhost:7033/api`

---

## 8) Frontend (Vite) – Setup & Run

### 8.1 Cài dependency
```bash
cd Frontend
npm i
```

### 8.2 Tạo file `.env` cho frontend
Tạo file:
- `Frontend/.env`

Ví dụ:
```env
VITE_API_URL=https://localhost:7033/api
VITE_IMAGE_BASE_URL=https://localhost:7033
```

Giải thích:
- `VITE_API_URL`: base API backend
- `VITE_IMAGE_BASE_URL`: base host để load ảnh

### 8.3 Run frontend
```bash
npm run dev
```

Frontend chạy tại:
- `http://localhost:5173`

---

## 9) API Documentation (Swagger)

Nếu backend đã bật Swagger, truy cập (tuỳ môi trường):
- `https://localhost:7033/swagger`

> Nếu chưa bật Swagger: nên bổ sung Swagger để dễ demo/báo cáo.

---

## 10) Luồng nghiệp vụ tiêu biểu

### 10.1 Đặt hàng (COD/VNPay)
1. User thêm sản phẩm vào Cart
2. Frontend gửi request tạo Order: `POST /api/orders`
3. Backend:
   - Validate JWT
   - Kiểm tra stock, tạo Order + OrderItems
   - Nếu COD: gửi email xác nhận
   - Nếu VNPay: tạo payment URL và trả về cho frontend redirect

---

## 11) Screenshots
> (Bạn bổ sung ảnh UI vào đây trước khi nộp: Trang chủ, Product detail, Cart, Checkout, Admin, BuildPC…)

Ví dụ:
- `docs/screenshots/home.png`
- `docs/screenshots/cart.png`
- `docs/screenshots/checkout.png`
- `docs/screenshots/admin-products.png`
- `docs/screenshots/buildpc.png`

---

## 12) Deploy checklist (để báo cáo / demo)
- [ ] Thiết lập ENV cho Frontend (VITE_API_URL, VITE_IMAGE_BASE_URL)
- [ ] Thiết lập appsettings/ENV cho Backend (DB, JWT key, VNPay, Resend, Gemini)
- [ ] Chạy migrations production
- [ ] Bật HTTPS + CORS đúng domain frontend
- [ ] Kiểm tra VNPay ReturnUrl đúng domain backend public
- [ ] Seed data (nếu cần demo nhanh)

---

## 13) License
Dự án phục vụ mục đích học tập/đồ án.
