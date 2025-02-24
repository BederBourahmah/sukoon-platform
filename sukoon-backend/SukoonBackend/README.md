# Sukoon Backend

## Prerequisites
- .NET 8.0 SDK
- Docker and Docker Compose
- Visual Studio Code with C# Dev Kit extension

## Development Setup with Debugging

1. Open the project in VS Code:
```bash
code .
```

2. Start debugging:
   - Press F5 or click the "Run and Debug" button in VS Code
   - Wait for Docker containers to start and health checks to pass
   - When prompted to select a process, choose `SukoonBackend` from the list
   - Set breakpoints and debug as normal

3. When finished:
   - Stop debugging (Shift+F5)
   - Containers and their volumes will be automatically removed
   - Allow the cleanup process to complete (this may take several seconds)
   - Wait for cleanup to finish before starting the debugger again

Services will be available at:
- API and Swagger UI: http://localhost:5179/swagger
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Troubleshooting
- If the debugger fails to attach, wait a few more seconds and try again
- Ensure all containers are healthy: `docker compose ps`
- View container logs: `docker compose logs -f`
- If containers remain after stopping the debugger:
  1. The cleanup process might have failed
  2. Run `docker compose down -v` manually in the sukoon-backend directory
  3. Wait for the cleanup to complete before restarting the debugger

## Docker Commands Reference
- View logs: `docker compose logs -f`
- Restart services: `docker compose restart`
- Stop services: `docker compose down`
- Stop and remove volumes: `docker compose down -v`
