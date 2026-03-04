using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using GTG_Backend.Models;

namespace GTG_Backend.Services
{
    public class EmailService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<EmailService> _logger;
        private readonly string _apiKey;

        // FROM address sử dụng domain đã xác thực trên Resend
        private const string FROM_EMAIL = "GTG SHOP <admin@gtgshop.nghiencongnghe.id.vn>";
        private const string RESEND_API_URL = "https://api.resend.com/emails";

        public EmailService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<EmailService> logger)
        {
            _httpClient = httpClientFactory.CreateClient("ResendClient");
            _logger = logger;
            _apiKey = configuration["Resend:ApiKey"] ?? "";

            // Log khi khởi tạo để kiểm tra API key
            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogError("❌ [EMAIL] Resend API Key TRỐNG! Kiểm tra appsettings.json -> Resend:ApiKey");
            }
            else
            {
                var maskedKey = _apiKey.Length > 10
                    ? _apiKey[..8] + "***" + _apiKey[^4..]
                    : "***";
                _logger.LogInformation("✅ [EMAIL] EmailService khởi tạo OK. API Key: {MaskedKey}, From: {From}", maskedKey, FROM_EMAIL);
            }
        }

        /// <summary>
        /// Gửi email xác nhận đơn hàng qua Resend REST API
        /// </summary>
        public async Task SendOrderConfirmationAsync(Order order, List<OrderItem> orderItems, string toEmail)
        {
            try
            {
                _logger.LogInformation(
                    "📧 [EMAIL] Bắt đầu gửi: Đơn {OrderCode} → {Email} ({Count} SP, tổng {Total:N0}đ)",
                    order.OrderCode, toEmail, orderItems.Count, order.TotalAmount + order.ShippingFee);

                var htmlBody = BuildOrderConfirmationHtml(order, orderItems);

                // Tạo payload cho Resend API
                var payload = new
                {
                    from = FROM_EMAIL,
                    to = new[] { toEmail },
                    subject = $"✅ Xác nhận đơn hàng #{order.OrderCode} - GTG SHOP",
                    html = htmlBody
                };

                var jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                // Set Authorization header
                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", _apiKey);

                Console.WriteLine($"=== RESEND API CALL ===");
                Console.WriteLine($"URL: {RESEND_API_URL}");
                Console.WriteLine($"From: {FROM_EMAIL}");
                Console.WriteLine($"To: {toEmail}");
                Console.WriteLine($"Subject: Xác nhận đơn hàng #{order.OrderCode}");
                Console.WriteLine($"API Key: {_apiKey[..8]}***{_apiKey[^4..]}");
                Console.WriteLine($"Payload size: {jsonPayload.Length} chars");

                // Gọi Resend API
                var response = await _httpClient.PostAsync(RESEND_API_URL, content);
                var responseBody = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"=== RESEND RESPONSE ===");
                Console.WriteLine($"StatusCode: {(int)response.StatusCode} {response.StatusCode}");
                Console.WriteLine($"Body: {responseBody}");

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation(
                        "✅ [EMAIL] GỬI THÀNH CÔNG! Đơn {OrderCode} → {Email}. Response: {Response}",
                        order.OrderCode, toEmail, responseBody);
                }
                else
                {
                    _logger.LogError(
                        "❌ [EMAIL] Resend API trả về lỗi! StatusCode: {StatusCode}, Body: {Body}, Đơn: {OrderCode}, To: {Email}",
                        (int)response.StatusCode, responseBody, order.OrderCode, toEmail);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== RESEND EXCEPTION ===");
                Console.WriteLine($"Type: {ex.GetType().FullName}");
                Console.WriteLine($"Message: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");

                _logger.LogError(ex,
                    "❌ [EMAIL] Exception khi gửi email đơn {OrderCode} → {Email}. Error: {Message}",
                    order.OrderCode, toEmail, ex.Message);
            }
        }

        /// <summary>
        /// Gửi email đặt lại mật khẩu
        /// </summary>
        public async Task SendPasswordResetAsync(string toEmail, string fullName, string resetLink)
        {
            try
            {
                _logger.LogInformation("🔑 [EMAIL] Gửi email reset password → {Email}", toEmail);

                var htmlBody = BuildPasswordResetHtml(fullName, resetLink);

                var payload = new
                {
                    from = FROM_EMAIL,
                    to = new[] { toEmail },
                    subject = "🔐 Đặt lại mật khẩu - GTG SHOP",
                    html = htmlBody
                };

                var jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", _apiKey);

                var response = await _httpClient.PostAsync(RESEND_API_URL, content);
                var responseBody = await response.Content.ReadAsStringAsync();

                Console.WriteLine($"=== RESEND RESET PASSWORD ===");
                Console.WriteLine($"To: {toEmail}, StatusCode: {(int)response.StatusCode}");
                Console.WriteLine($"Body: {responseBody}");

                if (response.IsSuccessStatusCode)
                    _logger.LogInformation("✅ [EMAIL] Reset password email gửi thành công → {Email}", toEmail);
                else
                    _logger.LogError("❌ [EMAIL] Reset password email lỗi! Status: {Status}, Body: {Body}", (int)response.StatusCode, responseBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ [EMAIL] Exception gửi reset password → {Email}: {Message}", toEmail, ex.Message);
            }
        }

        /// <summary>
        /// HTML template cho email đặt lại mật khẩu
        /// </summary>
        private string BuildPasswordResetHtml(string fullName, string resetLink)
        {
            return $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, sans-serif; background-color: #f3f4f6;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.07);'>
        
        <!-- Header -->
        <div style='background: linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #F59E0B 100%); padding: 36px 24px; text-align: center;'>
            <span style='font-size: 36px;'>🛒</span>
            <h1 style='color: #ffffff; margin: 8px 0 0; font-size: 28px; font-weight: 800;'>GTG SHOP</h1>
            <p style='color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;'>Linh kiện PC chính hãng</p>
        </div>

        <!-- Content -->
        <div style='padding: 36px 28px;'>
            <div style='text-align: center; margin-bottom: 28px;'>
                <div style='width: 72px; height: 72px; margin: 0 auto 16px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 50%; display: flex; align-items: center; justify-content: center;'>
                    <span style='font-size: 36px; line-height: 72px;'>🔐</span>
                </div>
                <h2 style='color: #111827; margin: 0; font-size: 22px; font-weight: 700;'>Đặt lại mật khẩu</h2>
            </div>

            <p style='color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 8px;'>
                Xin chào <strong>{fullName}</strong>,
            </p>
            <p style='color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 28px;'>
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                Nhấn nút bên dưới để tạo mật khẩu mới:
            </p>

            <!-- Button -->
            <div style='text-align: center; margin-bottom: 28px;'>
                <a href='{resetLink}' 
                   style='display: inline-block; background: linear-gradient(135deg, #DC2626, #EA580C); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px rgba(220,38,38,0.35);'>
                    🔑 Đổi mật khẩu
                </a>
            </div>

            <!-- Warning -->
            <div style='background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;'>
                <p style='color: #92400e; margin: 0; font-size: 13px; line-height: 1.6;'>
                    ⏰ <strong>Link sẽ hết hạn sau 15 phút.</strong><br>
                    Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
                </p>
            </div>

            <!-- Security Note -->
            <div style='background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px 20px;'>
                <p style='color: #991b1b; margin: 0; font-size: 13px; line-height: 1.6;'>
                    🛡️ <strong>Bảo mật:</strong> GTG SHOP không bao giờ yêu cầu bạn cung cấp mật khẩu qua email. 
                    Nếu bạn nghi ngờ ai đó đang cố truy cập tài khoản, hãy liên hệ chúng tôi ngay.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style='background: linear-gradient(135deg, #111827, #1f2937); padding: 24px; text-align: center;'>
            <p style='color: #e5e7eb; margin: 0 0 6px; font-size: 14px; font-weight: 700;'>🛒 GTG SHOP</p>
            <p style='color: #f59e0b; margin: 8px 0 0; font-size: 13px; font-weight: 600;'>📧 admingtgshop@gmail.com | 📞 0344 573 591</p>
            <p style='color: #4b5563; margin: 12px 0 0; font-size: 11px;'>© 2026 GTG Shop. Email tự động, vui lòng không trả lời.</p>
        </div>
    </div>
</body>
</html>";
        }
        private string BuildOrderConfirmationHtml(Order order, List<OrderItem> orderItems)
        {
            // Build bảng sản phẩm
            var itemsHtml = "";
            var stt = 0;
            foreach (var item in orderItems)
            {
                stt++;
                var itemTotal = item.Price * item.Quantity;
                var bgColor = stt % 2 == 0 ? "#f9fafb" : "#ffffff";
                itemsHtml += $@"
                <tr style='background-color: {bgColor};'>
                    <td style='padding: 14px 16px; border-bottom: 1px solid #eee; color: #374151; font-size: 13px; text-align: center;'>{stt}</td>
                    <td style='padding: 14px 16px; border-bottom: 1px solid #eee;'>
                        <div style='font-weight: 600; color: #111827; font-size: 14px;'>{item.ProductName}</div>
                    </td>
                    <td style='padding: 14px 16px; border-bottom: 1px solid #eee; text-align: center; color: #374151; font-size: 13px;'>{item.Quantity}</td>
                    <td style='padding: 14px 16px; border-bottom: 1px solid #eee; text-align: right; color: #374151; font-size: 13px; white-space: nowrap;'>{item.Price:N0}đ</td>
                    <td style='padding: 14px 16px; border-bottom: 1px solid #eee; text-align: right; font-weight: 700; color: #111827; font-size: 14px; white-space: nowrap;'>{itemTotal:N0}đ</td>
                </tr>";
            }

            // Phương thức thanh toán
            var paymentMethodText = order.PaymentMethod switch
            {
                "cod" => "💵 Thanh toán khi nhận hàng (COD)",
                "vnpay" => "🏦 Thanh toán qua VnPay",
                _ => order.PaymentMethod
            };

            var paymentStatusText = order.PaymentStatus switch
            {
                "paid" => "✅ Đã thanh toán",
                "unpaid" => "⏳ Chưa thanh toán",
                "failed" => "❌ Thanh toán thất bại",
                _ => order.PaymentStatus
            };

            var paymentStatusColor = order.PaymentStatus switch
            {
                "paid" => "#16a34a",
                "unpaid" => "#d97706",
                "failed" => "#dc2626",
                _ => "#6b7280"
            };

            var grandTotal = order.TotalAmount + order.ShippingFee;

            // Build địa chỉ đầy đủ
            var fullAddress = order.ShippingAddress;
            if (!string.IsNullOrEmpty(order.ShippingWard)) fullAddress += $", {order.ShippingWard}";
            if (!string.IsNullOrEmpty(order.ShippingDistrict)) fullAddress += $", {order.ShippingDistrict}";
            if (!string.IsNullOrEmpty(order.ShippingCity)) fullAddress += $", {order.ShippingCity}";

            return $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Xác nhận đơn hàng - GTG SHOP</title>
</head>
<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; background-color: #f3f4f6; -webkit-font-smoothing: antialiased;'>
    <div style='max-width: 640px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.07);'>
        
        <!-- ====== HEADER ====== -->
        <div style='background: linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #F59E0B 100%); padding: 36px 24px; text-align: center;'>
            <div style='margin-bottom: 8px;'>
                <span style='font-size: 36px;'>🛒</span>
            </div>
            <h1 style='color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);'>GTG SHOP</h1>
            <p style='color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase;'>Linh kiện PC chính hãng</p>
        </div>

        <!-- ====== SUCCESS BANNER ====== -->
        <div style='background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 28px 24px; text-align: center; border-bottom: 3px solid #86efac;'>
            <div style='font-size: 48px; margin-bottom: 8px;'>✅</div>
            <h2 style='color: #15803d; margin: 0; font-size: 22px; font-weight: 700;'>Đặt hàng thành công!</h2>
            <p style='color: #16a34a; margin: 8px 0 0; font-size: 14px;'>Cảm ơn bạn đã tin tưởng mua sắm tại GTG SHOP</p>
        </div>

        <div style='padding: 28px 24px;'>

            <!-- ====== ORDER INFO CARD ====== -->
            <div style='background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fde68a; border-radius: 14px; padding: 20px; margin-bottom: 28px;'>
                <table style='width: 100%; border-collapse: collapse;'>
                    <tr>
                        <td style='padding: 6px 0; color: #92400e; font-size: 13px;'>📋 Mã đơn hàng</td>
                        <td style='padding: 6px 0; text-align: right;'>
                            <span style='font-weight: 800; color: #92400e; font-size: 16px; background-color: #fef9c3; padding: 3px 10px; border-radius: 6px;'>{order.OrderCode}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #92400e; font-size: 13px;'>📅 Ngày đặt hàng</td>
                        <td style='padding: 6px 0; text-align: right; color: #78350f; font-size: 13px; font-weight: 500;'>{order.CreatedAt:dd/MM/yyyy HH:mm}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #92400e; font-size: 13px;'>💳 Phương thức TT</td>
                        <td style='padding: 6px 0; text-align: right; color: #78350f; font-size: 13px;'>{paymentMethodText}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #92400e; font-size: 13px;'>📌 Trạng thái TT</td>
                        <td style='padding: 6px 0; text-align: right;'>
                            <span style='color: {paymentStatusColor}; font-weight: 600; font-size: 13px;'>{paymentStatusText}</span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- ====== PRODUCTS TABLE ====== -->
            <h3 style='color: #111827; font-size: 17px; margin: 0 0 14px; font-weight: 700;'>
                <span style='display: inline-block; width: 4px; height: 20px; background-color: #DC2626; border-radius: 2px; margin-right: 10px; vertical-align: middle;'></span>
                📦 Chi tiết đơn hàng
            </h3>
            <div style='border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 20px;'>
                <table style='width: 100%; border-collapse: collapse;'>
                    <thead>
                        <tr style='background: linear-gradient(135deg, #1f2937, #374151);'>
                            <th style='padding: 12px 16px; text-align: center; font-size: 11px; color: #d1d5db; text-transform: uppercase; letter-spacing: 0.5px; width: 40px;'>STT</th>
                            <th style='padding: 12px 16px; text-align: left; font-size: 11px; color: #d1d5db; text-transform: uppercase; letter-spacing: 0.5px;'>Sản phẩm</th>
                            <th style='padding: 12px 16px; text-align: center; font-size: 11px; color: #d1d5db; text-transform: uppercase; letter-spacing: 0.5px; width: 50px;'>SL</th>
                            <th style='padding: 12px 16px; text-align: right; font-size: 11px; color: #d1d5db; text-transform: uppercase; letter-spacing: 0.5px; width: 100px;'>Đơn giá</th>
                            <th style='padding: 12px 16px; text-align: right; font-size: 11px; color: #d1d5db; text-transform: uppercase; letter-spacing: 0.5px; width: 110px;'>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsHtml}
                    </tbody>
                </table>
            </div>

            <!-- ====== TOTALS ====== -->
            <div style='background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px 20px; margin-bottom: 28px;'>
                <table style='width: 100%; border-collapse: collapse;'>
                    <tr>
                        <td style='padding: 7px 0; color: #6b7280; font-size: 14px;'>Tạm tính</td>
                        <td style='padding: 7px 0; text-align: right; color: #374151; font-size: 14px; font-weight: 500;'>{order.TotalAmount:N0}đ</td>
                    </tr>
                    <tr>
                        <td style='padding: 7px 0; color: #6b7280; font-size: 14px;'>Phí vận chuyển</td>
                        <td style='padding: 7px 0; text-align: right; color: #374151; font-size: 14px; font-weight: 500;'>{(order.ShippingFee > 0 ? $"{order.ShippingFee:N0}đ" : "🎉 Miễn phí")}</td>
                    </tr>
                    <tr>
                        <td colspan='2' style='padding: 10px 0 0;'>
                            <hr style='border: none; border-top: 2px dashed #d1d5db; margin: 0;'>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 10px 0 0; font-weight: 800; color: #DC2626; font-size: 18px;'>💰 TỔNG CỘNG</td>
                        <td style='padding: 10px 0 0; text-align: right; font-weight: 800; color: #DC2626; font-size: 22px;'>{grandTotal:N0}đ</td>
                    </tr>
                </table>
            </div>

            <!-- ====== SHIPPING INFO ====== -->
            <h3 style='color: #111827; font-size: 17px; margin: 0 0 14px; font-weight: 700;'>
                <span style='display: inline-block; width: 4px; height: 20px; background-color: #EA580C; border-radius: 2px; margin-right: 10px; vertical-align: middle;'></span>
                🚚 Thông tin giao hàng
            </h3>
            <div style='background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 1px solid #fed7aa; border-radius: 14px; padding: 20px; margin-bottom: 28px;'>
                <table style='width: 100%; border-collapse: collapse;'>
                    <tr>
                        <td style='padding: 7px 0; color: #9a3412; font-size: 13px; width: 120px; vertical-align: top;'>👤 Người nhận</td>
                        <td style='padding: 7px 0; color: #1a1a1a; font-weight: 700; font-size: 14px;'>{order.ShippingFullName}</td>
                    </tr>
                    <tr>
                        <td style='padding: 7px 0; color: #9a3412; font-size: 13px; vertical-align: top;'>📱 Điện thoại</td>
                        <td style='padding: 7px 0; color: #1a1a1a; font-size: 14px;'>{order.ShippingPhone}</td>
                    </tr>
                    <tr>
                        <td style='padding: 7px 0; color: #9a3412; font-size: 13px; vertical-align: top;'>📍 Địa chỉ</td>
                        <td style='padding: 7px 0; color: #1a1a1a; font-size: 14px;'>{fullAddress}</td>
                    </tr>
                    {(string.IsNullOrEmpty(order.Note) ? "" : $@"
                    <tr>
                        <td style='padding: 7px 0; color: #9a3412; font-size: 13px; vertical-align: top;'>📝 Ghi chú</td>
                        <td style='padding: 7px 0; color: #6b7280; font-size: 13px; font-style: italic;'>{order.Note}</td>
                    </tr>")}
                </table>
            </div>

            <!-- ====== TRACKING BUTTON ====== -->
            <div style='text-align: center; margin-bottom: 28px;'>
                <a href='http://localhost:5173/orders' 
                   style='display: inline-block; background: linear-gradient(135deg, #DC2626, #EA580C); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(220,38,38,0.35);'>
                    📦 Theo dõi đơn hàng
                </a>
            </div>

            <!-- ====== INFO NOTE ====== -->
            <div style='background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 20px;'>
                <p style='color: #1e40af; margin: 0; font-size: 13px; line-height: 1.6;'>
                    ℹ️ <strong>Lưu ý:</strong> Đơn hàng sẽ được xử lý trong thời gian sớm nhất. 
                    Dự kiến giao hàng trong <strong>2-3 ngày làm việc</strong>. 
                    Nếu bạn có thắc mắc, vui lòng liên hệ hotline bên dưới.
                </p>
            </div>
        </div>

        <!-- ====== FOOTER ====== -->
        <div style='background: linear-gradient(135deg, #111827, #1f2937); padding: 28px 24px; text-align: center;'>
            <p style='color: #e5e7eb; margin: 0 0 6px; font-size: 15px; font-weight: 700;'>🛒 GTG SHOP</p>
            <p style='color: #9ca3af; margin: 0 0 14px; font-size: 12px;'>Linh kiện PC chính hãng - Giá tốt nhất</p>
            <div style='border-top: 1px solid #374151; padding-top: 14px;'>
                <p style='color: #f59e0b; margin: 0; font-size: 14px; font-weight: 600;'>
                    📧 admingtgshop@gmail.com &nbsp;|&nbsp; 📞 0344 573 591
                </p>
            </div>
            <p style='color: #4b5563; margin: 16px 0 0; font-size: 11px;'>© 2026 GTG Shop. Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>

    </div>
</body>
</html>";
        }
    }
}
