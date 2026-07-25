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

export interface DownloadProgressDto {
  hasActiveJob: boolean;
  jobId?: number;
  status?: string;
  progress: number;
  errorMessage?: string;
  createdAt?: string;
  completedAt?: string;
}
