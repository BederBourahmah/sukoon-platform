# Deploying to Azure Kubernetes Service (AKS)

## Prerequisites
- Azure CLI
- kubectl
- Helm

## Infrastructure Setup
1. Create AKS cluster (example with basic settings) 
```bash
az aks create \
  --resource-group sukoon-rg \
  --name sukoon-aks \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys
```


## Database & Cache
- Use Azure Database for PostgreSQL - Flexible Server
- Azure Cache for Redis
- Both should be in the same VNET as AKS

## Kubernetes Resources
1. Create secrets for database and Redis:
```bash
kubectl create secret generic sukoon-secrets \
  --from-literal=postgres-connection="Host=..." \
  --from-literal=redis-connection="..."
```

2. Apply Kubernetes manifests (stored in `/k8s` directory):
```bash
kubectl apply -f k8s/
```

## Monitoring & Logging
- Enable Azure Monitor for containers
- Configure Application Insights
- Set up Log Analytics workspace

## Security Considerations
- Use managed identities
- Configure network policies
- Enable Azure Key Vault integration
- Set up Azure AD pod-managed identities