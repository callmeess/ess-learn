import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { PlaylistDetailDto, PlaylistDto, PaginatedVideosDto } from '../models';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  constructor(private readonly api: ApiService) {}

  getPlaylists(fieldId?: number): Observable<PlaylistDto[]> {
    return this.api.getPlaylists(fieldId);
  }

  getPlaylist(id: number): Observable<PlaylistDetailDto> {
    return this.api.getPlaylist(id);
  }

  deletePlaylist(id: number): Observable<void> {
    return this.api.deletePlaylist(id);
  }

  getPlaylistVideos(playlistId: number, page: number, pageSize: number): Observable<PaginatedVideosDto> {
    return this.api.getPlaylistVideos(playlistId, page, pageSize);
  }
}
