import { FieldSummaryDto } from './field.models';
import { RecentVideoDto } from './video.models';

export interface DashboardDto {
  totalFields: number;
  totalPlaylists: number;
  totalVideos: number;
  watchedVideos: number;
  completedVideos: number;
  totalDurationSeconds: number;
  watchedSeconds: number;
  overallProgress: number;
  fields: FieldSummaryDto[];
  recentlyWatched: RecentVideoDto[];
}
