import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  Play,
  Download,
  Share2,
  Clock,
  Eye,
  Calendar,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface VideoFormat {
  id: string;
  quality: string;
  format: string;
  fileSize: string;
  fps: number;
}

const mockFormats: VideoFormat[] = [
  { id: "1", quality: "1080p", format: "mp4", fileSize: "625 MB", fps: 60 },
  { id: "2", quality: "1080p", format: "mp4", fileSize: "450 MB", fps: 30 },
  { id: "3", quality: "720p", format: "mp4", fileSize: "280 MB", fps: 60 },
  { id: "4", quality: "720p", format: "mp4", fileSize: "185 MB", fps: 30 },
  { id: "5", quality: "480p", format: "mp4", fileSize: "95 MB", fps: 30 },
];

export function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedFormat, setSelectedFormat] = useState(mockFormats[0].id);
  const [isDownloaded, setIsDownloaded] = useState(id === "2" || id === "4" || id === "6");
  const [progress, setProgress] = useState(
    id === "2" ? 45 : id === "4" ? 23 : id === "6" ? 67 : 0
  );

  // Mock video data
  const video = {
    id,
    title: "Complete React Tutorial for Beginners - Full Course 2026",
    channel: "Web Dev Simplified",
    channelImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    duration: "2:34:15",
    views: "1.2M",
    uploadDate: "2026-02-15",
    description:
      "Learn React from scratch in this comprehensive tutorial. Perfect for beginners who want to master React and build modern web applications. We'll cover components, hooks, state management, routing, and much more.",
    playlist: "React Course - Complete Guide 2026",
    tags: ["React", "JavaScript", "Web Development", "Frontend", "Tutorial"],
  };

  const handleDownload = () => {
    const format = mockFormats.find((f) => f.id === selectedFormat);
    toast.success(`Starting download: ${format?.quality} (${format?.fileSize})`);
    setIsDownloaded(true);
  };

  const handlePlay = () => {
    toast.info("Opening video player...");
  };

  const selectedFormatDetails = mockFormats.find((f) => f.id === selectedFormat);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Videos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player Placeholder */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              <ImageWithFallback
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Button
                  size="lg"
                  className="rounded-full w-20 h-20"
                  onClick={handlePlay}
                >
                  <Play className="w-8 h-8" />
                </Button>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/80 text-white text-sm px-3 py-1.5 rounded">
                {video.duration}
              </div>
            </div>
          </Card>

          {/* Video Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{video.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{video.duration}</span>
              </div>
            </div>

            {/* Channel Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <ImageWithFallback
                    src={video.channelImage}
                    alt={video.channel}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{video.channel}</p>
                  <p className="text-sm text-gray-500">Educational Content</p>
                </div>
              </div>

              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {video.playlist && (
              <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 text-sm">
                  <Badge className="bg-blue-600">Playlist</Badge>
                  <span className="font-medium text-gray-900">{video.playlist}</span>
                </div>
              </Card>
            )}

            {/* Progress */}
            {progress > 0 && (
              <Card className="p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {progress === 100 ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-600">Completed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-gray-900">
                          Watch Progress: {progress}%
                        </span>
                      </>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    Continue Watching
                  </Button>
                </div>
                <Progress value={progress} className="h-2" />
              </Card>
            )}

            <Separator className="my-6" />

            {/* Description */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{video.description}</p>

              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Download Options */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Download Options</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">
                  Select Quality & Format
                </label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.quality} - {format.format.toUpperCase()} ({format.fps}fps) -{" "}
                        {format.fileSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFormatDetails && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality:</span>
                    <span className="font-medium text-gray-900">
                      {selectedFormatDetails.quality}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium text-gray-900">
                      {selectedFormatDetails.format.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">FPS:</span>
                    <span className="font-medium text-gray-900">
                      {selectedFormatDetails.fps}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Size:</span>
                    <span className="font-medium text-gray-900">
                      {selectedFormatDetails.fileSize}
                    </span>
                  </div>
                </div>
              )}

              {isDownloaded ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Already Downloaded</span>
                  </div>
                  <Button className="w-full" onClick={handlePlay}>
                    <Play className="w-4 h-4 mr-2" />
                    Play Video
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Re-download
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </Button>
              )}
            </div>
          </Card>

          {/* Video Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Video Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium text-gray-900">{video.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Views:</span>
                <span className="font-medium text-gray-900">{video.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Upload Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date(video.uploadDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                {isDownloaded ? (
                  <Badge className="bg-green-100 text-green-700">Downloaded</Badge>
                ) : (
                  <Badge variant="secondary">Not Downloaded</Badge>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
