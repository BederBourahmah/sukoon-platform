# Sukoon Backend

## Prerequisites
- .NET 8.0 SDK
- Docker and Docker Compose

## Development Setup

1. Start all services:
```bash
docker compose up --build -d
```

2. Debug in VSCode:
   - Open VSCode
   - Press F5 to attach debugger to container
   - Set breakpoints and debug as normal

Services will be available at:
- API and Swagger UI: http://localhost:5179/swagger
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Docker Commands Reference
- View logs: `docker compose logs -f`
- Restart services: `docker compose restart`
- Stop services: `docker compose down`
- Stop and remove volumes: `docker compose down -v`
