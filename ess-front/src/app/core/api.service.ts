import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import {
  AddPlaylistToRoadmapDto,
  AddVideosToPlaylistDto,
  CreateFieldDto,
  CreatePlaylistDto,
  CreateRoadmapDto,
  CreateRoadmapNodeDto,
  DashboardDto,
  DownloadProgressDto,
  DownloadStatusDto,
  DownloadedVideoDto,
  FieldDto,
  ImportPlaylistDto,
  ImportResultDto,
  ImportVideoDto,
  PaginatedVideosDto,
  PlaylistDetailDto,
  PlaylistDto,
  ProgressDto,
  RoadmapDetailDto,
  RoadmapListItemDto,
  RoadmapNodeDto,
  StreamingStatusDto,
  TranscodeResultDto,
  UpdateFieldDto,
  UpdateNodeStatusDto,
  UpdatePlaylistDto,
  UpdateRoadmapDto,
  UpdateRoadmapNodeDto,
  VideoDto,
  VideoFormatDto,
  VideoListItemDto,
  VideoStatus
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = API_BASE_URL;

  constructor(private readonly http: HttpClient) {}

  // Dashboard
  getDashboard(range?: string): Observable<DashboardDto> {
    let params = new HttpParams();
    if (range && range !== 'all') {
      params = params.set('range', range);
    }

    return this.http.get<DashboardDto>(`${this.baseUrl}/api/dashboard`, { params });
  }

  // Fields
  getFields(): Observable<FieldDto[]> {
    return this.http.get<FieldDto[]>(`${this.baseUrl}/api/fields`);
  }

  getField(id: number): Observable<FieldDto> {
    return this.http.get<FieldDto>(`${this.baseUrl}/api/fields/${id}`);
  }

  createField(dto: CreateFieldDto): Observable<FieldDto> {
    return this.http.post<FieldDto>(`${this.baseUrl}/api/fields`, dto);
  }

  updateField(id: number, dto: UpdateFieldDto): Observable<FieldDto> {
    return this.http.put<FieldDto>(`${this.baseUrl}/api/fields/${id}`, dto);
  }

  deleteField(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/fields/${id}`);
  }

  // Playlists
  getPlaylists(fieldId?: number): Observable<PlaylistDto[]> {
    let params = new HttpParams();
    if (fieldId !== undefined) {
      params = params.set('fieldId', fieldId);
    }

    return this.http.get<PlaylistDto[]>(`${this.baseUrl}/api/playlists`, { params });
  }

  createPlaylist(dto: CreatePlaylistDto): Observable<PlaylistDto> {
    return this.http.post<PlaylistDto>(`${this.baseUrl}/api/playlists`, dto);
  }

  updatePlaylist(id: number, dto: UpdatePlaylistDto): Observable<PlaylistDto> {
    return this.http.put<PlaylistDto>(`${this.baseUrl}/api/playlists/${id}`, dto);
  }

  getPlaylist(id: number): Observable<PlaylistDetailDto> {
    return this.http.get<PlaylistDetailDto>(`${this.baseUrl}/api/playlists/${id}`);
  }

  deletePlaylist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/playlists/${id}`);
  }

  addVideosToPlaylist(playlistId: number, dto: AddVideosToPlaylistDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/playlists/${playlistId}/videos`, dto);
  }

  removeVideoFromPlaylist(playlistId: number, videoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/playlists/${playlistId}/videos/${videoId}`);
  }

  // Videos
  getVideos(filters?: { playlistId?: number; fieldId?: number }): Observable<VideoListItemDto[]> {
    let params = new HttpParams();

    if (filters?.playlistId !== undefined) {
      params = params.set('playlistId', filters.playlistId);
    }

    if (filters?.fieldId !== undefined) {
      params = params.set('fieldId', filters.fieldId);
    }

    return this.http.get<VideoListItemDto[]>(`${this.baseUrl}/api/videos`, { params });
  }

  getVideo(id: number): Observable<VideoDto> {
    return this.http.get<VideoDto>(`${this.baseUrl}/api/videos/${id}`);
  }

  getVideoProgress(id: number): Observable<ProgressDto> {
    return this.http.get<ProgressDto>(`${this.baseUrl}/api/videos/${id}/progress`);
  }

  updateVideoProgress(id: number, watchedSeconds: number, status: VideoStatus): Observable<ProgressDto> {
    return this.http.put<ProgressDto>(`${this.baseUrl}/api/videos/${id}/progress`, {
      watchedSeconds,
      status
    });
  }

  // Downloads
  getVideoFormats(videoId: number): Observable<VideoFormatDto[]> {
    return this.http.get<VideoFormatDto[]>(`${this.baseUrl}/api/videos/${videoId}/download/formats`);
  }

  downloadVideo(videoId: number, formatId: string, quality: string): Observable<DownloadedVideoDto> {
    return this.http.post<DownloadedVideoDto>(`${this.baseUrl}/api/videos/${videoId}/download`, { formatId, quality });
  }

  deleteDownload(videoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/videos/${videoId}/download`);
  }

  getDownloadStatus(videoId: number): Observable<DownloadStatusDto> {
    return this.http.get<DownloadStatusDto>(`${this.baseUrl}/api/videos/${videoId}/download/status`);
  }

  getDownloadProgress(videoId: number): Observable<DownloadProgressDto> {
    return this.http.get<DownloadProgressDto>(`${this.baseUrl}/api/videos/${videoId}/download/progress`);
  }

  // Roadmaps
  getRoadmaps(): Observable<RoadmapListItemDto[]> {
    return this.http.get<RoadmapListItemDto[]>(`${this.baseUrl}/api/roadmaps`);
  }

  getRoadmap(id: number): Observable<RoadmapDetailDto> {
    return this.http.get<RoadmapDetailDto>(`${this.baseUrl}/api/roadmaps/${id}`);
  }

  createRoadmap(dto: CreateRoadmapDto): Observable<RoadmapListItemDto> {
    return this.http.post<RoadmapListItemDto>(`${this.baseUrl}/api/roadmaps`, dto);
  }

  updateRoadmap(id: number, dto: UpdateRoadmapDto): Observable<RoadmapListItemDto> {
    return this.http.put<RoadmapListItemDto>(`${this.baseUrl}/api/roadmaps/${id}`, dto);
  }

  deleteRoadmap(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/roadmaps/${id}`);
  }

  addPlaylistToRoadmap(roadmapId: number, dto: AddPlaylistToRoadmapDto): Observable<RoadmapNodeDto> {
    return this.http.post<RoadmapNodeDto>(`${this.baseUrl}/api/roadmaps/${roadmapId}/playlists`, dto);
  }

  addRoadmapNode(roadmapId: number, dto: CreateRoadmapNodeDto): Observable<RoadmapNodeDto> {
    return this.http.post<RoadmapNodeDto>(`${this.baseUrl}/api/roadmaps/${roadmapId}/nodes`, dto);
  }

  updateNodeStatus(roadmapId: number, nodeId: number, dto: UpdateNodeStatusDto): Observable<RoadmapNodeDto> {
    return this.http.put<RoadmapNodeDto>(`${this.baseUrl}/api/roadmaps/${roadmapId}/nodes/${nodeId}/status`, dto);
  }

  updateRoadmapNode(roadmapId: number, nodeId: number, dto: UpdateRoadmapNodeDto): Observable<RoadmapNodeDto> {
    return this.http.put<RoadmapNodeDto>(`${this.baseUrl}/api/roadmaps/${roadmapId}/nodes/${nodeId}`, dto);
  }

  deleteRoadmapNode(roadmapId: number, nodeId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/roadmaps/${roadmapId}/nodes/${nodeId}`);
  }

  // Import
  importVideo(dto: ImportVideoDto): Observable<ImportResultDto> {
    return this.http.post<ImportResultDto>(`${this.baseUrl}/api/import/video`, dto);
  }

  importPlaylist(dto: ImportPlaylistDto): Observable<ImportResultDto> {
    return this.http.post<ImportResultDto>(`${this.baseUrl}/api/import/playlist`, dto);
  }

  // Streaming
  getStreamingStatus(videoId: number): Observable<StreamingStatusDto> {
    return this.http.get<StreamingStatusDto>(`${this.baseUrl}/api/streaming/${videoId}/status`);
  }

  forceTranscode(videoId: number): Observable<TranscodeResultDto> {
    return this.http.post<TranscodeResultDto>(`${this.baseUrl}/api/streaming/${videoId}/transcode`, {});
  }

  // Paginated playlist videos
  getPlaylistVideos(playlistId: number, page: number, pageSize: number): Observable<PaginatedVideosDto> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PaginatedVideosDto>(`${this.baseUrl}/api/playlists/${playlistId}/videos`, { params });
  }
}
