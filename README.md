# EssLearn

A self-hosted platform for organizing learning fields, curating video playlists, tracking progress, and downloading videos for offline study.

## Features

- **Learning fields** — organize content by topic (e.g. Machine Learning, DevOps)
- **Playlists & videos** — manage playlists and individual videos, manually or via YouTube import
- **Progress tracking** — mark videos as not started, in progress, or completed; per-playlist completion
- **Downloads** — download videos in the format and quality you choose using `yt-dlp`
- **Streaming** — transcoded HLS streaming with adaptive playback
- **Roadmaps** — structured learning paths with ordered nodes and status tracking
- **Dashboard** — aggregate stats, recent videos, and progress at a glance

## Tech Stack

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Backend  | .NET 10, ASP.NET Core Web API                     |
| Data     | PostgreSQL, EF Core                               |
| Cache    | Redis                                             |
| Storage  | MinIO (blob storage for videos, images, icons)    |
| Media    | `yt-dlp`, FFmpeg (transcoding → HLS)              |
| Frontend | Angular 21, Tailwind CSS, hls.js (with SSR)       |
| Infra    | Docker Compose                                    |

## Repository Layout

```
├── docker-compose.yml
├── backend/
│   ├── EssLearn.Api/              # ASP.NET Core Web API, controllers
│   ├── EssLearn.Application/      # DTOs, application services
│   ├── EssLearn.Core/             # Entities, enums, domain interfaces
│   └── EssLearn.Infrastructure/   # EF Core, repositories, MinIO/Redis services
└── ess-front/                     # Angular SPA (SSR)
```

## Getting Started

### Docker Compose

```bash
cp .env.example .env   # or create .env with your values
docker compose up --build
```

| Service   | URL                              |
| --------- | -------------------------------- |
| Frontend  | http://localhost:5173            |
| API       | http://localhost:5083            |
| Swagger   | http://localhost:5083/swagger    |
| MinIO     | http://localhost:9001            |

### Local development

Backend (.NET SDK required):

```bash
cd backend
dotnet run --project EssLearn.Api
```

Frontend (Node.js required):

```bash
cd ess-front
npm install
npm run start
```

> The database schema is migrated automatically on API startup. PostgreSQL and Redis must be running (`docker compose up db redis`).

## Configuration

Create a `.env` file at the repo root:

```
YOUTUBE_API_KEY=your_key_here
MINIO_ROOT_USER=esslearn
MINIO_ROOT_PASSWORD=your_password
```

`yt-dlp` must be available in the runtime environment for import and download features (installed automatically inside the API Docker image).

## API Overview

Primary endpoints (full reference available via Swagger):

| Area          | Endpoints                                                     |
| ------------- | ------------------------------------------------------------- |
| Import        | `POST /api/import/playlist`, `POST /api/import/video`         |
| Fields        | `GET/POST/PUT/DELETE /api/fields`                             |
| Playlists     | `GET/POST/PUT/DELETE /api/playlists`                          |
| Videos        | `GET/PUT /api/videos/{id}`, progress, thumbnail               |
| Downloads     | `GET /api/videos/{id}/download/formats`, `POST/DELETE`         |
| Streaming     | `GET /api/streaming/{videoId}/status`, `/master.m3u8`         |
| Roadmaps      | `GET/POST/PUT/DELETE /api/roadmaps`, nodes                    |
| Dashboard     | `GET /api/dashboard`                                          |
