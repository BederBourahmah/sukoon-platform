import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/ethereum-provider';
import detectEthereumProvider from '@metamask/detect-provider';
import { useAuth } from './AuthContext';

interface WalletState {
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

interface WalletActions {
  connectMetaMask: () => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

type WalletContextType = WalletState & WalletActions;

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const INITIAL_WALLET_STATE: WalletState = {
  address: null,
  balance: null,
  isConnecting: false,
  error: null,
};

const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const SUPPORTED_CHAINS = [31337] as [number]; // Type as tuple without readonly

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>(INITIAL_WALLET_STATE);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const { authenticate } = useAuth();

  const resetWalletState = () => {
    setWalletState(INITIAL_WALLET_STATE);
    setProvider(null);
  };

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
    setWalletState({
      ...INITIAL_WALLET_STATE,
      error: errorMessage
    });
    setProvider(null);
  };

  const updateWalletInfo = async (ethersProvider: ethers.Provider, walletAddress: string) => {
    try {
      const balance = await ethersProvider.getBalance(walletAddress);
      setWalletState(prev => ({
        ...prev,
        address: walletAddress,
        balance: ethers.formatEther(balance),
        error: null
      }));
      setProvider(ethersProvider);

      // Only authenticate if we don't already have a token
      const existingToken = localStorage.getItem('auth_token');
      if (!existingToken) {
        await authenticate(ethersProvider as ethers.BrowserProvider, walletAddress);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const connectMetaMask = async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      const isMetaMaskInstalled = await detectEthereumProvider();
      if (!isMetaMaskInstalled) {
        throw new Error('Please install MetaMask');
      }

      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!accounts.length) {
        throw new Error('No accounts found');
      }

      await updateWalletInfo(ethersProvider, accounts[0]);
    } catch (error) {
      handleError(error);
    } finally {
      setWalletState(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const connectWalletConnect = async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const wcProvider = await WalletConnectProvider.init({
        projectId: WALLET_CONNECT_PROJECT_ID,
        chains: SUPPORTED_CHAINS,
        optionalChains: SUPPORTED_CHAINS,
        showQrModal: true
      });

      await wcProvider.enable();
      
      const ethersProvider = new ethers.BrowserProvider(wcProvider);
      const accounts = await ethersProvider.listAccounts();
      
      if (!accounts.length) {
        throw new Error('No accounts found');
      }

      const address = await accounts[0].getAddress();
      await updateWalletInfo(ethersProvider, address);

      wcProvider.on('disconnect', resetWalletState);
    } catch (error) {
      handleError(error);
    } finally {
      setWalletState(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnect = async () => {
    if (provider) {
      resetWalletState();
    }
  };

  // Initialize MetaMask provider on mount
  useEffect(() => {
    initializeMetaMaskProvider();
  }, []);

  // Setup MetaMask event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    setupMetaMaskEventListeners();
    return cleanupMetaMaskEventListeners;
  }, [provider]);

  const initializeMetaMaskProvider = async () => {
    try {
      const isMetaMaskInstalled = await detectEthereumProvider();
      if (!isMetaMaskInstalled) return;

      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);
      
      await restoreExistingConnection(ethersProvider);
    } catch (error) {
      console.warn('MetaMask not detected or not accessible');
    }
  };

  const restoreExistingConnection = async (ethersProvider: ethers.Provider) => {
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts'
    });
    
    if (accounts.length > 0) {
      await updateWalletInfo(ethersProvider, accounts[0]);
    }
  };

  const setupMetaMaskEventListeners = () => {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
  };

  const cleanupMetaMaskEventListeners = () => {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleChainChanged);
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (!accounts.length) {
      resetWalletState();
      return;
    }
    
    if (provider) {
      updateWalletInfo(provider, accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const contextValue: WalletContextType = {
    ...walletState,
    connectMetaMask,
    connectWalletConnect,
    disconnect
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 