import { VideoDto } from './video.models';

export interface PlaylistDetailDto {
  playlist: PlaylistDto;
  videos: VideoDto[];
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
