import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  FieldDto,
  CreateFieldDto,
  PlaylistDto,
  PlaylistDetailDto,
  VideoDto,
  UpdateProgressDto,
  ProgressDto,
  ImportPlaylistDto,
  ImportResultDto,
  DashboardDto,
} from '../types';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = '/api';
  constructor(private http: HttpClient) {}

  // Fields
  getFields(): Observable<FieldDto[]> {
    return this.http.get<FieldDto[]>(`${this.base}/fields`);
  }
  getField(id: number): Observable<FieldDto> {
    return this.http.get<FieldDto>(`${this.base}/fields/${id}`);
  }
  createField(dto: CreateFieldDto): Observable<FieldDto> {
    return this.http.post<FieldDto>(`${this.base}/fields`, dto);
  }
  updateField(id: number, dto: CreateFieldDto): Observable<FieldDto> {
    return this.http.put<FieldDto>(`${this.base}/fields/${id}`, dto);
  }
  deleteField(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/fields/${id}`);
  }

  // Playlists
  getPlaylists(fieldId?: number): Observable<PlaylistDto[]> {
    const params = fieldId ? new HttpParams().set('fieldId', String(fieldId)) : undefined as any;
    return this.http.get<PlaylistDto[]>(`${this.base}/playlists`, { params });
  }
  getPlaylist(id: number): Observable<PlaylistDetailDto> {
    return this.http.get<PlaylistDetailDto>(`${this.base}/playlists/${id}`);
  }
  deletePlaylist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/playlists/${id}`);
  }

  // Videos
  getVideo(id: number): Observable<VideoDto> {
    return this.http.get<VideoDto>(`${this.base}/videos/${id}`);
  }
  updateProgress(videoId: number, dto: UpdateProgressDto): Observable<ProgressDto> {
    return this.http.put<ProgressDto>(`${this.base}/videos/${videoId}/progress`, dto);
  }
  getProgress(videoId: number): Observable<ProgressDto> {
    return this.http.get<ProgressDto>(`${this.base}/videos/${videoId}/progress`);
  }

  // Import
  importPlaylist(dto: ImportPlaylistDto): Observable<ImportResultDto> {
    return this.http.post<ImportResultDto>(`${this.base}/import/playlist`, dto);
  }

  // Dashboard
  getDashboard(): Observable<DashboardDto> {
    return this.http.get<DashboardDto>(`${this.base}/dashboard`);
  }
}
