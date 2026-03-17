using System.Text;
using System.Text.Json;
using GTG_Backend.Models;

namespace GTG_Backend.Services
{
    /// <summary>
    /// NVIDIA Llama-3.3-Nemotron-Super-49B Provider — gọi NVIDIA NIM API
    /// API format: OpenAI-compatible (messages array)
    /// </summary>
    public class NvidiaProvider : IAiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<NvidiaProvider> _logger;

        public string ModelDisplayName => "NVIDIA Nemotron";
        public string ModelKey => "nvidia";

        public NvidiaProvider(HttpClient httpClient, IConfiguration configuration, ILogger<NvidiaProvider> logger)
        {
            _httpClient = httpClient;
            _httpClient.Timeout = TimeSpan.FromSeconds(180); // NVIDIA model cần thời gian xử lý lâu hơn
            _apiKey = configuration["Nvidia:ApiKey"]
                ?? throw new InvalidOperationException("Nvidia:ApiKey is required in configuration");
            _logger = logger;
        }

        public async Task<string> CallApiAsync(string systemPrompt, string userMessage, List<ChatHistory> chatHistory)
        {
            var url = "https://integrate.api.nvidia.com/v1/chat/completions";

            // Build OpenAI-compatible messages array
            var messages = new List<object>();

            // System message
            messages.Add(new { role = "system", content = systemPrompt });

            // Chat history
            foreach (var chat in chatHistory)
            {
                messages.Add(new { role = "user", content = chat.UserMessage });
                messages.Add(new { role = "assistant", content = chat.BotResponse });
            }

            // Current user message
            messages.Add(new { role = "user", content = userMessage });

            var requestBody = new
            {
                model = "meta/llama-3.1-8b-instruct",
                messages = messages,
                temperature = 0.3,
                max_tokens = 1024, // Giảm từ 4096 xuống 1024 để tránh lỗi vượt quá giới hạn output của Endpoint miễn phí
                top_p = 0.8,
                stream = false // Thêm cờ này để đảm bảo NVIDIA không hiểu nhầm bạn muốn dùng Server-Sent Events (SSE)
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
                    var request = new HttpRequestMessage(HttpMethod.Post, url);
                    request.Headers.Add("Authorization", $"Bearer {_apiKey}");
                    request.Headers.Add("Accept", "application/json");
                    request.Content = new StringContent(jsonContent, Encoding.UTF8);
                    request.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");

                    _logger.LogInformation("[NVIDIA] Attempt {Attempt}/{MaxRetries} - history: {Count} turns, payload: {Size} chars", attempt, maxRetries, chatHistory.Count, jsonContent.Length);

                    var response = await _httpClient.SendAsync(request);
                    var responseBody = await response.Content.ReadAsStringAsync();

                    if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                    {
                        if (attempt < maxRetries)
                        {
                            _logger.LogWarning("[NVIDIA] Rate limited! Waiting {Delay}ms...", delayMs);
                            await Task.Delay(delayMs);
                            delayMs *= 3;
                            continue;
                        }
                        return "⏳ NVIDIA AI đang quá tải. Vui lòng thử model Gemini hoặc đợi 1 phút rồi thử lại! 🙏";
                    }

                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogError("[NVIDIA] API Error: {Status} - {Body}", response.StatusCode, responseBody);
                        return $"⚠️ NVIDIA API Error ({response.StatusCode}): Vui lòng thử model Gemini hoặc kiểm tra API key.";
                    }

                    // Parse OpenAI-compatible response
                    using var doc = JsonDocument.Parse(responseBody);
                    var text = doc.RootElement
                        .GetProperty("choices")[0]
                        .GetProperty("message")
                        .GetProperty("content")
                        .GetString();

                    return text ?? "Xin lỗi, tôi không thể xử lý câu hỏi này. Vui lòng thử lại! 🙏";
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[NVIDIA] Exception attempt {Attempt}", attempt);
                    if (attempt == maxRetries)
                        return $"⚠️ Lỗi kết nối NVIDIA AI: {ex.Message}. Thử chuyển sang model Gemini nhé!";
                    await Task.Delay(delayMs);
                    delayMs *= 3;
                }
            }

            return "⚠️ Không thể kết nối đến NVIDIA AI. Vui lòng thử model Gemini.";
        }
    }
}
