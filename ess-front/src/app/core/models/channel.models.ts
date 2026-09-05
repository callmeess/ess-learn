export interface ChannelListItemDto {
  id: number;
  title: string;
  thumbnailUrl: string | null;
  subscriberCount: number;
  videoCount: number;
  downloadedCount: number;
  watchedCount: number;
  totalDurationSeconds: number;
  watchedSeconds: number;
}
