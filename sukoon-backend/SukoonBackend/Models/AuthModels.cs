namespace SukoonBackend.Models
{
    public class NonceRequest
    {
        public string Address { get; set; } = string.Empty;
    }

    public class VerifyRequest
    {
        public string Address { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
        public string Nonce { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }
}
