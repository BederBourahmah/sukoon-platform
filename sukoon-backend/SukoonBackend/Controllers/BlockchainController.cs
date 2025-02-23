using Microsoft.AspNetCore.Mvc;
using SukoonBackend.Services;
using Microsoft.AspNetCore.Authorization;

namespace SukoonBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class BlockchainController : ControllerBase
    {
        private readonly IBlockchainService _blockchainService;

        public BlockchainController(IBlockchainService blockchainService)
        {
            _blockchainService = blockchainService;
        }

        [HttpGet]
        [Authorize(Roles = $"{UserRoles.User},{UserRoles.Admin}")]
        public IActionResult GetStatus()
        {
            return Ok(new { 
                status = "Connected",
                message = "Blockchain interaction is ready",
                timestamp = DateTime.UtcNow
            });
        }

        [HttpGet("contract/{address}")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<IActionResult> GetContractBalance(string address)
        {
            try
            {
                var balance = await _blockchainService.GetContractBalance(address);
                return Ok(new { 
                    status = "Success",
                    balance = balance,
                    contractAddress = address,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    status = "Error",
                    message = ex.Message
                });
            }
        }
    }
} 