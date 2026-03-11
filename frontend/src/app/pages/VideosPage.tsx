import { useState, useMemo } from "react";
import { useOutletContext, Link } from "react-router";
import { Play, Clock, CheckCircle2, Download, MoreVertical, Filter } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface Video {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  progress: number;
  isDownloaded: boolean;
  dateAdded: string;
  views: string;
  playlist?: string;
}

// Mock data
const mockVideos: Video[] = [
  {
    id: "1",
    title: "Complete React Tutorial for Beginners",
    channel: "Web Dev Simplified",
    duration: "2:34:15",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    progress: 0,
    isDownloaded: false,
    dateAdded: "2026-03-07",
    views: "1.2M",
    playlist: "React Course",
  },
  {
    id: "2",
    title: "Advanced TypeScript Patterns",
    channel: "Matt Pocock",
    duration: "1:12:45",
    thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400",
    progress: 45,
    isDownloaded: true,
    dateAdded: "2026-03-06",
    views: "850K",
    playlist: "TypeScript Masterclass",
  },
  {
    id: "3",
    title: "Docker & Kubernetes Complete Guide",
    channel: "TechWorld with Nana",
    duration: "3:45:20",
    thumbnail: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400",
    progress: 100,
    isDownloaded: true,
    dateAdded: "2026-03-05",
    views: "2.1M",
  },
  {
    id: "4",
    title: "Database Design Fundamentals",
    channel: "freeCodeCamp",
    duration: "4:12:33",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400",
    progress: 23,
    isDownloaded: true,
    dateAdded: "2026-03-04",
    views: "3.5M",
    playlist: "Database Course",
  },
  {
    id: "5",
    title: "System Design Interview Preparation",
    channel: "Gaurav Sen",
    duration: "0:45:12",
    thumbnail: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400",
    progress: 0,
    isDownloaded: false,
    dateAdded: "2026-03-03",
    views: "950K",
  },
  {
    id: "6",
    title: "Clean Code Principles",
    channel: "Uncle Bob",
    duration: "1:30:00",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    progress: 67,
    isDownloaded: true,
    dateAdded: "2026-03-02",
    views: "1.8M",
  },
];

export function VideosPage() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const filteredVideos = useMemo(() => {
    let filtered = mockVideos;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.channel.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === "downloaded") {
      filtered = filtered.filter((v) => v.isDownloaded);
    } else if (filterStatus === "in-progress") {
      filtered = filtered.filter((v) => v.progress > 0 && v.progress < 100);
    } else if (filterStatus === "unwatched") {
      filtered = filtered.filter((v) => v.progress === 0);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "progress") {
        return b.progress - a.progress;
      }
      return 0;
    });

    return filtered;
  }, [searchQuery, filterStatus, sortBy]);

  const handleDownload = (video: Video) => {
    if (video.isDownloaded) {
      toast.info("Video already downloaded");
    } else {
      toast.success(`Downloading: ${video.title}`);
    }
  };

  const handleDelete = (video: Video) => {
    toast.success(`Removed: ${video.title}`);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Library</h1>
        <p className="text-gray-500">Manage and organize your learning videos</p>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Videos</SelectItem>
            <SelectItem value="downloaded">Downloaded</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="unwatched">Unwatched</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Added</SelectItem>
            <SelectItem value="title">Title (A-Z)</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <div className="text-sm text-gray-500 flex items-center">
          {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No videos found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/videos/${video.id}`} className="block">
                <div className="relative aspect-video bg-gray-200">
                  <ImageWithFallback
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                  {video.isDownloaded && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full">
                      <Download className="w-4 h-4" />
                    </div>
                  )}
                  {video.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${video.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link to={`/videos/${video.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600">
                      {video.title}
                    </h3>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(video)}>
                        <Download className="w-4 h-4 mr-2" />
                        {video.isDownloaded ? "Re-download" : "Download"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(video)}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm text-gray-600 mb-3">{video.channel}</p>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{video.views} views</span>
                  {video.playlist && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">
                        {video.playlist}
                      </Badge>
                    </>
                  )}
                </div>

                {video.progress > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    {video.progress === 100 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">Completed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-600">{video.progress}% watched</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
