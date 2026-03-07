# EssLearn — Personal Learning & Playlist Tracker

> A self-hosted platform to organize learning paths, track video playlists, and monitor progress across multiple fields of study.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Docker Compose                    │
│                                                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  React UI  │  │  .NET API  │  │    Redis     │  │
│  │  (Vite)    │──│  (ASP.NET  │──│   Cache      │  │
│  │  :5173     │  │   8 Web    │  │   :6379      │  │
│  │            │  │   API)     │  │              │  │
│  └────────────┘  │  :5000     │  └──────────────┘  │
│                  │            │                     │
│                  │     ┌──────┴──────┐              │
│                  │     │ PostgreSQL  │              │
│                  │     │   :5432     │              │
│                  └─────┴─────────────┘              │
└─────────────────────────────────────────────────────┘
```

| Layer        | Technology              | Purpose                                  |
| ------------ | ----------------------- | ---------------------------------------- |
| Frontend     | React 18 + TypeScript   | SPA with Vite dev server                 |
| Backend API  | ASP.NET 8 Web API       | REST endpoints, business logic           |
| Database     | PostgreSQL + EF Core    | Persistent relational storage             |
| Cache        | Redis                   | Hot-path caching (dashboard stats, etc.) |
| Containers   | Docker Compose          | One-command startup for entire stack      |

---

## 2. Core Features

### 2.1 Learning Fields
- Create / edit / delete fields (e.g. "Machine Learning", "Music Theory", "DevOps")
- Each field has a name, description, icon/color, and creation date
- Fields act as top-level organizers for all content

### 2.2 Playlists
- Add playlists under a learning field
- Support YouTube playlist URLs (auto-import metadata later) or manual entry
- Attributes: title, source URL, description, total videos, thumbnail
- Track overall completion percentage per playlist

### 2.3 Videos
- Individual videos belong to a playlist
- Metadata: title, URL, duration (seconds), thumbnail URL, order/position
- Support both YouTube and local file references

### 2.4 Progress Tracking
- Per-video: mark as **not started**, **in progress**, or **completed**
- Track watched duration vs. total duration
- Per-playlist: auto-calculated completion percentage
- Per-field: aggregate stats across all playlists
- Timestamps for when progress was last updated

### 2.5 Watch Lists
- Create custom curated lists that span across fields
- Add any video from any playlist to a watch list
- Use cases: "Watch Tonight", "Review Later", "Favorites"
- Ordering support within a watch list

### 2.6 Dashboard
- Total fields, playlists, videos at a glance
- Overall completion percentage
- Recently watched videos
- Per-field progress bars
- Streak / activity calendar (days with watch activity)

---

## 3. Data Model

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ LearningField│       │   Playlist   │       │    Video     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ Id (PK)      │──┐    │ Id (PK)      │──┐    │ Id (PK)      │
│ Name         │  │    │ FieldId (FK) │  │    │ PlaylistId   │
│ Description  │  └───>│ Title        │  └───>│ Title        │
│ Color        │       │ SourceUrl    │       │ Url          │
│ Icon         │       │ Description  │       │ Duration     │
│ CreatedAt    │       │ ThumbnailUrl │       │ ThumbnailUrl │
│ UpdatedAt    │       │ CreatedAt    │       │ Position     │
└──────────────┘       │ UpdatedAt    │       │ CreatedAt    │
                       └──────────────┘       │ UpdatedAt    │
                                              └──────┬───────┘
                                                     │
                       ┌──────────────┐       ┌──────┴───────┐
                       │  WatchList   │       │VideoProgress │
                       ├──────────────┤       ├──────────────┤
                       │ Id (PK)      │       │ Id (PK)      │
                       │ Name         │       │ VideoId (FK) │
                       │ Description  │       │ Status       │
                       │ CreatedAt    │       │ WatchedSecs  │
                       │ UpdatedAt    │       │ LastWatchedAt│
                       └──────┬───────┘       │ CompletedAt  │
                              │               │ CreatedAt    │
                       ┌──────┴───────┐       │ UpdatedAt    │
                       │WatchListItem │       └──────────────┘
                       ├──────────────┤
                       │ Id (PK)      │
                       │ WatchListId  │
                       │ VideoId (FK) │
                       │ Position     │
                       │ AddedAt      │
                       └──────────────┘
```

**Status Enum:** `NotStarted = 0`, `InProgress = 1`, `Completed = 2`

---

## 4. API Endpoints

