import { useBlockchain } from '../contexts/BlockchainContext';
import { blockchainService } from '../services/api';
import { useState } from 'react';

function HomePage() {
    const { address, balance, connect, isConnecting, error } = useBlockchain();
    const [contractBalance, setContractBalance] = useState<string | null>(null);
    const [contractAddress, setContractAddress] = useState<string>('');

    const handleCheckBalance = async () => {
        try {
            const result = await blockchainService.getContractBalance(contractAddress);
            setContractBalance(result.balance);
        } catch (err) {
            console.error('Error checking contract balance:', err);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Welcome to Sukoon</h1>
            <p className="mb-4">Your Sharia-compliant vehicle financing platform.</p>
            
            <div className="mb-4">
                {!address ? (
                    <button 
                        onClick={connect}
                        disabled={isConnecting}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                ) : (
                    <div>
                        <p>Connected Address: {address}</p>
                        <p>Balance: {balance} ETH</p>
                    </div>
                )}
                
                {error && (
                    <p className="text-red-500 mt-2">{error}</p>
                )}
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Check Contract Balance</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        placeholder="Enter contract address"
                        className="flex-1 p-2 border rounded"
                    />
                    <button
                        onClick={handleCheckBalance}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Check Balance
                    </button>
                </div>
                {contractBalance && (
                    <p className="mt-4">Contract Balance: {contractBalance} ETH</p>
                )}
            </div>
        </div>
    );
}

export default HomePage;