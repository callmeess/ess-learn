import React from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { VideosPage } from "./pages/VideosPage";
import { PlaylistsPage } from "./pages/PlaylistsPage";
import { ChannelsPage } from "./pages/ChannelsPage";
import { DownloadsPage } from "./pages/DownloadsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SchedulePage } from "./pages/SchedulePage";
import { RoadmapsPage } from "./pages/RoadmapsPage";
import { RoadmapDetailPage } from "./pages/RoadmapDetailPage";
import { VideoDetailPage } from "./pages/VideoDetailPage";
import { ReadingPage } from "./pages/ReadingPage";
import { ReadingDetailPage } from "./pages/ReadingDetailPage";
import { AccountPage } from "./pages/AccountPage";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: React.createElement(Layout),
    children: [
      { 
        index: true, 
        element: React.createElement(VideosPage)
      },
      { 
        path: "playlists", 
        element: React.createElement(PlaylistsPage)
      },
      { 
        path: "channels", 
        element: React.createElement(ChannelsPage)
      },
      { 
        path: "downloads", 
        element: React.createElement(DownloadsPage)
      },
      { 
        path: "analytics", 
        element: React.createElement(AnalyticsPage)
      },
      { 
        path: "schedule", 
        element: React.createElement(SchedulePage)
      },
      { 
        path: "roadmaps", 
        element: React.createElement(RoadmapsPage)
      },
      { 
        path: "roadmaps/:id", 
        element: React.createElement(RoadmapDetailPage)
      },
      { 
        path: "videos/:id", 
        element: React.createElement(VideoDetailPage)
      },
      { 
        path: "reading", 
        element: React.createElement(ReadingPage)
      },
      { 
        path: "reading/:id", 
        element: React.createElement(ReadingDetailPage)
      },
      { 
        path: "account", 
        element: React.createElement(AccountPage)
      },
      { 
        path: "*", 
        element: React.createElement(NotFound)
      },
    ],
  },
]);