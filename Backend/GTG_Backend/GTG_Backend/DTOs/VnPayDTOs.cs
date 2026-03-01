namespace GTG_Backend.DTOs
{
    /// <summary>
    /// Request tạo URL thanh toán VnPay
    /// </summary>
    public class VnPayPaymentRequest
    {
        public int OrderId { get; set; }
        public string? BankCode { get; set; }
    }

    /// <summary>
    /// Response trả về URL thanh toán VnPay
    /// </summary>
    public class VnPayPaymentResponse
    {
        public string PaymentUrl { get; set; } = string.Empty;
        public string OrderCode { get; set; } = string.Empty;
    }

    /// <summary>
    /// Kết quả callback trả về cho frontend
    /// </summary>
    public class VnPayCallbackResponse
    {
        public bool IsSuccess { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string ResponseCode { get; set; } = string.Empty;
        public string TransactionNo { get; set; } = string.Empty;
    }
}
