using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Nethereum.Signer;
using SukoonBackend.Models;
using System.Security.Cryptography;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace SukoonBackend.Services
{
    public interface IAuthService
    {
        string GenerateNonce(string address);
        bool VerifySignature(string address, string signature, string nonce);
        string GenerateToken(string address);
    }

    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly IDistributedCache _cache;
        private readonly TimeSpan _nonceExpiration = TimeSpan.FromMinutes(5);

        public AuthService(IConfiguration configuration, IDistributedCache cache)
        {
            _configuration = configuration;
            _cache = cache;
        }

        public string GenerateNonce(string address)
        {
            var nonce = $"Welcome to Sukoon!\n\nPlease sign this message to verify your wallet ownership.\n\nNonce: {Guid.NewGuid()}";
            var cacheKey = GetCacheKey(address);
            
            var options = new DistributedCacheEntryOptions()
                .SetAbsoluteExpiration(_nonceExpiration);

            _cache.SetString(cacheKey, nonce, options);
            
            return nonce;
        }

        public bool VerifySignature(string address, string signature, string nonce)
        {
            var cacheKey = GetCacheKey(address);
            var storedNonce = _cache.GetString(cacheKey);

            if (string.IsNullOrEmpty(storedNonce) || nonce != storedNonce)
            {
                return false;
            }

            try
            {
                var signer = new EthereumMessageSigner();
                var recoveredAddress = signer.EncodeUTF8AndEcRecover(nonce, signature);
                return recoveredAddress.ToLower() == address.ToLower();
            }
            finally
            {
                _cache.Remove(cacheKey);
            }
        }

        private string GetCacheKey(string address)
        {
            return $"nonce:{address.ToLower()}";
        }

        public string GenerateToken(string address)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key not configured")));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, address),
                new Claim(ClaimTypes.Role, "User")
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
