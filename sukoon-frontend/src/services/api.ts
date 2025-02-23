import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'https://localhost:7047'; // From your launchSettings.json

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Track if we're currently refreshing the token to prevent multiple refresh attempts
let isRefreshing = false;
// Queue of requests that failed due to expired token and waiting for refresh
let pendingRequests: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

// Create a reference to refreshAccessToken outside React components
let refreshTokenFn: () => Promise<void>;
export const setRefreshTokenFunction = (fn: () => Promise<void>) => {
    refreshTokenFn = fn;
};

// Process all pending requests after token refresh
const processPendingRequests = (error: any = null) => {
    pendingRequests.forEach(request => {
        if (error) {
            request.reject(error);
        } else {
            request.resolve();
        }
    });
    pendingRequests = [];
};

// Add access token to all requests
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 Unauthorized errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const failedRequest = error.config;
        
        // If request failed with 401 (Unauthorized) and we haven't tried to refresh yet
        if (error.response?.status === 401 && !failedRequest._retry) {
            
            // If we're already refreshing the token
            if (isRefreshing) {
                // Add this request to the queue and retry it after refresh
                return new Promise((resolve, reject) => {
                    pendingRequests.push({ resolve, reject });
                }).then(() => {
                    // Retry the original request with new token
                    return api(failedRequest);
                });
            }

            // Mark this request as retried to prevent infinite loops
            failedRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh the access token
                await refreshTokenFn(); // Use the stored function reference
                
                // Process any requests that were waiting for the refresh
                processPendingRequests();
                
                // Retry the original request that triggered the refresh
                return api(failedRequest);
            } catch (refreshError) {
                // If refresh failed, reject all pending requests
                processPendingRequests(refreshError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        // If error wasn't 401 or refresh failed, reject the request
        return Promise.reject(error);
    }
);

export const blockchainService = {
    getStatus: async () => {
        try {
            const response = await api.get('/blockchain');
            return response.data;
        } catch (error) {
            console.error('Error fetching blockchain status:', error);
            throw error;
        }
    },
    
    getContractBalance: async (contractAddress: string) => {
        try {
            const response = await api.get(`/blockchain/contract/${contractAddress}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching contract balance:', error);
            throw error;
        }
    }
};

export default api; 