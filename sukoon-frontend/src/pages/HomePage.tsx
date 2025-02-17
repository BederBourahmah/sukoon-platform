import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';

function HomePage() {
    const { 
        address, 
        balance, 
        isConnecting, 
        error: walletError,
        connectMetaMask,
        connectWalletConnect,
        disconnect
    } = useWallet();

    const {
        isAuthenticated,
        isAuthenticating,
        error: authError
    } = useAuth();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-2xl">
                <h1 className="text-4xl font-bold mb-4">Welcome to Sukoon</h1>
                <p className="text-xl mb-8">Your Sharia-compliant vehicle financing platform.</p>
                
                <div className="mb-4">
                    {!address ? (
                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={connectMetaMask}
                                disabled={isConnecting}
                                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                            >
                                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                            </button>
                            <button 
                                onClick={connectWalletConnect}
                                disabled={isConnecting}
                                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                            >
                                {isConnecting ? 'Connecting...' : 'Connect WalletConnect'}
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-lg">Connected Address: {address}</p>
                            <p className="text-lg mb-2">Balance: {balance} ETH</p>
                            <p className="text-lg mb-4">
                                Status: {isAuthenticating ? 'Authenticating...' : 
                                        isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                            </p>
                            <button
                                onClick={disconnect}
                                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
                            >
                                Disconnect
                            </button>
                        </div>
                    )}
                    
                    {(walletError || authError) && (
                        <p className="text-red-500 mt-4">{walletError || authError}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;