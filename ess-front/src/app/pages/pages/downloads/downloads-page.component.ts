import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { VideoService, DownloadService } from '../../../core/services';
import { VideoListItemDto } from '../../../core/models';

interface Video {
  id: number;
  title: string;
  channel: string;
  playlist: string;
  duration: string;
  downloaded: boolean;
  isDownloading?: boolean;
  downloadProgress?: number;
  thumbnailUrl: string | null;
}

@Component({
  selector: 'app-downloads-page',
  templateUrl: './downloads-page.component.html',
  styleUrls: ['./downloads-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class DownloadsPageComponent implements OnInit, OnDestroy {
  tab: 'active' | 'completed' = 'active';
  searchQuery = '';
  filterPlaylist = '';
  filterChannel = '';
  isLoading = false;
  errorMessage = '';
  allVideos: Video[] = [];

  private loadSub?: Subscription;
  private apiSubs: Subscription[] = [];

  constructor(
    private readonly videoService: VideoService,
    private readonly downloadService: DownloadService
  ) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    this.apiSubs.forEach((sub) => sub.unsubscribe());
  }

  loadVideos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadSub?.unsubscribe();

    this.loadSub = this.videoService.getVideos().subscribe({
      next: (videos) => {
        this.allVideos = videos.map((v) => this.mapVideo(v));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load videos. Make sure the API is running on port 5083.';
        this.isLoading = false;
      }
    });
  }

  get activeDownloads(): Video[] {
    return this.applyFilters(this.allVideos.filter((v) => !v.downloaded));
  }

  get completedDownloads(): Video[] {
    return this.applyFilters(this.allVideos.filter((v) => v.downloaded));
  }

  get availableCount(): number {
    return this.allVideos.filter((v) => !v.downloaded).length;
  }

  get downloadedCount(): number {
    return this.allVideos.filter((v) => v.downloaded).length;
  }

  get downloadingCount(): number {
    return this.allVideos.filter((v) => v.isDownloading).length;
  }

  get uniquePlaylists(): string[] {
    return [...new Set(this.allVideos.map((v) => v.playlist))].sort();
  }

  get uniqueChannels(): string[] {
    return [...new Set(this.allVideos.map((v) => v.channel))].sort();
  }

  quickDownload(event: MouseEvent, video: Video): void {
    event.preventDefault();
    event.stopPropagation();

    if (video.isDownloading || video.downloaded) return;

    video.isDownloading = true;

    this.downloadService.getFormats(video.id).subscribe({
      next: (formats) => {
        if (formats.length === 0) {
          video.isDownloading = false;
          return;
        }

        const bestFormat = formats[0];
        this.downloadService.downloadVideo(video.id, bestFormat.formatId, bestFormat.quality).subscribe({
          next: () => {
            this.pollDownloadProgress(video);
          },
          error: () => {
            video.isDownloading = false;
          }
        });
      },
      error: () => {
        video.isDownloading = false;
      }
    });
  }

  private pollDownloadProgress(video: Video): void {
    const poll$ = interval(2000).pipe(
      switchMap(() => this.downloadService.getProgress(video.id)),
      takeWhile((p) => p.hasActiveJob, true)
    );

    this.apiSubs.push(
      poll$.subscribe({
        next: (progress) => {
          video.downloadProgress = progress.progress;
          if (progress.status === 'Completed') {
            video.downloaded = true;
            video.isDownloading = false;
          } else if (progress.status === 'Failed') {
            video.isDownloading = false;
          }
        },
        error: () => {
          video.isDownloading = false;
        }
      })
    );
  }

  private applyFilters(videos: Video[]): Video[] {
    const query = this.searchQuery.trim().toLowerCase();

    return videos.filter((video) => {
      const searchMatch = !query ||
        video.title.toLowerCase().includes(query) ||
        video.channel.toLowerCase().includes(query) ||
        video.playlist.toLowerCase().includes(query);

      const playlistMatch = !this.filterPlaylist || video.playlist === this.filterPlaylist;
      const channelMatch = !this.filterChannel || video.channel === this.filterChannel;

      return searchMatch && playlistMatch && channelMatch;
    });
  }

  private mapVideo(video: VideoListItemDto): Video {
    return {
      id: video.id,
      title: video.title,
      channel: video.channelTitle ?? 'Unknown Channel',
      playlist: video.playlistTitle,
      duration: this.formatDuration(video.durationSeconds),
      downloaded: video.isDownloaded,
      thumbnailUrl: video.thumbnailUrl
    };
  }

  private formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}
