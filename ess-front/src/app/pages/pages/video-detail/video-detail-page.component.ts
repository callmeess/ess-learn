import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { VideoService, DownloadService, StreamingService } from '../../../core/services';
import { DownloadProgressDto, DownloadStatusDto, VideoFormatDto, VideoStatus } from '../../../core/models';

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
  thumbnailUrl: string | null;
  thumbGrad: [string, string, string];
  thumbEmoji: string;
  watchedSeconds: number;
  durationSeconds: number;
}

@Component({
  selector: 'app-video-detail-page',
  templateUrl: './video-detail-page.component.html',
  styleUrls: ['./video-detail-page.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class VideoDetailPageComponent implements OnInit, OnDestroy {
  readonly videoId: number;
  selectedFormat = '';
  isDownloading = false;
  isLoading = false;
  formatsLoading = false;
  formatsLoaded = false;
  formatsError = '';
  errorMessage = '';
  toastMessage = '';
  toastVisible = false;
  private toastTimer?: number;
  private readonly subs = new Subscription();
  public downloadStatus: DownloadStatusDto = { isDownloaded: false, download: null };

  downloadProgress = 0;
  downloadStatusText = '';
  private progressPollSub?: Subscription;

  isTranscoded = false;
  isTranscoding = false;
  transcodeProgress = 0;
  private transcodePollSub?: Subscription;

  formats: VideoFormat[] = [];

  video?: VideoDetail;

  constructor(
    route: ActivatedRoute,
    private readonly router: Router,
    private readonly videoService: VideoService,
    private readonly downloadService: DownloadService,
    private readonly streamingService: StreamingService
  ) {
    const idValue = Number.parseInt(route.snapshot.params['id'] ?? '0', 10);
    this.videoId = Number.isNaN(idValue) ? 0 : idValue;
  }

  ngOnInit(): void {
    this.loadVideoDetail();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.progressPollSub?.unsubscribe();
    this.transcodePollSub?.unsubscribe();
    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }
  }

  get selectedFormatSpec(): VideoFormat {
    const fallback = this.formats[0] ?? { id: '', label: 'No formats available', quality: 'N/A', format: 'N/A', fps: 'N/A', size: 'N/A' };
    return this.formats.find((format) => format.id === this.selectedFormat) ?? fallback;
  }

  get transcodeLabel(): string {
    if (this.isTranscoded) return 'Transcoded';
    if (this.isTranscoding) return `Transcoding ${this.transcodeProgress}%`;
    return 'Not Transcoded';
  }

  setSelectedFormat(value: string): void {
    this.selectedFormat = value;
  }

  loadFormatsOnDemand(): void {
    if (this.formatsLoaded || this.formatsLoading) {
      return;
    }
    this.loadFormats();
  }

  togglePlay(): void {
    if (this.video) {
      this.router.navigate(['/watch', this.video.id]);
    }
  }

  downloadVideo(): void {
    if (this.isDownloading || !this.video || !this.selectedFormatSpec.id) {
      return;
    }

    const format = this.selectedFormatSpec;
    this.isDownloading = true;
    this.downloadProgress = 0;
    this.downloadStatusText = 'Starting download...';
    this.video.status = 'in-progress';
    this.video.statusLabel = 'Downloading...';

    this.showToast(`Starting download: ${format.quality} ${format.format} (${format.size})`);

    this.subs.add(
      this.downloadService.downloadVideo(this.video.id, format.id, format.quality).subscribe({
        next: () => {
          this.showToast('Download started. Processing in background...');
          this.startProgressPolling();
        },
        error: (err) => {
          this.isDownloading = false;
          this.downloadProgress = 0;
          this.downloadStatusText = '';
          if (this.video) {
            this.video.status = this.downloadStatus.isDownloaded ? 'downloaded' : 'not-downloaded';
            this.video.statusLabel = this.statusLabel(this.video.status, this.video.watchedSeconds, this.video.durationSeconds);
          }
          this.showToast(err.error?.message || 'Failed to start download');
        }
      })
    );
  }

  forceTranscode(): void {
    if (!this.downloadStatus.isDownloaded || this.isTranscoding || this.isTranscoded) return;

    this.isTranscoding = true;
    this.transcodeProgress = 0;
    this.showToast('Starting transcoding...');

    this.streamingService.forceTranscode(this.videoId).subscribe({
      next: () => {
        this.pollTranscodeProgress();
      },
      error: (err) => {
        this.isTranscoding = false;
        this.showToast(err.error?.message || 'Failed to start transcoding');
      }
    });
  }

  showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;

    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }

    this.toastTimer = window.setTimeout(() => {
      this.toastVisible = false;
    }, 3500);
  }

  private startProgressPolling(): void {
    this.progressPollSub?.unsubscribe();

    this.progressPollSub = interval(1500).pipe(
      switchMap(() => this.downloadService.getProgress(this.videoId)),
      takeWhile((progress) => progress.hasActiveJob, true)
    ).subscribe({
      next: (progress) => {
        this.downloadProgress = Math.round(progress.progress);
        this.downloadStatusText = this.getDownloadStatusText(progress.status);

        if (progress.status === 'Completed') {
          this.onDownloadComplete();
        } else if (progress.status === 'Failed') {
          this.onDownloadFailed(progress.errorMessage);
        }
      },
      error: () => {
        this.isDownloading = false;
        this.downloadProgress = 0;
        this.downloadStatusText = '';
      }
    });
  }

  private onDownloadComplete(): void {
    this.progressPollSub?.unsubscribe();
    this.isDownloading = false;
    this.downloadProgress = 100;
    this.downloadStatusText = 'Download complete';
    this.downloadStatus.isDownloaded = true;

    if (this.video) {
      this.video.status = 'downloaded';
      this.video.statusLabel = 'Downloaded';
    }

    this.showToast('Download complete! Video stored in blob storage.');
    setTimeout(() => {
      this.downloadProgress = 0;
      this.downloadStatusText = '';
    }, 3000);

    this.checkStreamingStatus();
  }

  private onDownloadFailed(errorMessage?: string): void {
    this.progressPollSub?.unsubscribe();
    this.isDownloading = false;
    this.downloadProgress = 0;
    this.downloadStatusText = '';

    if (this.video) {
      this.video.status = this.downloadStatus.isDownloaded ? 'downloaded' : 'not-downloaded';
      this.video.statusLabel = this.statusLabel(this.video.status, this.video.watchedSeconds, this.video.durationSeconds);
    }

    this.showToast(errorMessage || 'Download failed');
  }

  private getDownloadStatusText(status?: string): string {
    switch (status) {
      case 'Pending': return 'Queued...';
      case 'Downloading': return 'Downloading from YouTube...';
      case 'Uploading': return 'Uploading to storage...';
      case 'Completed': return 'Download complete';
      case 'Failed': return 'Download failed';
      default: return 'Processing...';
    }
  }

  private loadVideoDetail(): void {
    if (this.videoId <= 0) {
      this.errorMessage = 'Invalid video id.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.subs.add(
      this.videoService.getVideo(this.videoId).subscribe({
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
            thumbnailUrl: video.thumbnailUrl,
            thumbGrad: ['#0a1628', '#102040', '#1a3a5c'],
            thumbEmoji: '🎬',
            watchedSeconds: video.watchedSeconds,
            durationSeconds: video.durationSeconds
          };

          this.loadDownloadStatus();
          this.checkForActiveDownload();
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Unable to load video details. Make sure the API is running on port 5083.';
          this.isLoading = false;
        }
      })
    );
  }

  private checkForActiveDownload(): void {
    this.subs.add(
      this.downloadService.getProgress(this.videoId).subscribe({
        next: (progress) => {
          if (progress.hasActiveJob) {
            this.isDownloading = true;
            this.downloadProgress = Math.round(progress.progress);
            this.downloadStatusText = this.getDownloadStatusText(progress.status);
            this.startProgressPolling();
          }
        },
        error: () => {}
      })
    );
  }

  private checkStreamingStatus(): void {
    this.subs.add(
      this.streamingService.getStatus(this.videoId).subscribe({
        next: (status) => {
          this.isTranscoded = status.isTranscoded;
          this.isTranscoding = status.isTranscoding;
          this.transcodeProgress = status.progressPercent;

          if (status.isTranscoding) {
            this.pollTranscodeProgress();
          }
        },
        error: () => {}
      })
    );
  }

  private pollTranscodeProgress(): void {
    this.transcodePollSub?.unsubscribe();

    this.transcodePollSub = interval(3000).pipe(
      switchMap(() => this.streamingService.getStatus(this.videoId)),
      takeWhile((s) => s.isTranscoding, true)
    ).subscribe({
      next: (status) => {
        this.transcodeProgress = status.progressPercent;
        if (status.isTranscoded) {
          this.isTranscoded = true;
          this.isTranscoding = false;
          this.showToast('Transcoding complete!');
        } else if (!status.isTranscoding) {
          this.isTranscoding = false;
        }
      },
      error: () => {
        this.isTranscoding = false;
      }
    });
  }

  private loadFormats(): void {
    this.formatsLoading = true;
    this.formatsError = '';

    this.subs.add(
      this.downloadService.getFormats(this.videoId).subscribe({
        next: (formats) => {
          this.formats = formats.map((format) => this.mapFormat(format));
          this.selectedFormat = this.formats[0]?.id ?? '';
          this.formatsLoading = false;
          this.formatsLoaded = true;
        },
        error: () => {
          this.formats = [];
          this.formatsLoading = false;
          this.formatsError = 'Failed to load video formats. You can still use the default format.';
        }
      })
    );
  }

  private loadDownloadStatus(): void {
    this.subs.add(
      this.downloadService.getStatus(this.videoId).subscribe({
        next: (status) => {
          this.downloadStatus = status;

          if (!this.video) {
            return;
          }

          if (status.isDownloaded) {
            this.video.status = 'downloaded';
            this.video.statusLabel = 'Downloaded';
            this.checkStreamingStatus();
          }
        },
        error: () => {}
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
