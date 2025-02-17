import axios from 'axios';

const API_BASE_URL = 'https://localhost:7047'; // From your launchSettings.json

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

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