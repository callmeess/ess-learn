export interface StreamingStatusDto {
  isTranscoded: boolean;
  isTranscoding: boolean;
  progressPercent: number;
  hlsManifestUrl: string | null;
}

export interface TranscodeResultDto {
  jobId: number;
  status: string;
}
