export interface ImportVideoDto {
  videoUrl: string;
  fieldId: number;
  playlistId?: number;
}

export interface ImportPlaylistDto {
  playlistUrl: string;
  fieldId: number;
}

export interface ImportResultDto {
  playlistId: number;
  title: string;
  videosImported: number;
  channelTitle: string | null;
}
