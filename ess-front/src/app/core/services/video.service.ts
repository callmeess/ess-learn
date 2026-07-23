import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { VideoListItemDto, VideoDto, ProgressDto, VideoStatus, PaginatedVideosDto } from '../models';

@Injectable({ providedIn: 'root' })
export class VideoService {
  constructor(private readonly api: ApiService) {}

  getVideos(filters?: { playlistId?: number; fieldId?: number }): Observable<VideoListItemDto[]> {
    return this.api.getVideos(filters);
  }

  getVideo(id: number): Observable<VideoDto> {
    return this.api.getVideo(id);
  }

  getVideoProgress(id: number): Observable<ProgressDto> {
    return this.api.getVideoProgress(id);
  }

  updateVideoProgress(id: number, watchedSeconds: number, status: VideoStatus): Observable<ProgressDto> {
    return this.api.updateVideoProgress(id, watchedSeconds, status);
  }
}
