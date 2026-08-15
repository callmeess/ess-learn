import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import {
  AddVideosToPlaylistDto,
  CreatePlaylistDto,
  PlaylistDetailDto,
  PlaylistDto,
  UpdatePlaylistDto,
  PaginatedVideosDto
} from '../models';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  constructor(private readonly api: ApiService) {}

  getPlaylists(fieldId?: number): Observable<PlaylistDto[]> {
    return this.api.getPlaylists(fieldId);
  }

  createPlaylist(dto: CreatePlaylistDto): Observable<PlaylistDto> {
    return this.api.createPlaylist(dto);
  }

  updatePlaylist(id: number, dto: UpdatePlaylistDto): Observable<PlaylistDto> {
    return this.api.updatePlaylist(id, dto);
  }

  getPlaylist(id: number): Observable<PlaylistDetailDto> {
    return this.api.getPlaylist(id);
  }

  deletePlaylist(id: number): Observable<void> {
    return this.api.deletePlaylist(id);
  }

  addVideosToPlaylist(playlistId: number, dto: AddVideosToPlaylistDto): Observable<void> {
    return this.api.addVideosToPlaylist(playlistId, dto);
  }

  removeVideoFromPlaylist(playlistId: number, videoId: number): Observable<void> {
    return this.api.removeVideoFromPlaylist(playlistId, videoId);
  }

  getPlaylistVideos(playlistId: number, page: number, pageSize: number): Observable<PaginatedVideosDto> {
    return this.api.getPlaylistVideos(playlistId, page, pageSize);
  }
}
