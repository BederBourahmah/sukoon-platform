import { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { ethers } from 'ethers';
import { authService } from '../services/auth';
import { setRefreshTokenFunction } from '../services/api';

interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    error: string | null;
    roles: string[];
    hasRole: (role: string) => boolean;
    authenticate: (provider: ethers.BrowserProvider, address: string) => Promise<void>;
    refreshAccessToken: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(sessionStorage.getItem('access_token'));
    const [refreshToken, setRefreshToken] = useState<string | null>(sessionStorage.getItem('refresh_token'));
    const [roles, setRoles] = useState<string[]>([]);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const authAttemptedRef = useRef(false);

    const hasRole = (role: string) => roles.includes(role);

    const parseJwt = (token: string) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    };

    const updateTokenAndRoles = (token: string) => {
        setAccessToken(token);
        sessionStorage.setItem('access_token', token);
        const decoded = parseJwt(token);
        setRoles(decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || []);
    };

    const refreshAccessToken = async () => {
        if (!refreshToken) return;
        try {
            const response = await authService.refresh(refreshToken);
            updateTokenAndRoles(response.accessToken);
        } catch (error) {
            logout();
        }
    };

    const authenticate = async (provider: ethers.BrowserProvider, address: string) => {
        if (isAuthenticating || accessToken || authAttemptedRef.current) {
            return;
        }

        authAttemptedRef.current = true;
        setIsAuthenticating(true);
        setError(null);
        try {
            const response = await authService.authenticate(provider, address);
            updateTokenAndRoles(response.accessToken);
            setRefreshToken(response.refreshToken);
            sessionStorage.setItem('refresh_token', response.refreshToken);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
            setAccessToken(null);
            setRefreshToken(null);
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
            authAttemptedRef.current = false;
        } finally {
            setIsAuthenticating(false);
        }
    };

    const logout = () => {
        setAccessToken(null);
        setRefreshToken(null);
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        authAttemptedRef.current = false;
    };

    useEffect(() => {
        setRefreshTokenFunction(refreshAccessToken);
    }, [refreshAccessToken]);

    return (
        <AuthContext.Provider 
            value={{
                accessToken,
                refreshToken,
                isAuthenticated: !!accessToken,
                isAuthenticating,
                error,
                roles,
                hasRole,
                authenticate,
                refreshAccessToken,
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
