export enum VideoStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2
}

export interface FieldDto {
  id: number;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  createdAt: string;
  playlistCount: number;
  videoCount: number;
  completedVideos: number;
  totalDurationSeconds: number;
  watchedSeconds: number;
}

export interface ChannelDto {
  id: number;
  youtubeChannelId: string;
  title: string;
  thumbnailUrl: string | null;
  subscriberCount: number;
}

export interface CreateFieldDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateFieldDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface PlaylistDetailDto {
  playlist: PlaylistDto;
  videos: VideoDto[];
}

export interface VideoListItemDto {
  id: number;
  playlistId: number;
  fieldId: number;
  title: string;
  thumbnailUrl: string | null;
  url: string | null;
  durationSeconds: number;
  position: number;
  status: VideoStatus;
  watchedSeconds: number;
  playlistTitle: string;
  channelTitle: string | null;
  isDownloaded: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface VideoDto {
  id: number;
  playlistId: number;
  youtubeVideoId: string | null;
  title: string;
  thumbnailUrl: string | null;
  url: string | null;
  durationSeconds: number;
  position: number;
  status: VideoStatus;
  watchedSeconds: number;
}

export interface PlaylistDto {
  id: number;
  fieldId: number;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  sourceUrl: string | null;
  totalVideos: number;
  completedVideos: number;
  totalDurationSeconds: number;
  watchedSeconds: number;
  channelTitle: string | null;
  createdAt: string;
}

export interface FieldSummaryDto {
  id: number;
  name: string;
  color: string;
  playlistCount: number;
  videoCount: number;
  completedVideos: number;
  progress: number;
}

export interface RecentVideoDto {
  videoId: number;
  title: string;
  thumbnailUrl: string | null;
  playlistTitle: string;
  watchedSeconds: number;
  durationSeconds: number;
  lastWatchedAt: string;
}

export interface DashboardDto {
  totalFields: number;
  totalPlaylists: number;
  totalVideos: number;
  completedVideos: number;
  totalDurationSeconds: number;
  watchedSeconds: number;
  overallProgress: number;
  fields: FieldSummaryDto[];
  recentlyWatched: RecentVideoDto[];
}

export interface VideoFormatDto {
  formatId: string;
  quality: string;
  container: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  width: number | null;
  height: number | null;
  videoCodec: string | null;
  audioCodec: string | null;
}

export interface DownloadedVideoDto {
  id: number;
  quality: string;
  container: string;
  fileSizeBytes: number;
  width: number | null;
  height: number | null;
  downloadedAt: string;
}

export interface DownloadStatusDto {
  isDownloaded: boolean;
  download: DownloadedVideoDto | null;
}

export interface ProgressDto {
  videoId: number;
  status: VideoStatus;
  watchedSeconds: number;
  lastWatchedAt: string | null;
  completedAt: string | null;
}

export interface RoadmapListItemDto {
  id: number;
  name: string;
  description: string | null;
  category: string;
  color: string;
  icon: string | null;
  tags: string[];
  totalNodes: number;
  completedNodes: number;
  estimatedHours: number;
  progress: number;
  createdAt: string;
}

export interface RoadmapDetailDto {
  id: number;
  name: string;
  description: string | null;
  color: string;
  nodes: RoadmapNodeDto[];
}

export interface RoadmapNodeDto {
  id: number;
  title: string;
  description: string | null;
  status: string;
  duration: string | null;
  mediaType: string;
  resourceCount: number;
  prerequisites: number[];
  positionX: number;
  positionY: number;
}

export interface CreateRoadmapDto {
  name: string;
  description?: string;
  category?: string;
  color?: string;
  icon?: string;
  tags?: string[];
}

export interface CreateRoadmapNodeDto {
  title: string;
  description?: string;
  duration?: string;
  mediaType: string;
  resourceCount: number;
  status?: string;
  prerequisiteIds?: number[];
  followingNodeId?: number;
  besideNodeId?: number;
  positionX?: number;
  positionY?: number;
}

export interface UpdateNodeStatusDto {
  status: string;
}

export interface UpdateRoadmapNodeDto {
  title?: string;
  description?: string;
  duration?: string;
  mediaType?: string;
  resourceCount?: number;
}
