import { createContext, useContext, useState, ReactNode } from 'react';
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
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connect = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            const userAddress = await blockchainService.connect();
            setAddress(userAddress);
            const userBalance = await blockchainService.getBalance(userAddress);
            setBalance(userBalance);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect');
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <BlockchainContext.Provider value={{ address, balance, connect, isConnecting, error }}>
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