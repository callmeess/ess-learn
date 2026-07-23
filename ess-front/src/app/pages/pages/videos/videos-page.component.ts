import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { SearchStateService } from '../../../search-state.service';
import { VideoService, DownloadService, StreamingService } from '../../../core/services';
import { VideoListItemDto, VideoStatus } from '../../../core/models';

interface Video {
  id: number;
  title: string;
  channel: string;
  duration: string;
  date: string;
  playlist: string;
  downloaded: boolean;
  status: 'not-downloaded' | 'in-progress' | 'completed';
  statusLabel: string;
  watchProgress: number | null;
  thumbnailUrl: string | null;
  thumbGrad: [string, string, string];
  thumbEmoji: string;
  isDownloading?: boolean;
  isTranscoding?: boolean;
}

type SortBy = 'recent' | 'duration' | 'alpha' | 'progress';
type FilterBy = 'all' | 'not-downloaded' | 'in-progress' | 'completed';

@Component({
  selector: 'app-videos-page',
  templateUrl: './videos-page.component.html',
  styleUrls: ['./videos-page.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class VideosPageComponent implements OnInit, OnDestroy {
  currentCategory: FilterBy = 'all';
  sortBy: SortBy = 'recent';
  searchQuery = '';
  isLoading = false;
  errorMessage = '';
  videos: Video[] = [];
  openMenuId: number | null = null;

  readonly categories: Array<{ value: FilterBy; label: string }> = [
    { value: 'all', label: 'All Videos' },
    { value: 'not-downloaded', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  private querySub?: Subscription;
  private loadSub?: Subscription;
  private apiSubs: Subscription[] = [];
  private readonly gradients: [string, string, string][] = [
    ['#1a1a2e', '#16213e', '#0f3460'],
    ['#0d1117', '#1c2a3a', '#2d4a6b'],
    ['#0a1628', '#102040', '#1a3a5c'],
    ['#1a0a00', '#2d1a00', '#4a2e0a'],
    ['#0a0a1a', '#12122a', '#1e1e40'],
    ['#001a00', '#002d00', '#004a00']
  ];
  private readonly emojis = ['🎥', '📚', '💡', '🧠', '🚀', '⚙️'];

  constructor(
    private readonly searchState: SearchStateService,
    private readonly videoService: VideoService,
    private readonly downloadService: DownloadService,
    private readonly streamingService: StreamingService
  ) {}

  ngOnInit(): void {
    this.loadVideos();

    this.querySub = this.searchState.query$.subscribe((query) => {
      this.searchQuery = query;
    });
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
    this.loadSub?.unsubscribe();
    this.apiSubs.forEach((sub) => sub.unsubscribe());
  }

  quickDownload(event: MouseEvent, video: Video): void {
    event.preventDefault();
    event.stopPropagation();

    if (video.isDownloading || video.downloaded) {
      return;
    }

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

  toggleMenu(event: MouseEvent, video: Video): void {
    event.preventDefault();
    event.stopPropagation();
    this.openMenuId = this.openMenuId === video.id ? null : video.id;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  forceTranscode(event: MouseEvent, video: Video): void {
    event.preventDefault();
    event.stopPropagation();
    this.openMenuId = null;

    if (video.isTranscoding || !video.downloaded) return;

    video.isTranscoding = true;

    this.streamingService.forceTranscode(video.id).subscribe({
      next: () => {
        this.pollTranscodeProgress(video);
      },
      error: () => {
        video.isTranscoding = false;
      }
    });
  }

  deleteDownload(event: MouseEvent, video: Video): void {
    event.preventDefault();
    event.stopPropagation();
    this.openMenuId = null;

    if (!video.downloaded) return;

    this.downloadService.deleteDownload(video.id).subscribe({
      next: () => {
        video.downloaded = false;
      }
    });
  }

  viewDetails(event: MouseEvent, video: Video): void {
    event.preventDefault();
    event.stopPropagation();
    this.openMenuId = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openMenuId = null;
  }

  private pollDownloadProgress(video: Video): void {
    const poll$ = interval(2000).pipe(
      switchMap(() => this.downloadService.getProgress(video.id)),
      takeWhile((p) => p.hasActiveJob, true)
    );

    this.apiSubs.push(
      poll$.subscribe({
        next: (progress) => {
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

  private pollTranscodeProgress(video: Video): void {
    const poll$ = interval(2000).pipe(
      switchMap(() => this.streamingService.getStatus(video.id)),
      takeWhile((s) => s.isTranscoding, true)
    );

    this.apiSubs.push(
      poll$.subscribe({
        next: (status) => {
          if (!status.isTranscoding) {
            video.isTranscoding = false;
          }
        },
        error: () => {
          video.isTranscoding = false;
        }
      })
    );
  }

  loadVideos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadSub?.unsubscribe();

    this.loadSub = this.videoService.getVideos().subscribe({
      next: (videos) => {
        this.videos = videos.map((video) => this.mapVideo(video));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load videos. Make sure the API is running on port 5083.';
        this.isLoading = false;
      }
    });
  }

  get filteredVideos(): Video[] {
    const query = this.searchQuery.trim().toLowerCase();

    const filtered = this.videos.filter((video) => {
      const categoryMatch = this.currentCategory === 'all' || video.status === this.currentCategory;
      const queryMatch =
        !query ||
        video.title.toLowerCase().includes(query) ||
        video.channel.toLowerCase().includes(query) ||
        video.playlist.toLowerCase().includes(query);

      return categoryMatch && queryMatch;
    });

    return [...filtered].sort((a, b) => this.compareVideos(a, b));
  }

  durationInSeconds(duration: string): number {
    const parts = duration.split(':').map((part) => Number.parseInt(part, 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
      return 0;
    }

    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  playlistSnippet(value: string): string {
    return value.split(' ').slice(0, 3).join(' ');
  }

  setCategory(value: string): void {
    this.currentCategory = value as FilterBy;
  }

  setSort(value: string): void {
    this.sortBy = value as SortBy;
  }

  private compareVideos(a: Video, b: Video): number {
    if (this.sortBy === 'duration') {
      return this.durationInSeconds(b.duration) - this.durationInSeconds(a.duration);
    }

    if (this.sortBy === 'alpha') {
      return a.title.localeCompare(b.title);
    }

    if (this.sortBy === 'progress') {
      return (b.watchProgress ?? 0) - (a.watchProgress ?? 0);
    }

    return b.id - a.id;
  }

  private mapVideo(video: VideoListItemDto): Video {
    const progress = this.calculateProgress(video.watchedSeconds, video.durationSeconds);
    const index = video.id % this.gradients.length;
    const status = this.mapStatus(video.status);

    return {
      id: video.id,
      title: video.title,
      channel: video.channelTitle ?? 'Unknown Channel',
      duration: this.formatDuration(video.durationSeconds),
      date: this.formatDate(video.publishedAt ?? video.createdAt),
      playlist: video.playlistTitle,
      downloaded: video.isDownloaded,
      status,
      statusLabel: this.statusLabel(status, progress),
      watchProgress: progress,
      thumbnailUrl: video.thumbnailUrl,
      thumbGrad: this.gradients[index],
      thumbEmoji: this.emojis[index]
    };
  }

  private mapStatus(status: VideoStatus): Video['status'] {
    if (status === VideoStatus.Completed) {
      return 'completed';
    }

    if (status === VideoStatus.InProgress) {
      return 'in-progress';
    }

    return 'not-downloaded';
  }

  private statusLabel(status: Video['status'], progress: number | null): string {
    if (status === 'completed') {
      return 'Completed';
    }

    if (status === 'in-progress') {
      return `${progress ?? 0}% watched`;
    }

    return 'Not Started';
  }

  private calculateProgress(watchedSeconds: number, durationSeconds: number): number | null {
    if (durationSeconds <= 0 || watchedSeconds <= 0) {
      return null;
    }

    return Math.min(100, Math.round((watchedSeconds / durationSeconds) * 100));
  }

  private formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
  }
}
