import { ethers } from 'ethers';

export interface AuthResponse {
    token: string;
    address: string;
}

class AuthService {
    private readonly API_URL = 'https://localhost:7047';

    async getNonce(address: string): Promise<string> {
        const response = await fetch(`${this.API_URL}/auth/nonce`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address }),
        });

        if (!response.ok) {
            throw new Error('Failed to get nonce');
        }

        return response.text();
    }

    async verifySignature(address: string, signature: string, nonce: string): Promise<AuthResponse> {
        const response = await fetch(`${this.API_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address, signature, nonce }),
        });

        if (!response.ok) {
            throw new Error('Failed to verify signature');
        }

        return response.json();
    }

    async authenticate(provider: ethers.BrowserProvider, address: string): Promise<AuthResponse> {
        // Get nonce from backend
        const nonce = await this.getNonce(address);

        // Get signer and sign message
        const signer = await provider.getSigner();
        const signature = await signer.signMessage(nonce);

        // Verify signature and get JWT token
        return this.verifySignature(address, signature, nonce);
    }
}

export const authService = new AuthService();