### Learning Fields
| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| GET    | `/api/fields`             | List all fields        |
| GET    | `/api/fields/{id}`        | Get field with stats   |
| POST   | `/api/fields`             | Create field           |
| PUT    | `/api/fields/{id}`        | Update field           |
| DELETE | `/api/fields/{id}`        | Delete field           |

### Playlists
| Method | Endpoint                          | Description                |
| ------ | --------------------------------- | -------------------------- |
| GET    | `/api/fields/{fieldId}/playlists` | List playlists in a field  |
| GET    | `/api/playlists/{id}`             | Get playlist with videos   |
| POST   | `/api/playlists`                  | Create playlist            |
| PUT    | `/api/playlists/{id}`             | Update playlist            |
| DELETE | `/api/playlists/{id}`             | Delete playlist            |

### Videos
| Method | Endpoint                              | Description                |
| ------ | ------------------------------------- | -------------------------- |
| GET    | `/api/playlists/{playlistId}/videos`  | List videos in a playlist  |
| GET    | `/api/videos/{id}`                    | Get video details          |
| POST   | `/api/videos`                         | Add video                  |
| PUT    | `/api/videos/{id}`                    | Update video               |
| DELETE | `/api/videos/{id}`                    | Delete video               |

### Progress
| Method | Endpoint                          | Description                |
| ------ | --------------------------------- | -------------------------- |
| GET    | `/api/videos/{videoId}/progress`  | Get progress for a video   |
| PUT    | `/api/videos/{videoId}/progress`  | Update progress            |
| GET    | `/api/progress/recent`            | Recently watched videos    |

### Watch Lists
| Method | Endpoint                               | Description               |
| ------ | -------------------------------------- | ------------------------- |
| GET    | `/api/watchlists`                      | List all watch lists      |
| GET    | `/api/watchlists/{id}`                 | Get watch list with items |
| POST   | `/api/watchlists`                      | Create watch list         |
| PUT    | `/api/watchlists/{id}`                 | Update watch list         |
| DELETE | `/api/watchlists/{id}`                 | Delete watch list         |
| POST   | `/api/watchlists/{id}/items`           | Add video to watch list   |
| DELETE | `/api/watchlists/{id}/items/{itemId}`  | Remove from watch list    |
| PUT    | `/api/watchlists/{id}/items/reorder`   | Reorder items             |

### Dashboard
| Method | Endpoint              | Description                          |
| ------ | --------------------- | ------------------------------------ |
| GET    | `/api/dashboard`      | Aggregated stats (cached in Redis)   |

---

## 5. Redis Caching Strategy

| Cache Key                    | TTL     | Invalidated On                     |
| ---------------------------- | ------- | ---------------------------------- |
| `dashboard:stats`            | 5 min   | Any progress update                |
| `field:{id}:stats`           | 5 min   | Progress update in that field      |
| `playlist:{id}:progress`     | 2 min   | Video progress update in playlist  |
| `recent:videos`              | 1 min   | Any progress update                |

---

## 6. Project Structure

