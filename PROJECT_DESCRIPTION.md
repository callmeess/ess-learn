# EssLearn

EssLearn is a self-hosted learning-video manager designed to import, download, and organize educational videos (e.g., from YouTube) for offline study. It provides backend APIs, a lightweight frontend UI, and a simple persistent store to track downloads and learning progress.

## Purpose

- Collect and curate learning playlists and individual videos.
- Download videos in preferred formats and qualities for offline consumption.
- Track user progress per video and manage downloaded assets on disk.

## Highlights / Technical Features

- Backend: .NET (C#) Web API serving endpoints for import, listing, downloads, and progress tracking.
- Frontend: Vite + React + TypeScript single-page app for browsing, importing, and downloading content.
- Video import: Uses `yt-dlp` to query video metadata and available formats via `--dump-json`.
  - JSON output from `yt-dlp` is parsed robustly using `System.Text.Json` with careful null handling.
  - Deduplication of format entries to avoid repeated identical options.
  - Format quality detection falls back to `format_note`/`format` when resolution fields are missing.
- Video download: Drives `yt-dlp` for downloads with `--newline` streaming output.
  - Logs `yt-dlp` stdout (debug) and stderr (error) for diagnostics.
  - Parses progress lines and reports download percentage to logs (and can be wired to UI progress events).
- Storage:
  - Downloads are stored under a configurable path (`VideoStorage:DownloadPath`).
  - Entity models and EF Core migrations exist in `EssLearn.Infrastructure` to persist channels, playlists, videos, and download progress.
- Services and Interfaces:
  - `IVideoDownloadService` abstracts the download/import operations.
  - `IYouTubeService` (and related) handle import/parsing logic.
- Dev / Ops:
  - Docker support via top-level `docker-compose.yml` and per-service Dockerfiles for backend and frontend.
  - Configuration-driven (appsettings.json + environment overrides) for paths and runtime behavior.

## Architecture Overview

- API layer (`EssLearn.Api`) exposes REST endpoints consumed by the SPA.
- Core project (`EssLearn.Core`) defines entities, DTOs, and service interfaces.
- Infrastructure (`EssLearn.Infrastructure`) implements data access (EF Core), services (download, import), and migrations.
- Frontend (`frontend/`) is a Vite React app that lists playlists/videos and triggers imports/downloads.

## Key Endpoints (example)

- POST /api/import/youtube - import a YouTube playlist or channel
- GET /api/videos/{id}/formats - list available formats for a video
- POST /api/videos/{id}/download - start a download for given format
- GET /api/videos/{id}/progress - query download/progress status

(See `EssLearn.Api/Controllers` for controllers and route details.)

## How to Run (local dev)

1. Backend (requires .NET SDK):

```bash
cd backend
dotnet build
dotnet run --project EssLearn.Api
```

2. Frontend:

```bash
cd frontend
npm install
npm run dev
```

3. Using Docker / Compose:

```bash
docker-compose up --build
```

Note: `yt-dlp` must be available in the runtime environment for import and download features to work. On Linux you can install with your package manager or pip: `pip install yt-dlp`.

## Implementation Notes & Tips

- `VideoDownloadService` runs `yt-dlp` as a subprocess and parses streaming stdout to extract download progress; logs are available for troubleshooting.
- Formats parsing uses safe JSON helpers (`GetNullableInt32`, `GetNullableInt64`, `GetNullableString`) to avoid runtime exceptions when fields are `null` or absent.
- Downloaded files are named by video id and quality template; adjust `VideoStorage:DownloadPath` in configuration for a custom location.

## Next Improvements (ideas)

- Add real-time progress push to frontend (SignalR or WebSockets) instead of only logging.
- Persist download tasks and retry logic for transient failures.
- Automatic cleanup policy for old downloads.
- Multi-tenant/user support with per-user playlists and permissions.

---

For more details, check the code in the following folders:
- `backend/EssLearn.Api` - API controllers and startup
- `backend/EssLearn.Core` - domain models and interfaces
- `backend/EssLearn.Infrastructure` - EF migrations and services
- `frontend/` - React + Vite UI
