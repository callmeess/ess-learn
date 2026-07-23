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

export interface FieldSummaryDto {
  id: number;
  name: string;
  color: string;
  playlistCount: number;
  videoCount: number;
  completedVideos: number;
  progress: number;
}
