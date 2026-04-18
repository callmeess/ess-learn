import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ChannelDto,
  CreateFieldDto,
  DashboardDto,
  DownloadStatusDto,
  FieldDto,
  PlaylistDetailDto,
  PlaylistDto,
  ProgressDto,
  UpdateFieldDto,
  VideoDto,
  VideoFormatDto,
  VideoListItemDto,
  VideoStatus
} from './api.models';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = API_BASE_URL;

  constructor(private readonly http: HttpClient) {}

  // Dashboard
  getDashboard(): Observable<DashboardDto> {
    return this.http.get<DashboardDto>(`${this.baseUrl}/api/dashboard`);
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

  getPlaylist(id: number): Observable<PlaylistDetailDto> {
    return this.http.get<PlaylistDetailDto>(`${this.baseUrl}/api/playlists/${id}`);
  }

  deletePlaylist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/playlists/${id}`);
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

  downloadVideo(videoId: number, formatId: string, quality: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/api/videos/${videoId}/download`, { formatId, quality });
  }

  getDownloadStatus(videoId: number): Observable<DownloadStatusDto> {
    return this.http.get<DownloadStatusDto>(`${this.baseUrl}/api/videos/${videoId}/download/status`);
  }
}
