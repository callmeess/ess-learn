import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { DownloadStatusDto, VideoFormatDto, VideoStatus } from '../../core/api.models';

interface VideoFormat {
  id: string;
  label: string;
  quality: string;
  format: string;
  fps: string;
  size: string;
}

interface VideoDetail {
  id: number;
  title: string;
  fullTitle: string;
  channel: string;
  channelType: string;
  channelInitial: string;
  views: string;
  viewsShort: string;
  duration: string;
  date: string;
  playlist: string;
  status: 'not-downloaded' | 'in-progress' | 'downloaded' | 'completed';
  statusLabel: string;
  thumbGrad: [string, string, string];
  thumbEmoji: string;
  watchedSeconds: number;
  durationSeconds: number;
}

@Component({
  selector: 'app-video-detail-page',
  templateUrl: './video-detail-page.component.html',
  styleUrls: ['./video-detail-page.component.css'],
  standalone: false
})
export class VideoDetailPageComponent implements OnInit, OnDestroy {
  readonly videoId: number;
  selectedFormat = '';
  isPlaying = false;
  isDownloading = false;
  isLoading = false;
  errorMessage = '';
  toastMessage = '';
  toastVisible = false;
  private toastTimer?: number;
  private readonly subs = new Subscription();
  private downloadStatus: DownloadStatusDto = { isDownloaded: false, download: null };

  formats: VideoFormat[] = [];

  video?: VideoDetail;

  constructor(
    route: ActivatedRoute,
    private readonly api: ApiService
  ) {
    const idValue = Number.parseInt(route.snapshot.params['id'] ?? '0', 10);
    this.videoId = Number.isNaN(idValue) ? 0 : idValue;
  }

  ngOnInit(): void {
    this.loadVideoDetail();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }
  }

  get selectedFormatSpec(): VideoFormat {
    const fallback = this.formats[0] ?? { id: '', label: 'No formats available', quality: 'N/A', format: 'N/A', fps: 'N/A', size: 'N/A' };
    return this.formats.find((format) => format.id === this.selectedFormat) ?? fallback;
  }

  setSelectedFormat(value: string): void {
    this.selectedFormat = value;
  }

  togglePlay(): void {
    this.isPlaying = !this.isPlaying;

    if (!this.video || !this.isPlaying) {
      return;
    }

    const nextWatched = Math.min(this.video.durationSeconds, this.video.watchedSeconds + 30);
    this.subs.add(
      this.api.updateVideoProgress(this.video.id, nextWatched, VideoStatus.InProgress).subscribe({
        next: (progress) => {
          if (!this.video) {
            return;
          }

          this.video.watchedSeconds = progress.watchedSeconds;
          this.video.status = this.downloadStatus.isDownloaded ? 'downloaded' : 'in-progress';
          this.video.statusLabel = this.statusLabel(this.video.status, this.video.watchedSeconds, this.video.durationSeconds);
        }
      })
    );
  }

  downloadVideo(): void {
    if (this.isDownloading || !this.video || !this.selectedFormatSpec.id) {
      return;
    }

    const format = this.selectedFormatSpec;
    this.isDownloading = true;
    this.video.status = 'in-progress';
    this.video.statusLabel = 'Downloading...';

    this.showToast(`Downloading ${format.quality} ${format.format} (${format.size})`);

    this.subs.add(
      this.api.downloadVideo(this.video.id, format.id, format.quality).subscribe({
        next: () => {
          this.isDownloading = false;
          this.downloadStatus.isDownloaded = true;
          this.video!.status = 'downloaded';
          this.video!.statusLabel = 'Downloaded';
          this.showToast('Download complete');
        },
        error: () => {
          this.isDownloading = false;
          this.video!.status = 'in-progress';
          this.video!.statusLabel = this.statusLabel('in-progress', this.video!.watchedSeconds, this.video!.durationSeconds);
          this.showToast('Download failed');
        }
      })
    );
  }

  showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;

    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }

    this.toastTimer = window.setTimeout(() => {
      this.toastVisible = false;
    }, 2600);
  }

  private loadVideoDetail(): void {
    if (this.videoId <= 0) {
      this.errorMessage = 'Invalid video id.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.subs.add(
      this.api.getVideo(this.videoId).subscribe({
        next: (video) => {
          this.video = {
            id: video.id,
            title: video.title,
            fullTitle: video.title,
            channel: 'YouTube Channel',
            channelType: 'Imported Channel',
            channelInitial: 'Y',
            views: `Video #${video.position}`,
            viewsShort: `#${video.position}`,
            duration: this.formatDuration(video.durationSeconds),
            date: 'Imported',
            playlist: `Playlist #${video.playlistId}`,
            status: this.mapStatus(video.status),
            statusLabel: this.statusLabel(this.mapStatus(video.status), video.watchedSeconds, video.durationSeconds),
            thumbGrad: ['#0a1628', '#102040', '#1a3a5c'],
            thumbEmoji: '🎬',
            watchedSeconds: video.watchedSeconds,
            durationSeconds: video.durationSeconds
          };

          this.loadFormats();
          this.loadDownloadStatus();
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Unable to load video details. Make sure the API is running on port 5083.';
          this.isLoading = false;
        }
      })
    );
  }

  private loadFormats(): void {
    this.subs.add(
      this.api.getVideoFormats(this.videoId).subscribe({
        next: (formats) => {
          this.formats = formats.map((format) => this.mapFormat(format));
          this.selectedFormat = this.formats[0]?.id ?? '';
        },
        error: () => {
          this.formats = [];
        }
      })
    );
  }

  private loadDownloadStatus(): void {
    this.subs.add(
      this.api.getDownloadStatus(this.videoId).subscribe({
        next: (status) => {
          this.downloadStatus = status;

          if (!this.video) {
            return;
          }

          if (status.isDownloaded) {
            this.video.status = 'downloaded';
            this.video.statusLabel = 'Downloaded';
          }
        }
      })
    );
  }

  private mapFormat(format: VideoFormatDto): VideoFormat {
    const fps = format.videoCodec ? '30' : 'N/A';
    const qualityLabel = format.quality || `${format.width ?? '?'}x${format.height ?? '?'}`;
    const label = `${qualityLabel} - ${format.container.toUpperCase()} - ${format.fileSizeFormatted}`;

    return {
      id: format.formatId,
      label,
      quality: qualityLabel,
      format: format.container.toUpperCase(),
      fps,
      size: format.fileSizeFormatted
    };
  }

  private mapStatus(status: VideoStatus): VideoDetail['status'] {
    if (status === VideoStatus.Completed) {
      return 'completed';
    }

    if (status === VideoStatus.InProgress) {
      return 'in-progress';
    }

    return 'not-downloaded';
  }

  private statusLabel(status: VideoDetail['status'], watchedSeconds: number, durationSeconds: number): string {
    if (status === 'downloaded') {
      return 'Downloaded';
    }

    if (status === 'completed') {
      return 'Completed';
    }

    if (status === 'in-progress' && durationSeconds > 0) {
      const progress = Math.min(100, Math.round((watchedSeconds / durationSeconds) * 100));
      return `${progress}% watched`;
    }

    return 'Not Started';
  }

  private formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}
