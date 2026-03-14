using GTG_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace GTG_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly AiChatService _aiChatService;

        public ChatController(AiChatService aiChatService)
        {
            _aiChatService = aiChatService;
        }

        // POST: api/chat/send
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { message = "Tin nhắn không được để trống" });
            }

            try
            {
                var modelKey = string.IsNullOrEmpty(request.Model) ? "gemini" : request.Model;
                var response = await _aiChatService.GetAnswerAsync(request.UserId, request.Message, modelKey);
                return Ok(new ChatResponse
                {
                    Message = response,
                    Model = modelKey,
                    Timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Chat Error: {ex.Message}");
                return StatusCode(500, new { message = "Đã có lỗi xảy ra. Vui lòng thử lại." });
            }
        }

        // GET: api/chat/history/{userId}
        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetChatHistory(int userId)
        {
            try
            {
                var history = await _aiChatService.GetChatHistoryAsync(userId);
                var result = history.Select(h => new
                {
                    h.Id,
                    h.UserMessage,
                    h.BotResponse,
                    h.ModelUsed,
                    h.SentAt
                });
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Chat History Error: {ex.Message}");
                return StatusCode(500, new { message = "Không thể tải lịch sử chat." });
            }
        }

        // GET: api/chat/models
        [HttpGet("models")]
        public IActionResult GetAvailableModels()
        {
            var models = _aiChatService.GetAvailableModels();
            return Ok(models);
        }
    }

    // DTOs
    public class ChatRequest
    {
        public int UserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Model { get; set; }
    }

    public class ChatResponse
    {
        public string Message { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
