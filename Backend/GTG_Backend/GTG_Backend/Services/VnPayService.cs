using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace GTG_Backend.Services;

/// <summary>
/// VNPAY Payment Integration Service
/// Ported from official VNPAY C# ASPX example (VnPayLibrary.cs)
/// </summary>
public class VnPayService
{
    private readonly VnPayConfig _config;
    private readonly ILogger<VnPayService> _logger;

    public VnPayService(IConfiguration configuration, ILogger<VnPayService> logger)
    {
        _logger = logger;
        _config = new VnPayConfig
        {
            TmnCode = configuration["VnPay:TmnCode"]
                ?? throw new InvalidOperationException("VnPay:TmnCode is required in configuration"),
            HashSecret = configuration["VnPay:HashSecret"]
                ?? throw new InvalidOperationException("VnPay:HashSecret is required in configuration"),
            BaseUrl = configuration["VnPay:BaseUrl"] ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
            ReturnUrl = configuration["VnPay:ReturnUrl"] ?? "http://localhost:5173/payment/vnpay/return",
        };
    }

    /// <summary>
    /// Tạo URL thanh toán VnPay
    /// </summary>
    public string CreatePaymentUrl(string orderCode, decimal amount, string? bankCode, string ipAddress)
    {
        _logger.LogInformation(
            "Creating VnPay payment URL for order {OrderCode}, amount {Amount}",
            orderCode, amount);

        // Use VnPayCompare for sorting (same as official example)
        var requestData = new SortedList<string, string>(new VnPayCompare());

        requestData.Add("vnp_Version", "2.1.0");
        requestData.Add("vnp_Command", "pay");
        requestData.Add("vnp_TmnCode", _config.TmnCode);
        requestData.Add("vnp_Amount", ((long)(amount * 100)).ToString());
        requestData.Add("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
        requestData.Add("vnp_CurrCode", "VND");
        requestData.Add("vnp_IpAddr", ipAddress);
        requestData.Add("vnp_Locale", "vn");
        requestData.Add("vnp_OrderInfo", $"Thanh toan don hang {orderCode}");
        requestData.Add("vnp_OrderType", "other");
        requestData.Add("vnp_ReturnUrl", _config.ReturnUrl);
        requestData.Add("vnp_TxnRef", orderCode);
        requestData.Add("vnp_ExpireDate", DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss"));

        // Only add BankCode if provided
        if (!string.IsNullOrEmpty(bankCode))
        {
            requestData.Add("vnp_BankCode", bankCode);
        }

        // ===== EXACT COPY of official VnPayLibrary.CreateRequestUrl =====
        // Build query string with URL-encoded keys AND values
        StringBuilder data = new StringBuilder();
        foreach (KeyValuePair<string, string> kv in requestData)
        {
            if (!string.IsNullOrEmpty(kv.Value))
            {
                data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }
        }
        string queryString = data.ToString();

        var baseUrl = _config.BaseUrl + "?" + queryString;

        // Sign data = query string (URL-encoded!) WITHOUT trailing '&'
        string signData = queryString;
        if (signData.Length > 0)
        {
            signData = signData.Remove(data.Length - 1, 1);
        }

        string vnp_SecureHash = HmacSHA512(_config.HashSecret, signData);
        baseUrl += "vnp_SecureHash=" + vnp_SecureHash;

        _logger.LogInformation(
            "VnPay payment URL created for order {OrderCode}",
            orderCode);

        return baseUrl;
    }

    /// <summary>
    /// Validate callback data từ VnPay
    /// </summary>
    public VnPayCallbackData ValidateCallback(Dictionary<string, string> vnpayData)
    {
        var orderCode = vnpayData.GetValueOrDefault("vnp_TxnRef") ?? "";

        _logger.LogInformation(
            "Validating VnPay callback for order {OrderCode}",
            orderCode);

        var result = new VnPayCallbackData
        {
            OrderCode = orderCode,
            TransactionNo = vnpayData.GetValueOrDefault("vnp_TransactionNo") ?? "",
            Amount = long.TryParse(vnpayData.GetValueOrDefault("vnp_Amount"), out var amount)
                ? amount / 100
                : 0,
            BankCode = vnpayData.GetValueOrDefault("vnp_BankCode") ?? "",
            ResponseCode = vnpayData.GetValueOrDefault("vnp_ResponseCode") ?? "",
            Message = GetResponseMessage(vnpayData.GetValueOrDefault("vnp_ResponseCode") ?? ""),
        };

        // ===== EXACT COPY of official VnPayLibrary.ValidateSignature =====
        var secureHash = vnpayData.GetValueOrDefault("vnp_SecureHash") ?? "";

        // Build response data (sorted, URL-encoded, exclude hash fields)
        var responseData = new SortedList<string, string>(new VnPayCompare());
        foreach (var kvp in vnpayData)
        {
            if (!string.IsNullOrEmpty(kvp.Key) && kvp.Key.StartsWith("vnp_")
                && kvp.Key != "vnp_SecureHash" && kvp.Key != "vnp_SecureHashType")
            {
                responseData.Add(kvp.Key, kvp.Value);
            }
        }

        StringBuilder data = new StringBuilder();
        foreach (KeyValuePair<string, string> kv in responseData)
        {
            if (!string.IsNullOrEmpty(kv.Value))
            {
                data.Append(WebUtility.UrlEncode(kv.Key) + "=" + WebUtility.UrlEncode(kv.Value) + "&");
            }
        }
        if (data.Length > 0)
        {
            data.Remove(data.Length - 1, 1);
        }

        string expectedHash = HmacSHA512(_config.HashSecret, data.ToString());

        result.IsValidSignature = secureHash.Equals(expectedHash, StringComparison.InvariantCultureIgnoreCase);
        result.IsSuccess = result.IsValidSignature && result.ResponseCode == "00";

        _logger.LogInformation(
            "VnPay callback: {OrderCode}, Success={IsSuccess}, Code={ResponseCode}",
            orderCode, result.IsSuccess, result.ResponseCode);

        return result;
    }

    /// <summary>
    /// HmacSHA512 - exact copy from official VNPAY Utils class
    /// </summary>
    private static string HmacSHA512(string key, string inputData)
    {
        var hash = new StringBuilder();
        byte[] keyBytes = Encoding.UTF8.GetBytes(key);
        byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
        using (var hmac = new HMACSHA512(keyBytes))
        {
            byte[] hashValue = hmac.ComputeHash(inputBytes);
            foreach (var theByte in hashValue)
            {
                hash.Append(theByte.ToString("x2"));
            }
        }
        return hash.ToString();
    }

    private static string GetResponseMessage(string responseCode)
    {
        return responseCode switch
        {
            "00" => "Giao dịch thành công",
            "07" => "Trừ tiền thành công. Giao dịch bị nghi ngờ.",
            "09" => "Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking",
            "10" => "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
            "11" => "Đã hết hạn chờ thanh toán",
            "12" => "Thẻ/Tài khoản bị khóa",
            "13" => "Nhập sai mật khẩu xác thực giao dịch (OTP)",
            "24" => "Khách hàng hủy giao dịch",
            "51" => "Tài khoản không đủ số dư",
            "65" => "Tài khoản vượt quá hạn mức giao dịch trong ngày",
            "75" => "Ngân hàng thanh toán đang bảo trì",
            "79" => "Nhập sai mật khẩu thanh toán quá số lần quy định",
            "99" => "Lỗi không xác định",
            _ => "Lỗi không xác định"
        };
    }
}

/// <summary>
/// VnPay configuration
/// </summary>
public class VnPayConfig
{
    public string TmnCode { get; set; } = "";
    public string HashSecret { get; set; } = "";
    public string BaseUrl { get; set; } = "";
    public string ReturnUrl { get; set; } = "";
}

/// <summary>
/// Kết quả callback từ VnPay
/// </summary>
public class VnPayCallbackData
{
    public bool IsSuccess { get; set; }
    public bool IsValidSignature { get; set; }
    public string OrderCode { get; set; } = "";
    public string TransactionNo { get; set; } = "";
    public long Amount { get; set; }
    public string BankCode { get; set; } = "";
    public string ResponseCode { get; set; } = "";
    public string Message { get; set; } = "";
}

/// <summary>
/// VnPay string comparer - exact copy from official example
/// Uses ordinal comparison with en-US culture
/// </summary>
public class VnPayCompare : IComparer<string>
{
    public int Compare(string? x, string? y)
    {
        if (x == y) return 0;
        if (x == null) return -1;
        if (y == null) return 1;
        var vnpCompare = CompareInfo.GetCompareInfo("en-US");
        return vnpCompare.Compare(x, y, CompareOptions.Ordinal);
    }
}
