namespace GTG_Backend.Services
{
    /// <summary>
    /// Interface chung cho các AI Provider (Strategy Pattern)
    /// Dễ mở rộng thêm model mới: chỉ cần implement interface này
    /// </summary>
    public interface IAiService
    {
        /// <summary>
        /// Tên hiển thị của model (vd: "Gemini 2.5 Flash", "NVIDIA Llama 3.1")
        /// </summary>
        string ModelDisplayName { get; }

        /// <summary>
        /// Key identifier (vd: "gemini", "nvidia")
        /// </summary>
        string ModelKey { get; }

        /// <summary>
        /// Gọi API của AI provider
        /// </summary>
        /// <param name="systemPrompt">System prompt đã build sẵn (chứa context sản phẩm)</param>
        /// <param name="userMessage">Câu hỏi hiện tại của user</param>
        /// <param name="chatHistory">Lịch sử chat gần đây</param>
        /// <returns>Response text từ AI</returns>
        Task<string> CallApiAsync(string systemPrompt, string userMessage, List<Models.ChatHistory> chatHistory);
    }
}
