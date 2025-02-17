using Nethereum.Web3;
using Nethereum.Contracts;

namespace SukoonBackend.Services
{
    public interface IBlockchainService
    {
        Task<string> GetContractBalance(string contractAddress);
    }

    public class BlockchainService : IBlockchainService
    {
        private readonly Web3 _web3;
        private readonly IConfiguration _configuration;

        public BlockchainService(IConfiguration configuration)
        {
            _configuration = configuration;
            _web3 = new Web3("http://127.0.0.1:8545"); // Hardhat's default URL
        }

        public async Task<string> GetContractBalance(string contractAddress)
        {
            var balance = await _web3.Eth.GetBalance.SendRequestAsync(contractAddress);
            return Web3.Convert.FromWei(balance).ToString();
        }
    }
} 