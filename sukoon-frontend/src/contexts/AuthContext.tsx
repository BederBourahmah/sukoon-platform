import { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { ethers } from 'ethers';
import { authService } from '../services/auth';

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    error: string | null;
    authenticate: (provider: ethers.BrowserProvider, address: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const authAttemptedRef = useRef(false);

    const authenticate = async (provider: ethers.BrowserProvider, address: string) => {
        if (isAuthenticating || token || authAttemptedRef.current) {
            return;
        }

        authAttemptedRef.current = true;
        setIsAuthenticating(true);
        setError(null);
        try {
            const response = await authService.authenticate(provider, address);
            setToken(response.token);
            localStorage.setItem('auth_token', response.token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
            setToken(null);
            localStorage.removeItem('auth_token');
            authAttemptedRef.current = false; // Reset on error to allow retry
        } finally {
            setIsAuthenticating(false);
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('auth_token');
        authAttemptedRef.current = false;
    };

    return (
        <AuthContext.Provider 
            value={{
                token,
                isAuthenticated: !!token,
                isAuthenticating,
                error,
                authenticate,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
