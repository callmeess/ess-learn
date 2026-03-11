import { useState } from "react";
import { Tv, Video, CheckCircle, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface Channel {
  id: string;
  name: string;
  handle: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: number;
  downloadedCount: number;
  watchProgress: number;
  dateAdded: string;
}

const mockChannels: Channel[] = [
  {
    id: "1",
    name: "Web Dev Simplified",
    handle: "@webdevsimplified",
    thumbnail: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200",
    subscriberCount: "1.2M",
    videoCount: 248,
    downloadedCount: 42,
    watchProgress: 35,
    dateAdded: "2026-03-07",
  },
  {
    id: "2",
    name: "TechWorld with Nana",
    handle: "@techworldwithnana",
    thumbnail: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200",
    subscriberCount: "856K",
    videoCount: 156,
    downloadedCount: 28,
    watchProgress: 45,
    dateAdded: "2026-03-05",
  },
  {
    id: "3",
    name: "freeCodeCamp.org",
    handle: "@freecodecamp",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    subscriberCount: "8.5M",
    videoCount: 1250,
    downloadedCount: 85,
    watchProgress: 12,
    dateAdded: "2026-03-03",
  },
  {
    id: "4",
    name: "Gaurav Sen",
    handle: "@gkcs",
    thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    subscriberCount: "567K",
    videoCount: 89,
    downloadedCount: 15,
    watchProgress: 8,
    dateAdded: "2026-03-01",
  },
  {
    id: "5",
    name: "Fireship",
    handle: "@fireship",
    thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
    subscriberCount: "2.8M",
    videoCount: 524,
    downloadedCount: 67,
    watchProgress: 28,
    dateAdded: "2026-02-28",
  },
];

export function ChannelsPage() {
  const [channels] = useState<Channel[]>(mockChannels);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Channels</h1>
        <p className="text-gray-500">
          Manage your favorite educational content creators
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Tv className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{channels.length}</p>
              <p className="text-sm text-gray-500">Channels</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {channels.reduce((sum, c) => sum + c.videoCount, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Videos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {channels.reduce((sum, c) => sum + c.downloadedCount, 0)}
              </p>
              <p className="text-sm text-gray-500">Downloaded</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  channels.reduce((sum, c) => sum + c.watchProgress, 0) / channels.length
                )}
                %
              </p>
              <p className="text-sm text-gray-500">Avg Progress</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel) => (
          <Card key={channel.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 shrink-0">
                <ImageWithFallback
                  src={channel.thumbnail}
                  alt={channel.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {channel.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{channel.handle}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {channel.subscriberCount} subscribers
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-gray-100">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{channel.videoCount}</p>
                <p className="text-xs text-gray-500">Videos</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-blue-600">
                  {channel.downloadedCount}
                </p>
                <p className="text-xs text-gray-500">Downloaded</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">
                  {channel.watchProgress}%
                </p>
                <p className="text-xs text-gray-500">Watched</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Watch Progress</span>
                <span className="font-medium text-gray-900">
                  {channel.watchProgress}%
                </span>
              </div>
              <Progress value={channel.watchProgress} className="h-2" />
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                View Channel
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Sync Videos
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
