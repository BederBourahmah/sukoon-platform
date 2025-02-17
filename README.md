# Sukoon Platform

## Overview
Sukoon is a decentralized finance platform providing Sharia-compliant real-world asset (RWA) loans, starting with Murabaha-based vehicle financing.

## Development Phases
1. Core MVP Development
2. Advanced Features and Beta Launch
3. Community Growth and Partnerships

## Setting Up
1. Clone the repository:
```bash
git clone https://github.com/BederBourahmah/sukoon-platform.git
cd sukoon-platform
```

2. Backend Setup (.NET Core):
   - Navigate to the backend directory:
   ```bash
   cd sukoon-backend/SukoonBackend
   ```
   - Install .NET dependencies:
   ```bash
   dotnet restore
   ```
   - Start the backend server:
   ```bash
   dotnet run
   ```
   The API will be available at https://localhost:7047

3. Redis Setup (required for authentication):
   ```bash
   docker run --name sukoon-redis -p 6379:6379 -d redis
   ```
   Verify Redis is running:
   ```bash
   docker ps
   ```
   You should see the Redis container in the list.

4. Frontend Setup (React + Vite):
   - Open a new terminal
   - Navigate to the frontend directory:
   ```bash
   cd sukoon-frontend
   ```
   - Install npm dependencies:
   ```bash
   npm install
   ```
   - Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at http://localhost:5173

4. Verify Setup:
   - Backend Swagger UI: https://localhost:7047/swagger
   - Frontend Homepage: http://localhost:5173
   - Test the blockchain status endpoint at http://localhost:5173

## Local Blockchain Setup

1. Install dependencies for smart contracts:
```bash
cd sukoon-backend/sukoon-smart-contracts
npm install
```

2. Start the local blockchain:
```bash
npx hardhat node
```

This will start a local blockchain network at `http://127.0.0.1:8545`

3. Deploy the Murabaha contract to the local network (in a new terminal):
```bash
cd sukoon-backend/sukoon-smart-contracts
npx hardhat run scripts/deploy.ts --network localhost
```

4. Configure MetaMask:
   - Open MetaMask and add a new network with the following details:
     - Network Name: Sukoon Local
     - RPC URL: http://127.0.0.1:8545
     - Chain ID: 31337
     - Currency Symbol: ETH

5. Import test accounts:
   - Copy one of the private keys displayed when you started the Hardhat node
   - In MetaMask, click "Import Account" and paste the private key
   - The account will be imported with 10000 test ETH

6. Verify the setup:
   - Connect your wallet on the frontend (http://localhost:5173)
   - You should see your account address and balance
   - The blockchain status endpoint should show "Connected"

## Development
- Backend API is built with .NET 8.0
- Frontend uses React 19 with TypeScript and Vite
- API documentation available through Swagger UI
- CORS is configured to allow frontend-backend communication

## Roadmap
[Link to your development roadmap]