```
ess-learn/
├── docker-compose.yml
├── PLAN.md
│
├── backend/
│   ├── EssLearn.Api/              # ASP.NET Web API (controllers, middleware)
│   │   ├── Controllers/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── EssLearn.Core/             # Domain models, interfaces
│   │   ├── Entities/
│   │   ├── Enums/
│   │   └── Interfaces/
│   ├── EssLearn.Infrastructure/   # EF Core, Redis, repositories
│   │   ├── Data/
│   │   ├── Repositories/
│   │   ├── Cache/
│   │   └── Migrations/
│   └── EssLearn.sln
│
└── frontend/
    ├── src/
    │   ├── components/            # Reusable UI components
    │   ├── pages/                 # Route-level pages
    │   ├── services/              # API client layer
    │   ├── hooks/                 # Custom React hooks
    │   ├── types/                 # TypeScript interfaces
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 7. Tech Stack Summary

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| Language (BE)  | C# 12 / .NET 8                 |
| Language (FE)  | TypeScript 5                    |
| API Framework  | ASP.NET Core Minimal/Controller|
| ORM            | Entity Framework Core 8         |
| Database       | PostgreSQL 16                   |
| Cache          | Redis 7                         |
| UI Library     | React 18                        |
| Build Tool     | Vite 5                          |
| Styling        | Tailwind CSS                    |
| HTTP Client    | Axios                           |
| Routing        | React Router 6                  |
| State          | React Query (TanStack Query)    |
| Video Player   | react-player                    |
| Icons          | Lucide React                    |
| Containers     | Docker + Docker Compose         |

---

## 8. Development Phases

### Phase 1 — Foundation ✅
- [x] Project scaffolding (backend solution + frontend Vite app)
- [x] Docker Compose setup (API + Redis + Frontend)
- [x] Database schema + EF Core migrations
- [x] Basic CRUD for Fields, Playlists, Videos

### Phase 2 — Core Tracking
- [ ] Progress tracking (mark watched, update duration)
- [ ] Watch Lists CRUD + add/remove videos
- [ ] Redis caching integration
- [ ] Dashboard endpoint with aggregated stats

### Phase 3 — Frontend
- [ ] Layout shell (sidebar, header, content area)
- [ ] Fields list & detail pages
- [ ] Playlist view with video list
- [ ] Video player with progress tracking (see §8.1)
- [ ] Watch list management UI
- [ ] Dashboard with charts

#### 8.1 Video Player — Design & UX

**Library:** [`react-player`](https://github.com/cookpete/react-player) (supports YouTube, local files, Vimeo, and more via a single `<ReactPlayer url={...} />` component).

**Core Behaviors:**
1. **Auto-resume** — On mount, fetch `VideoProgress.WatchedSecs` from API and call `player.seekTo(watchedSecs)` so the user picks up exactly where they left off.
2. **Periodic progress save** — Debounced `onProgress` callback (every ~10s) fires `PUT /api/videos/{videoId}/progress` with `{ watchedSecs, status: "InProgress" }`. This prevents data loss if the user closes the tab.
3. **Auto-complete** — `onEnded` callback sets status to `Completed` and `CompletedAt` timestamp via the API.
4. **Auto-advance** — After a video ends, automatically load the next video in the playlist (by `Position` order) with a 3-second countdown + cancel button.
5. **Playback controls:**
   - Play / pause (spacebar)
   - Seek ±10s (arrow keys)
   - Playback speed: 0.5×, 0.75×, 1×, 1.25×, 1.5×, 2× (persisted in localStorage)
   - Volume + mute
   - Fullscreen toggle
   - Progress bar with seek-on-click
6. **Mini player** — When navigating away from the video page, optionally collapse into a picture-in-picture mini player at the bottom-right so the user can browse playlists while watching.

**Component Structure:**
```
components/
├── VideoPlayer/
│   ├── VideoPlayer.tsx          # Main wrapper around ReactPlayer
│   ├── PlayerControls.tsx       # Custom control bar overlay
│   ├── ProgressBar.tsx          # Seekable progress bar with buffer indicator
│   ├── PlaybackSpeed.tsx        # Speed selector dropdown
│   ├── AutoAdvanceOverlay.tsx   # "Next video in 3s..." overlay
│   └── MiniPlayer.tsx           # PiP mini player shell
```

**Key Props / Hooks:**
```tsx
// Custom hook: useVideoProgress(videoId)
// - Fetches initial progress on mount
// - Returns { watchedSecs, status, saveProgress(), markComplete() }
// - Debounces API calls internally

// Custom hook: usePlaylistNavigation(playlistId, currentVideoId)
// - Returns { nextVideo, prevVideo, goToNext(), goToPrev() }
```

**Why `react-player`:**
- Single component handles YouTube URLs, local `/videos/file.mp4` paths, and other sources — no conditional rendering needed.
- `onProgress({ playedSeconds })` maps directly to `VideoProgress.WatchedSecs`.
- `ref.seekTo(seconds)` enables resume-from-position.
- ~30 KB gzipped, zero config, well-maintained (4M+ weekly npm downloads).

### Phase 4 — Polish
- [ ] YouTube metadata auto-import (optional)
- [ ] Search across all entities
- [ ] Dark/light theme toggle
- [ ] Responsive design
- [ ] Export/import data (JSON backup)

---

## 9. Running Locally

```bash
# Start everything
docker compose up --build

# Access
# Frontend:   http://localhost:5173
# API:        http://localhost:5000
# Swagger:    http://localhost:5000/swagger
# PostgreSQL: localhost:5432 (db: esslearn, user: esslearn)
```

---

## 10. Future Ideas
- **YouTube API integration** — auto-fetch playlist videos, thumbnails, durations
- **Notes** — attach markdown notes to any video
- **Tags** — cross-cutting labels for videos
- **Spaced repetition** — resurface videos for review
- **Mobile PWA** — responsive + installable
- **Multi-user** — optional auth for shared home server
