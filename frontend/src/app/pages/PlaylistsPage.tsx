import { useState } from "react";
import { Link } from "react-router";
import { List, Video, Clock, Download, MoreVertical, Play } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface Playlist {
  id: string;
  title: string;
  channel: string;
  videoCount: number;
  totalDuration: string;
  thumbnail: string;
  progress: number;
  downloadedCount: number;
  dateAdded: string;
}

const mockPlaylists: Playlist[] = [
  {
    id: "1",
    title: "React Course - Complete Guide 2026",
    channel: "Web Dev Simplified",
    videoCount: 42,
    totalDuration: "12:34:22",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    progress: 35,
    downloadedCount: 15,
    dateAdded: "2026-03-07",
  },
  {
    id: "2",
    title: "TypeScript Masterclass",
    channel: "Matt Pocock",
    videoCount: 28,
    totalDuration: "8:45:10",
    thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400",
    progress: 68,
    downloadedCount: 28,
    dateAdded: "2026-03-05",
  },
  {
    id: "3",
    title: "Database Design & SQL",
    channel: "freeCodeCamp",
    videoCount: 55,
    totalDuration: "18:20:45",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400",
    progress: 12,
    downloadedCount: 7,
    dateAdded: "2026-03-03",
  },
  {
    id: "4",
    title: "System Design Interview Series",
    channel: "Gaurav Sen",
    videoCount: 35,
    totalDuration: "14:10:30",
    thumbnail: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400",
    progress: 0,
    downloadedCount: 0,
    dateAdded: "2026-03-01",
  },
  {
    id: "5",
    title: "DevOps with Docker & Kubernetes",
    channel: "TechWorld with Nana",
    videoCount: 48,
    totalDuration: "16:45:00",
    thumbnail: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400",
    progress: 100,
    downloadedCount: 48,
    dateAdded: "2026-02-28",
  },
  {
    id: "6",
    title: "Clean Code Principles & Practices",
    channel: "Uncle Bob",
    videoCount: 20,
    totalDuration: "10:30:15",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    progress: 45,
    downloadedCount: 9,
    dateAdded: "2026-02-25",
  },
];

export function PlaylistsPage() {
  const [playlists] = useState<Playlist[]>(mockPlaylists);

  const handleDownloadAll = (playlist: Playlist) => {
    toast.success(`Downloading all videos from: ${playlist.title}`);
  };

  const handleDelete = (playlist: Playlist) => {
    toast.success(`Removed playlist: ${playlist.title}`);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Playlists</h1>
        <p className="text-gray-500">
          Organized video collections for structured learning
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <List className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{playlists.length}</p>
              <p className="text-sm text-gray-500">Total Playlists</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {playlists.reduce((sum, p) => sum + p.videoCount, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Videos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {playlists.reduce((sum, p) => sum + p.downloadedCount, 0)}
              </p>
              <p className="text-sm text-gray-500">Downloaded</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Playlists Grid */}
      <div className="space-y-4">
        {playlists.map((playlist) => (
          <Card key={playlist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row">
              {/* Thumbnail */}
              <div className="relative md:w-64 aspect-video md:aspect-auto bg-gray-200 shrink-0">
                <ImageWithFallback
                  src={playlist.thumbnail}
                  alt={playlist.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center text-white">
                    <List className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm font-semibold">{playlist.videoCount} videos</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 md:p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <Link to={`/playlists/${playlist.id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1 hover:text-blue-600">
                        {playlist.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600">{playlist.channel}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownloadAll(playlist)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Play className="w-4 h-4 mr-2" />
                        Play All
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(playlist)}
                        className="text-red-600"
                      >
                        Delete Playlist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    <span>{playlist.videoCount} videos</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{playlist.totalDuration}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>
                      {playlist.downloadedCount}/{playlist.videoCount} downloaded
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Learning Progress</span>
                    <span className="font-medium text-gray-900">{playlist.progress}%</span>
                  </div>
                  <Progress value={playlist.progress} className="h-2" />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link to={`/playlists/${playlist.id}`}>
                    <Button size="sm">View Playlist</Button>
                  </Link>
                  {playlist.downloadedCount < playlist.videoCount && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadAll(playlist)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All
                    </Button>
                  )}
                  {playlist.progress < 100 && playlist.downloadedCount > 0 && (
                    <Badge variant="secondary" className="px-3 py-1">
                      In Progress
                    </Badge>
                  )}
                  {playlist.progress === 100 && (
                    <Badge className="px-3 py-1 bg-green-500">Completed</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
