using Microsoft.AspNetCore.Mvc;

namespace SukoonBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BlockchainController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetStatus()
        {
            return Ok(new { status = "Blockchain interaction will go here." });
        }
    }
} 