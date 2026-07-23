export enum VideoStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2
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

export interface RecentVideoDto {
  videoId: number;
  title: string;
  thumbnailUrl: string | null;
  playlistTitle: string;
  watchedSeconds: number;
  durationSeconds: number;
  lastWatchedAt: string;
}

export interface ProgressDto {
  videoId: number;
  status: VideoStatus;
  watchedSeconds: number;
  lastWatchedAt: string | null;
  completedAt: string | null;
}

export interface PaginatedVideosDto {
  videos: VideoListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
