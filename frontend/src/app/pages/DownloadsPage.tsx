import { useState } from "react";
import {
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pause,
  Play,
  X,
  FileVideo,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";

type DownloadStatus = "downloading" | "completed" | "paused" | "failed" | "queued";

interface DownloadItem {
  id: string;
  title: string;
  channel: string;
  progress: number;
  speed: string;
  size: string;
  totalSize: string;
  eta: string;
  status: DownloadStatus;
  format: string;
  quality: string;
  startedAt: string;
}

const mockDownloads: DownloadItem[] = [
  {
    id: "1",
    title: "Advanced React Hooks Deep Dive",
    channel: "Web Dev Simplified",
    progress: 67,
    speed: "5.2 MB/s",
    size: "420 MB",
    totalSize: "625 MB",
    eta: "00:39",
    status: "downloading",
    format: "mp4",
    quality: "1080p",
    startedAt: "2026-03-08T10:30:00",
  },
  {
    id: "2",
    title: "Docker Container Orchestration",
    channel: "TechWorld with Nana",
    progress: 100,
    speed: "—",
    size: "1.2 GB",
    totalSize: "1.2 GB",
    eta: "—",
    status: "completed",
    format: "mp4",
    quality: "1080p",
    startedAt: "2026-03-08T09:15:00",
  },
  {
    id: "3",
    title: "System Design Fundamentals",
    channel: "Gaurav Sen",
    progress: 45,
    speed: "—",
    size: "285 MB",
    totalSize: "635 MB",
    eta: "—",
    status: "paused",
    format: "mp4",
    quality: "720p",
    startedAt: "2026-03-08T09:45:00",
  },
  {
    id: "4",
    title: "TypeScript 5.0 New Features",
    channel: "Matt Pocock",
    progress: 23,
    speed: "—",
    size: "145 MB",
    totalSize: "630 MB",
    eta: "—",
    status: "failed",
    format: "mp4",
    quality: "1080p",
    startedAt: "2026-03-08T10:00:00",
  },
  {
    id: "5",
    title: "Database Indexing Strategies",
    channel: "Hussein Nasser",
    progress: 0,
    speed: "—",
    size: "0 MB",
    totalSize: "890 MB",
    eta: "—",
    status: "queued",
    format: "mp4",
    quality: "1080p",
    startedAt: "2026-03-08T10:45:00",
  },
];

const completedDownloads: DownloadItem[] = [
  {
    id: "c1",
    title: "React Server Components Explained",
    channel: "Fireship",
    progress: 100,
    speed: "—",
    size: "425 MB",
    totalSize: "425 MB",
    eta: "—",
    status: "completed",
    format: "mp4",
    quality: "1080p",
    startedAt: "2026-03-07T14:20:00",
  },
  {
    id: "c2",
    title: "Kubernetes for Beginners",
    channel: "TechWorld with Nana",
    progress: 100,
    speed: "—",
    size: "1.5 GB",
    totalSize: "1.5 GB",
    eta: "—",
    status: "completed",
    format: "mp4",
    quality: "1080p",
    startedAt: "2026-03-07T11:30:00",
  },
];

export function DownloadsPage() {
  const [activeDownloads, setActiveDownloads] = useState<DownloadItem[]>(mockDownloads);
  const [completed] = useState<DownloadItem[]>(completedDownloads);

  const handlePauseResume = (item: DownloadItem) => {
    if (item.status === "downloading") {
      toast.info(`Paused: ${item.title}`);
    } else if (item.status === "paused") {
      toast.success(`Resumed: ${item.title}`);
    }
  };

  const handleCancel = (item: DownloadItem) => {
    toast.error(`Cancelled: ${item.title}`);
    setActiveDownloads(activeDownloads.filter((d) => d.id !== item.id));
  };

  const handleRetry = (item: DownloadItem) => {
    toast.success(`Retrying: ${item.title}`);
  };

  const getStatusIcon = (status: DownloadStatus) => {
    switch (status) {
      case "downloading":
        return <Download className="w-4 h-4 text-blue-500 animate-pulse" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "paused":
        return <Pause className="w-4 h-4 text-orange-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "queued":
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: DownloadStatus) => {
    const variants: Record<DownloadStatus, string> = {
      downloading: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      paused: "bg-orange-100 text-orange-700",
      failed: "bg-red-100 text-red-700",
      queued: "bg-gray-100 text-gray-700",
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const activeCount = activeDownloads.filter(
    (d) => d.status === "downloading" || d.status === "queued"
  ).length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Downloads</h1>
        <p className="text-gray-500">Manage your video downloads and queue</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completed.length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Pause className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {activeDownloads.filter((d) => d.status === "paused").length}
              </p>
              <p className="text-sm text-gray-500">Paused</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {activeDownloads.filter((d) => d.status === "failed").length}
              </p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeDownloads.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3">
          {activeDownloads.length === 0 ? (
            <Card className="p-12 text-center">
              <FileVideo className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No active downloads</p>
            </Card>
          ) : (
            activeDownloads.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(item.status)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500">{item.channel}</p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    {item.status !== "queued" && (
                      <div className="space-y-2 mb-3">
                        <Progress value={item.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {item.size} / {item.totalSize}
                          </span>
                          <span>{item.progress}%</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                      <span>{item.quality}</span>
                      <span>•</span>
                      <span>{item.format.toUpperCase()}</span>
                      {item.status === "downloading" && (
                        <>
                          <span>•</span>
                          <span>{item.speed}</span>
                          <span>•</span>
                          <span>ETA: {item.eta}</span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {item.status === "downloading" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseResume(item)}
                          >
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancel(item)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {item.status === "paused" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseResume(item)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancel(item)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {item.status === "failed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetry(item)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Retry
                        </Button>
                      )}
                      {item.status === "queued" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancel(item)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completed.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No completed downloads</p>
            </Card>
          ) : (
            completed.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500">{item.channel}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        Completed
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                      <span>{item.quality}</span>
                      <span>•</span>
                      <span>{item.format.toUpperCase()}</span>
                      <span>•</span>
                      <span>{item.totalSize}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                      <Button size="sm" variant="ghost">
                        Open Folder
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
