FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["SukoonBackend/SukoonBackend.csproj", "SukoonBackend/"]
RUN dotnet restore "SukoonBackend/SukoonBackend.csproj"

# Copy the rest of the code
COPY . .
WORKDIR "/src/SukoonBackend"

# Build and publish
RUN dotnet build "SukoonBackend.csproj" -c Release -o /app/build
RUN dotnet publish "SukoonBackend.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SukoonBackend.dll"]
