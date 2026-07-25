import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { VideoFormatDto, DownloadedVideoDto, DownloadStatusDto, DownloadProgressDto } from '../models';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  constructor(private readonly api: ApiService) {}

  getFormats(videoId: number): Observable<VideoFormatDto[]> {
    return this.api.getVideoFormats(videoId);
  }

  downloadVideo(videoId: number, formatId: string, quality: string): Observable<DownloadedVideoDto> {
    return this.api.downloadVideo(videoId, formatId, quality);
  }

  deleteDownload(videoId: number): Observable<void> {
    return this.api.deleteDownload(videoId);
  }

  getStatus(videoId: number): Observable<DownloadStatusDto> {
    return this.api.getDownloadStatus(videoId);
  }

  getProgress(videoId: number): Observable<DownloadProgressDto> {
    return this.api.getDownloadProgress(videoId);
  }
}
