using Microsoft.AspNetCore.Mvc;
using SukoonBackend.Models;
using SukoonBackend.Services;

namespace SukoonBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("nonce")]
        public ActionResult<string> GetNonce([FromBody] NonceRequest request)
        {
            if (string.IsNullOrEmpty(request.Address))
            {
                return BadRequest("Address is required");
            }

            var nonce = _authService.GenerateNonce(request.Address);
            return Ok(nonce);
        }

        [HttpPost("verify")]
        public ActionResult<AuthResponse> VerifySignature([FromBody] VerifyRequest request)
        {
            if (string.IsNullOrEmpty(request.Address) || 
                string.IsNullOrEmpty(request.Signature) || 
                string.IsNullOrEmpty(request.Nonce))
            {
                return BadRequest("Address, signature, and nonce are required");
            }

            if (!_authService.VerifySignature(request.Address, request.Signature, request.Nonce))
            {
                return Unauthorized("Invalid signature");
            }

            var tokens = _authService.GenerateTokens(request.Address);
            return Ok(new AuthResponse 
            { 
                AccessToken = tokens.AccessToken,
                RefreshToken = tokens.RefreshToken,
                Address = request.Address
            });
        }

        [HttpPost("refresh")]
        public ActionResult<AuthResponse> RefreshToken([FromBody] RefreshRequest request)
        {
            var tokens = _authService.GenerateTokens(request.Address);
            return Ok(tokens);
        }
    }
}