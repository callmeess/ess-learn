FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY EssLearn.Core/EssLearn.Core.csproj EssLearn.Core/
COPY EssLearn.Infrastructure/EssLearn.Infrastructure.csproj EssLearn.Infrastructure/
COPY EssLearn.Api/EssLearn.Api.csproj EssLearn.Api/
RUN dotnet restore EssLearn.Api/EssLearn.Api.csproj
COPY . .
RUN dotnet publish EssLearn.Api/EssLearn.Api.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "EssLearn.Api.dll"]
