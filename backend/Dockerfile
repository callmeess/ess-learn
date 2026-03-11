FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

COPY EssLearn.Core/EssLearn.Core.csproj EssLearn.Core/
COPY EssLearn.Infrastructure/EssLearn.Infrastructure.csproj EssLearn.Infrastructure/
COPY EssLearn.Api/EssLearn.Api.csproj EssLearn.Api/

RUN dotnet restore EssLearn.Api/EssLearn.Api.csproj

COPY . .
RUN find . -type d -name obj -exec rm -rf {} + || true

RUN dotnet build EssLearn.Api/EssLearn.Api.csproj -c Release
RUN dotnet publish EssLearn.Api/EssLearn.Api.csproj -c Release -o /app/publish --no-build

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview
WORKDIR /app
COPY --from=build /app/publish .

RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg && \
    pip3 install --no-cache-dir yt-dlp && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 8080
ENTRYPOINT ["dotnet", "EssLearn.Api.dll"]