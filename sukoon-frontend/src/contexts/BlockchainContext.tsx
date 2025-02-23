import { createContext, useContext, useState, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { blockchainService } from '../services/blockchain';

interface BlockchainContextType {
    address: string | null;
    balance: string | null;
    connect: () => Promise<void>;
    isConnecting: boolean;
    error: string | null;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { connectMetaMask, connectWalletConnect, address, balance } = useWallet();

    const connect = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            if (window.ethereum) {
                await connectMetaMask();
            } else {
                await connectWalletConnect();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect');
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <BlockchainContext.Provider value={{ 
            address, 
            balance, 
            connect, 
            isConnecting, 
            error 
        }}>
            {children}
        </BlockchainContext.Provider>
    );
}

export function useBlockchain() {
    const context = useContext(BlockchainContext);
    if (context === undefined) {
        throw new Error('useBlockchain must be used within a BlockchainProvider');
    }
    return context;
} 