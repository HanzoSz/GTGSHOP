using System.Text;
using System.Text.Json;
using GTG_Backend.Models;

namespace GTG_Backend.Services
{
    /// <summary>
    /// Gemini AI Provider — gọi Google Gemini API
    /// </summary>
    public class GeminiProvider : IAiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<GeminiProvider> _logger;

        public string ModelDisplayName => "Gemini 2.5 Flash";
        public string ModelKey => "gemini";

        public GeminiProvider(HttpClient httpClient, IConfiguration configuration, ILogger<GeminiProvider> logger)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"]
                ?? throw new InvalidOperationException("Gemini:ApiKey is required in configuration");
            _logger = logger;
        }

        public async Task<string> CallApiAsync(string systemPrompt, string userMessage, List<ChatHistory> chatHistory)
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";

            // Build contents array: history + current message
            var contents = new List<object>();

            foreach (var chat in chatHistory)
            {
                contents.Add(new
                {
                    role = "user",
                    parts = new[] { new { text = chat.UserMessage } }
                });
                contents.Add(new
                {
                    role = "model",
                    parts = new[] { new { text = chat.BotResponse } }
                });
            }

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

            // Retry logic
            int maxRetries = 3;
            int delayMs = 2000;

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                    _logger.LogInformation("[Gemini] Attempt {Attempt}/{MaxRetries} - history: {Count} turns", attempt, maxRetries, chatHistory.Count);

                    var response = await _httpClient.PostAsync(url, httpContent);
                    var responseBody = await response.Content.ReadAsStringAsync();

                    if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                    {
                        if (attempt < maxRetries)
                        {
                            _logger.LogWarning("[Gemini] Rate limited! Waiting {Delay}ms...", delayMs);
                            await Task.Delay(delayMs);
                            delayMs *= 3;
                            continue;
                        }
                        return "⏳ Gemini AI đang quá tải. Vui lòng thử model NVIDIA hoặc đợi 1 phút rồi thử lại! 🙏";
                    }

                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogError("[Gemini] API Error: {Status} - {Body}", response.StatusCode, responseBody);
                        return $"⚠️ Gemini API Error ({response.StatusCode}): Vui lòng thử model NVIDIA hoặc kiểm tra API key.";
                    }

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
                    _logger.LogError(ex, "[Gemini] Exception attempt {Attempt}", attempt);
                    if (attempt == maxRetries)
                        return $"⚠️ Lỗi kết nối Gemini AI: {ex.Message}. Thử chuyển sang model NVIDIA nhé!";
                    await Task.Delay(delayMs);
                    delayMs *= 3;
                }
            }

            return "⚠️ Không thể kết nối đến Gemini AI. Vui lòng thử model NVIDIA.";
        }
    }
}
