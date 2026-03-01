using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using GTG_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Services
{
    public class GeminiService
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        // Cache: lưu câu trả lời để tránh gọi API lặp lại
        private static readonly ConcurrentDictionary<string, (string Response, DateTime CachedAt)> _responseCache = new();
        private static readonly TimeSpan _cacheExpiry = TimeSpan.FromMinutes(30);

        public GeminiService(AppDbContext context, HttpClient httpClient, IConfiguration configuration)
        {
            _context = context;
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"] ?? throw new ArgumentException("Gemini API Key is not configured");
        }

        // ========================== MAIN ENTRY POINT ==========================

        public async Task<string> GetAnswerAsync(int userId, string userQuestion)
        {
            // Step 0: Kiểm tra câu hỏi có liên quan đến linh kiện PC không
            if (!IsRelevantQuestion(userQuestion))
            {
                var rejectResponse = "Xin lỗi bạn, mình chỉ hỗ trợ tư vấn về **linh kiện PC, build PC và gaming gear** thôi ạ! 🎮\n\nBạn có thể hỏi mình về:\n- 💻 Build PC theo ngân sách\n- 🔧 Tư vấn nâng cấp CPU, VGA, RAM...\n- 💰 Giá sản phẩm\n- ⚡ So sánh linh kiện\n\nBạn cần tư vấn gì về linh kiện PC ạ?";
                await SaveChatHistory(userId, userQuestion, rejectResponse);
                return rejectResponse;
            }

            // Step 1: Kiểm tra cache (skip cache cho build requests vì cần context mới nhất)
            bool isBuild = IsBuildRequest(userQuestion);
            if (!isBuild)
            {
                var cacheKey = NormalizeForCache(userQuestion);
                if (_responseCache.TryGetValue(cacheKey, out var cached) && DateTime.Now - cached.CachedAt < _cacheExpiry)
                {
                    Console.WriteLine($"[Cache] HIT for: {cacheKey}");
                    await SaveChatHistory(userId, userQuestion, cached.Response);
                    return cached.Response;
                }
            }

            // Step 2: Smart RAG - Tìm sản phẩm liên quan từ DB
            List<Product> matchingProducts;
            if (isBuild)
            {
                Console.WriteLine("[Search] Build request detected - fetching from all categories");
                matchingProducts = await SearchProductsForBuild();
            }
            else
            {
                var keywords = ExtractKeywords(userQuestion);
                matchingProducts = await SearchProducts(keywords);
            }

            Console.WriteLine($"[Search] Found {matchingProducts.Count} products across {matchingProducts.Select(p => p.Category?.Name).Distinct().Count()} categories");

            // Step 3: Xây dựng system prompt với context sản phẩm
            var systemPrompt = BuildSystemPrompt(matchingProducts);

            // Step 4: Lấy lịch sử chat gần đây (Short-term Memory)
            var chatHistory = await GetRecentChatHistory(userId, limit: 6);
            Console.WriteLine($"[Memory] Loaded {chatHistory.Count} recent messages for userId={userId}");

            // Step 5: Gọi Gemini API với memory
            var botResponse = await CallGeminiApi(systemPrompt, userMessage: userQuestion, chatHistory);

            // Step 6: Lưu vào cache (chỉ cache non-build requests)
            if (!isBuild)
            {
                var cacheKey = NormalizeForCache(userQuestion);
                _responseCache[cacheKey] = (botResponse, DateTime.Now);
                Console.WriteLine($"[Cache] STORED for: {cacheKey}");

                if (_responseCache.Count > 100)
                {
                    CleanExpiredCache();
                }
            }

            // Step 7: Lưu lịch sử chat
            await SaveChatHistory(userId, userQuestion, botResponse);

            return botResponse;
        }

        // ========================== STEP 1: BUILD DETECTION ==========================

        /// <summary>
        /// Phát hiện yêu cầu build PC
        /// </summary>
        private bool IsBuildRequest(string question)
        {
            var lower = question.ToLower();
            var buildKeywords = new[] { "build", "cấu hình", "lắp ráp", "bộ pc", "bộ máy", "rig", "set pc", "combo pc", "full pc", "tài chính" };
            var budgetKeywords = new[] { "triệu", "tr", "m", "k", "ngàn", "ngân sách", "tầm giá", "trong khoảng" };

            bool hasBuildWord = buildKeywords.Any(k => lower.Contains(k));
            bool hasBudgetWord = budgetKeywords.Any(k => lower.Contains(k));

            // "build PC 20 triệu", "cấu hình gaming", "bộ PC", "pc tài chính 15tr", etc.
            return hasBuildWord || (hasBudgetWord && (lower.Contains("pc") || lower.Contains("máy") || lower.Contains("gaming")));
        }

        // ========================== STEP 2: SMART RAG ==========================

        /// <summary>
        /// Lấy top 10 sản phẩm từ MỖI category để phục vụ build PC (đảm bảo Gemini có đủ linh kiện)
        /// </summary>
        private async Task<List<Product>> SearchProductsForBuild()
        {
            var allProducts = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.Stock > 0)
                .ToListAsync();

            var result = new List<Product>();

            var groupedByCategory = allProducts
                .Where(p => p.Category != null)
                .GroupBy(p => p.Category!.Name);

            foreach (var group in groupedByCategory)
            {
                var topProducts = group
                    .OrderBy(p => p.Price) // Sắp xếp theo giá tăng dần để AI chọn phù hợp ngân sách
                    .Take(10)
                    .ToList();
                result.AddRange(topProducts);
                Console.WriteLine($"[RAG] Category '{group.Key}': {topProducts.Count} products (prices: {string.Join(", ", topProducts.Select(p => $"{p.Price:N0}"))})");
            }

            Console.WriteLine($"[RAG] Total build catalog: {result.Count} products from {groupedByCategory.Count()} categories");
            return result;
        }

        /// <summary>
        /// Tìm sản phẩm theo keyword (cho câu hỏi thông thường)
        /// </summary>
        private async Task<List<Product>> SearchProducts(List<string> keywords)
        {
            if (!keywords.Any())
            {
                return await _context.Products
                    .Include(p => p.Category)
                    .Where(p => p.Stock > 0)
                    .OrderByDescending(p => p.Reviews)
                    .Take(20)
                    .ToListAsync();
            }

            var products = await _context.Products.Include(p => p.Category).ToListAsync();

            var matched = products
                .Where(p => keywords.Any(k =>
                    (p.Name != null && p.Name.ToLower().Contains(k)) ||
                    (p.Description != null && p.Description.ToLower().Contains(k)) ||
                    (p.Category != null && p.Category.Name != null && p.Category.Name.ToLower().Contains(k))
                ))
                .OrderByDescending(p => keywords.Count(k =>
                    (p.Name != null && p.Name.ToLower().Contains(k)) ||
                    (p.Description != null && p.Description.ToLower().Contains(k))
                ))
                .Take(20)
                .ToList();

            if (!matched.Any())
            {
                return await _context.Products
                    .Include(p => p.Category)
                    .Where(p => p.Stock > 0)
                    .OrderByDescending(p => p.Reviews)
                    .Take(20)
                    .ToListAsync();
            }

            return matched;
        }

        // ========================== STEP 3: SYSTEM PROMPT ==========================

        private string BuildSystemPrompt(List<Product> products)
        {
            var productContext = products.Select(p => new
            {
                p.Id,
                p.Name,
                Price = p.Price,
                PriceFormatted = $"{p.Price:N0}đ",
                p.Stock,
                Category = p.Category?.Name ?? "Chưa phân loại",
                Description = (p.Description ?? "").Length > 150 ? (p.Description ?? "").Substring(0, 150) : (p.Description ?? ""),
                Discount = p.Discount > 0 ? p.Discount : 0,
                ImageUrl = p.ImageUrl ?? "",
                ProductLink = $"/product/{p.Id}"
            });

            var productJson = JsonSerializer.Serialize(productContext, new JsonSerializerOptions
            {
                WriteIndented = false, // Compact để tiết kiệm token
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });

            return $@"# BẠN LÀ AI ASSISTANT GTG - TRỢ LÝ BÁN HÀNG & HỖ TRỢ KỸ THUẬT CỦA GTG SHOP

Bạn là nhân viên tư vấn kiêm hỗ trợ kỹ thuật phần cứng PC tại GTG SHOP. Bạn có 3 chức năng chính:
1. **Tư vấn build PC** theo ngân sách
2. **Tư vấn sản phẩm** (giá, so sánh, thông số)
3. **Hỗ trợ sửa lỗi phần cứng PC** (troubleshooting)

---

## 📦 PHẦN 1: TƯ VẤN SẢN PHẨM & BUILD PC

### NGUYÊN TẮC BẮT BUỘC:
1. CHỈ ĐƯỢC dùng sản phẩm CÓ TRONG DANH SÁCH bên dưới. TUYỆT ĐỐI KHÔNG bịa ra sản phẩm, giá, hoặc thông tin nào không có trong danh sách.
2. KHÔNG BAO GIỜ hỏi lại khách hàng. KHÔNG hỏi ""mục đích sử dụng"", ""chơi game gì"", ""ngân sách bao nhiêu"".
3. Nếu khách không nói rõ mục đích → mặc định là Gaming.
4. Nếu khách không nói ngân sách → gợi ý cấu hình tầm trung (15-20 triệu).

### DANH SÁCH SẢN PHẨM CỦA SHOP (JSON):
{productJson}

### FORMAT KHI BUILD PC (BẮT BUỘC):

#### 🖥️ Cấu hình PC [Gaming/Văn phòng/Đồ họa] - Ngân sách ~[X]đ

| Linh kiện | Sản phẩm | Giá |
|-----------|----------|-----|
| 💻 CPU | [tên sản phẩm từ danh sách] | [giá]đ |
| 📟 Mainboard | [tên] | [giá]đ |
| 🧠 RAM | [tên] | [giá]đ |
| 🎮 VGA | [tên] | [giá]đ |
| 💿 SSD | [tên] | [giá]đ |
| ⚡ Nguồn PSU | [tên] | [giá]đ |
| 📦 Case | [tên] | [giá]đ |
| **TỔNG CỘNG** | | **[tổng]đ** |

**Quy tắc build:**
- TỔNG GIÁ phải <= ngân sách khách yêu cầu.
- Sử dụng sản phẩm gốc, KHÔNG tự tạo tên.
- Nếu thiếu category → ghi ""Chưa có trong kho"".
- Sau bảng: giải thích ngắn gọn lý do chọn từng linh kiện.
- Cuối: gợi ý ""Thêm vào giỏ hàng"" với link /product/ID.

---

## 🔧 PHẦN 2: HỖ TRỢ SỬA LỖI PHẦN CỨNG PC (TROUBLESHOOTING)

Bạn đóng vai trò **Nhân viên Hỗ trợ Kỹ thuật** của GTG SHOP. Hướng dẫn khách tự khắc phục các lỗi phần cứng CƠ BẢN tại nhà.

### ✅ PHẠM VI HỖ TRỢ (IN-SCOPE) - CHỈ hỗ trợ lỗi liên quan đến:
- **CPU**: Máy không khởi động, quá nhiệt, throttling, bottleneck
- **VGA/GPU**: Không lên hình, quạt không quay, artifact (nhiễu hình), driver crash
- **Mainboard**: Không lên nguồn, đèn LED debug, tiếng bíp (beep codes), không nhận RAM/VGA
- **RAM**: Máy không boot, màn hình xanh (BSOD), không nhận đủ RAM
- **SSD/HDD**: Không nhận ổ cứng, chậm bất thường, bad sector
- **PSU (Nguồn)**: Máy tự tắt, không lên nguồn, thiếu công suất
- **Case/Tản nhiệt**: Quạt kêu to, nhiệt độ cao, airflow kém
- **Màn hình**: Không lên hình, nhấp nháy, dead pixel, tần số quét
- **Chuột/Bàn phím**: Không nhận, lag input, switch hỏng

### ❌ NGOÀI PHẠM VI (OUT-OF-SCOPE) - TUYỆT ĐỐI TỪ CHỐI:
Nếu khách hỏi về các vấn đề sau, PHẢI từ chối lịch sự:
- 🖨️ **Máy in, Scanner** → ""Xin lỗi bạn, mình chỉ hỗ trợ phần cứng PC thôi ạ!""
- 📶 **Wifi, Mạng, Router, Modem** → Từ chối
- 📱 **Điện thoại, Tablet** → Từ chối
- 💿 **Crack phần mềm, key bản quyền** → Từ chối
- 🏠 **Đồ gia dụng, Tivi, Loa bluetooth** → Từ chối
- 🔧 **Sửa chữa phần mềm phức tạp** (cài OS, recovery data) → Gợi ý mang ra shop

Mẫu từ chối: ""Xin lỗi bạn, mình chỉ hỗ trợ sửa lỗi **phần cứng PC** (CPU, VGA, RAM, Mainboard...) thôi ạ! 😅 Nếu cần build PC hoặc tư vấn linh kiện thì mình sẵn sàng giúp nhé! 💪""

### 🏪 QUY TẮC CHUYỂN TIẾP ĐẾN SHOP (ESCALATION):
Nếu gặp các trường hợp sau, DỪNG hướng dẫn và khuyên khách mang máy đến shop:

**Trường hợp cần mang ra shop:**
- ⚠️ Nghi ngờ mainboard chết (không lên nguồn sau khi thử mọi cách)
- ⚠️ CPU cong chân / cháy socket
- ⚠️ VGA bị artifact nặng, nghi chết chip
- ⚠️ PSU có mùi khét, nổ tụ
- ⚠️ RAM/SSD nghi lỗi phần cứng (đã test bằng phần mềm)
- ⚠️ Khách nói ""không biết làm"", ""không dám mở máy"", ""sợ hỏng thêm""

Mẫu escalation:
""Trường hợp này khá phức tạp, mình khuyên bạn nên mang máy đến **GTG SHOP** để kỹ thuật viên kiểm tra trực tiếp nhé! 🏪

📍 **Địa chỉ:** [Địa chỉ GTG SHOP]
📞 **Hotline:** 0901 234 567
⏰ **Giờ làm việc:** 8:00 - 21:00 (T2 - CN)

Mang máy đến shop sẽ được kiểm tra miễn phí và báo giá trước khi sửa ạ! 💪""

### FORMAT KHI TROUBLESHOOTING:
1. **Chẩn đoán**: Hỏi triệu chứng cụ thể (Ở ĐÂY được phép hỏi thêm chi tiết lỗi)
2. **Nguyên nhân có thể**: Liệt kê 2-3 nguyên nhân phổ biến nhất
3. **Hướng dẫn từng bước**: Đánh số các bước, dùng emoji, ngắn gọn dễ hiểu
4. **Cảnh báo an toàn**: Luôn nhắc tắt nguồn, rút dây điện trước khi thao tác bên trong case
5. **Fallback**: Nếu không khắc phục được → escalation (mang ra shop)

---

## 📋 QUY TẮC CHUNG:
- Format giá kiểu VN: 5.000.000đ
- Thân thiện, emoji, xưng mình/bạn
- Nếu hỏi sản phẩm cụ thể → trả lời giá + mô tả + link (/product/ID)
- Nếu so sánh → làm bảng so sánh
- BẠN CÓ THỂ GHI NHỚ CÁC TIN NHẮN TRƯỚC ĐÓ CỦA KHÁCH trong cuộc hội thoại.
- Khi hướng dẫn sửa lỗi xong, nếu linh kiện cần thay thế → gợi ý sản phẩm từ danh sách shop.";
        }

        // ========================== STEP 4: CHAT MEMORY ==========================

        /// <summary>
        /// Lấy 6 hội thoại gần nhất của user (Short-term Memory)
        /// </summary>
        private async Task<List<ChatHistory>> GetRecentChatHistory(int userId, int limit = 6)
        {
            return await _context.ChatHistories
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.SentAt)
                .Take(limit)
                .OrderBy(c => c.SentAt) // Sắp xếp lại theo thứ tự thời gian
                .ToListAsync();
        }

        // ========================== STEP 5: GEMINI API CALL ==========================

        /// <summary>
        /// Gọi Gemini API với system instruction + chat history + current message
        /// </summary>
        private async Task<string> CallGeminiApi(string systemPrompt, string userMessage, List<ChatHistory> chatHistory)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";

            // Build contents array: history + current message
            var contents = new List<object>();

            // Thêm lịch sử hội thoại (alternate user/model roles)
            foreach (var chat in chatHistory)
            {
                // User message
                contents.Add(new
                {
                    role = "user",
                    parts = new[] { new { text = chat.UserMessage } }
                });

                // Model response
                contents.Add(new
                {
                    role = "model",
                    parts = new[] { new { text = chat.BotResponse } }
                });
            }

            // Thêm tin nhắn hiện tại
            contents.Add(new
            {
                role = "user",
                parts = new[] { new { text = userMessage } }
            });

            var requestBody = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = systemPrompt } }
                },
                contents = contents,
                generationConfig = new
                {
                    temperature = 0.3,
                    maxOutputTokens = 4096,
                    topP = 0.8
                }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions
            {
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });

            // Retry logic: thử tối đa 3 lần với exponential backoff
            int maxRetries = 3;
            int delayMs = 2000;

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                    Console.WriteLine($"[Gemini] Attempt {attempt}/{maxRetries} - Calling API... (history: {chatHistory.Count} turns)");
                    var response = await _httpClient.PostAsync(url, httpContent);
                    var responseBody = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[Gemini] Response status: {response.StatusCode}");

                    if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                    {
                        if (attempt < maxRetries)
                        {
                            Console.WriteLine($"[Gemini] Rate limited! Waiting {delayMs}ms before retry...");
                            await Task.Delay(delayMs);
                            delayMs *= 3;
                            continue;
                        }
                        else
                        {
                            Console.WriteLine($"[Gemini] All {maxRetries} attempts rate limited.");
                            return "⏳ Hệ thống AI đang quá tải. Vui lòng đợi 1 phút rồi thử lại nhé! 🙏";
                        }
                    }

                    if (!response.IsSuccessStatusCode)
                    {
                        Console.WriteLine($"Gemini API Error: {response.StatusCode} - {responseBody}");
                        return $"⚠️ Gemini API Error ({response.StatusCode}): Vui lòng kiểm tra API key và thử lại.";
                    }

                    Console.WriteLine($"[Gemini] Success! Parsing response...");
                    using var doc = JsonDocument.Parse(responseBody);
                    var text = doc.RootElement
                        .GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString();

                    return text ?? "Xin lỗi, tôi không thể xử lý câu hỏi này. Vui lòng thử lại! 🙏";
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Gemini API Exception (attempt {attempt}): {ex.Message}");
                    if (attempt == maxRetries)
                    {
                        return $"⚠️ Lỗi kết nối AI: {ex.Message}. Vui lòng thử lại sau.";
                    }
                    await Task.Delay(delayMs);
                    delayMs *= 3;
                }
            }

            return "⚠️ Không thể kết nối đến AI. Vui lòng thử lại sau.";
        }

        // ========================== HELPERS ==========================

        private async Task SaveChatHistory(int userId, string userQuestion, string botResponse)
        {
            var chatHistory = new ChatHistory
            {
                UserId = userId,
                UserMessage = userQuestion,
                BotResponse = botResponse,
                SentAt = DateTime.Now
            };
            _context.ChatHistories.Add(chatHistory);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ChatHistory>> GetChatHistoryAsync(int userId, int limit = 50)
        {
            return await _context.ChatHistories
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.SentAt)
                .Take(limit)
                .OrderBy(c => c.SentAt)
                .ToListAsync();
        }

        private bool IsRelevantQuestion(string question)
        {
            var lower = question.ToLower();

            var relevantKeywords = new[]
            {
                // Linh kiện & thương hiệu
                "pc", "cpu", "vga", "gpu", "ram", "ssd", "hdd", "mainboard", "main",
                "nguồn", "psu", "case", "vỏ", "tản", "fan", "cooling", "card",
                "intel", "amd", "nvidia", "geforce", "radeon", "ryzen", "core i",
                "ddr4", "ddr5", "nvme", "sata", "socket", "lga", "am4", "am5",
                "rtx", "gtx", "rx", "monitor", "màn hình", "keyboard", "bàn phím",
                "mouse", "chuột", "headset", "tai nghe", "gear", "laptop",
                // Tư vấn & mua hàng
                "build", "cấu hình", "linh kiện", "máy tính", "gaming", "game",
                "nâng cấp", "lắp ráp", "đồ họa", "render", "stream",
                "giá", "bao nhiêu", "mua", "tư vấn", "so sánh", "khác gì",
                "overclock", "fps", "benchmark", "driver", "bios", "windows",
                "shop", "gtg", "sản phẩm", "hàng", "đặt", "giỏ", "mới",
                "triệu", "tr", "tài chính",
                // Troubleshooting / Sửa lỗi phần cứng
                "lỗi", "sửa", "cài", "fix", "bottleneck", "tương thích",
                "không lên hình", "không lên nguồn", "không khởi động", "không boot",
                "tự tắt", "tự khởi động", "restart", "treo", "đơ", "lag",
                "màn xanh", "bsod", "blue screen", "crash", "dump",
                "bíp", "beep", "kêu", "tiếng kêu", "nổ",
                "nóng", "quá nhiệt", "nhiệt độ", "overheat", "throttle",
                "artifact", "nhiễu hình", "nhấp nháy", "sọc", "sọc màn",
                "không nhận", "mất", "hỏng", "chết", "cháy", "khét",
                "quạt", "quạt không quay", "quạt kêu",
                "dead pixel", "bad sector",
                // Chào hỏi & xã giao
                "chào", "hi", "hello", "xin chào", "ơi", "ạ", "nhé",
                "cảm ơn", "thanks", "thank", "ok", "được", "rồi"
            };

            return relevantKeywords.Any(k => lower.Contains(k));
        }

        private List<string> ExtractKeywords(string question)
        {
            var lowerQuestion = question.ToLower();
            var stopWords = new HashSet<string>
            {
                "tôi", "muốn", "mua", "cần", "cho", "có", "không", "được", "bạn",
                "ạ", "nhé", "ơi", "là", "và", "của", "với", "này", "đó", "thì",
                "nào", "gì", "sao", "nên", "hay", "hỏi", "về", "xin", "giúp",
                "tư", "vấn", "gợi", "ý", "đề", "xuất", "tìm", "kiếm", "giá",
                "bao", "nhiêu", "rẻ", "đắt", "tốt", "nhất", "nha", "hả", "vậy"
            };

            var words = lowerQuestion.Split(new[] { ' ', ',', '.', '?', '!', ';', ':', '-' },
                StringSplitOptions.RemoveEmptyEntries)
                .Where(w => w.Length > 1 && !stopWords.Contains(w))
                .Distinct()
                .ToList();

            return words;
        }

        private string NormalizeForCache(string question)
        {
            var normalized = question.ToLower().Trim();
            normalized = Regex.Replace(normalized, @"[^\w\s]", "");
            normalized = Regex.Replace(normalized, @"\s+", " ");
            return normalized;
        }

        private void CleanExpiredCache()
        {
            var expiredKeys = _responseCache
                .Where(kv => DateTime.Now - kv.Value.CachedAt >= _cacheExpiry)
                .Select(kv => kv.Key)
                .ToList();

            foreach (var key in expiredKeys)
            {
                _responseCache.TryRemove(key, out _);
            }
            Console.WriteLine($"[Cache] Cleaned {expiredKeys.Count} expired entries. Remaining: {_responseCache.Count}");
        }
    }
}
