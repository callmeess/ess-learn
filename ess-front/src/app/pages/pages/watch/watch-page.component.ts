import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval, fromEvent } from 'rxjs';
import { throttleTime, switchMap, map } from 'rxjs/operators';
import Hls from 'hls.js';
import { ApiService } from '../../../core/api.service';
import { API_BASE_URL } from '../../../core/api.config';
import { VideoListItemDto, VideoStatus } from '../../../core/api.models';

@Component({
  selector: 'app-watch-page',
  templateUrl: './watch-page.component.html',
  styleUrls: ['./watch-page.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class WatchPageComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef<HTMLDivElement>;

  currentVideoId = 0;
  playlistId: number | null = null;
  currentVideo: VideoListItemDto | null = null;
  playlist: VideoListItemDto[] = [];
  playlistTitle = '';
  totalCount = 0;
  currentPage = 0;
  hasMoreVideos = false;
  loadingPage = false;

  isDownloaded = false;
  isDownloading = false;
  downloadProgress = 0;
  isTranscoded = false;
  isTranscoding = false;
  transcodeProgress = 0;
  videoLoading = true;
  errorMessage = '';

  private hls: Hls | null = null;
  private subs = new Subscription();
  private progressSub?: Subscription;
  private observer?: IntersectionObserver;
  private seekToTime = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiService
  ) {}

  ngOnInit(): void {
    const videoId = Number.parseInt(this.route.snapshot.params['videoId'] ?? '0', 10);
    if (Number.isNaN(videoId) || videoId <= 0) {
      this.errorMessage = 'Invalid video id.';
      return;
    }
    this.currentVideoId = videoId;
    this.loadVideo(videoId);
  }

  ngOnDestroy(): void {
    this.destroyPlayer();
    this.progressSub?.unsubscribe();
    this.subs.unsubscribe();
    this.observer?.disconnect();
  }

  loadVideo(videoId: number): void {
    this.currentVideoId = videoId;
    this.videoLoading = true;
    this.errorMessage = '';
    this.isDownloaded = false;
    this.isDownloading = false;
    this.isTranscoded = false;
    this.isTranscoding = false;

    this.subs.add(
      this.api.getVideo(videoId).subscribe({
        next: (video) => {
          this.currentVideo = {
            id: video.id,
            playlistId: video.playlistId,
            fieldId: 0,
            title: video.title,
            thumbnailUrl: video.thumbnailUrl,
            url: video.url,
            durationSeconds: video.durationSeconds,
            position: video.position,
            status: video.status,
            watchedSeconds: video.watchedSeconds,
            playlistTitle: '',
            channelTitle: null,
            isDownloaded: false,
            publishedAt: null,
            createdAt: new Date().toISOString()
          };
          this.seekToTime = video.watchedSeconds;
          this.videoLoading = false;

          if (!this.playlistId) {
            this.playlistId = video.playlistId;
            this.loadPlaylistTitle(video.playlistId);
            this.loadPlaylistPage(1);
          }

          this.checkDownloadStatus();
        },
        error: () => {
          this.errorMessage = 'Failed to load video.';
          this.videoLoading = false;
        }
      })
    );
  }

  private loadPlaylistTitle(playlistId: number): void {
    this.subs.add(
      this.api.getPlaylist(playlistId).subscribe({
        next: (detail) => {
          this.playlistTitle = detail.playlist.title;
          this.totalCount = detail.playlist.totalVideos;
        },
        error: () => {}
      })
    );
  }

  private loadPlaylistPage(page: number): void {
    if (this.loadingPage || !this.playlistId) return;
    this.loadingPage = true;

    this.subs.add(
      this.api.getPlaylistVideos(this.playlistId, page, 10).subscribe({
        next: (result) => {
          this.playlist = [...this.playlist, ...result.videos];
          this.currentPage = result.page;
          this.hasMoreVideos = result.hasMore;
          this.totalCount = result.totalCount;
          this.loadingPage = false;
        },
        error: () => {
          this.loadingPage = false;
        }
      })
    );
  }

  private checkDownloadStatus(): void {
    this.subs.add(
      this.api.getDownloadStatus(this.currentVideoId).subscribe({
        next: (status) => {
          this.isDownloaded = status.isDownloaded;
          if (this.currentVideo) {
            this.currentVideo.isDownloaded = status.isDownloaded;
          }

          if (this.isDownloaded) {
            this.checkStreamingStatus();
          }
        },
        error: () => {
          this.checkStreamingStatus();
        }
      })
    );
  }

  private checkStreamingStatus(): void {
    this.subs.add(
      this.api.getStreamingStatus(this.currentVideoId).subscribe({
        next: (status) => {
          this.isTranscoded = status.isTranscoded;
          this.isTranscoding = status.isTranscoding;
          this.transcodeProgress = status.progressPercent;

          if (this.isTranscoded) {
            this.initPlayer();
          } else if (this.isTranscoding) {
            this.pollTranscodingStatus();
          }
        },
        error: () => {}
      })
    );
  }

  downloadForStreaming(): void {
    if (this.isDownloading) return;

    this.isDownloading = true;
    this.downloadProgress = 0;

    this.subs.add(
      this.api.getVideoFormats(this.currentVideoId).subscribe({
        next: (formats) => {
          if (formats.length === 0) {
            this.isDownloading = false;
            this.errorMessage = 'No download formats available.';
            return;
          }

          const bestFormat = formats[0];
          this.api.downloadVideo(this.currentVideoId, bestFormat.formatId, bestFormat.quality).subscribe({
            next: () => {
              this.pollDownloadProgress();
            },
            error: () => {
              this.isDownloading = false;
            }
          });
        },
        error: () => {
          this.isDownloading = false;
        }
      })
    );
  }

  private pollDownloadProgress(): void {
    this.subs.add(
      interval(2000).pipe(
        switchMap(() => this.api.getDownloadProgress(this.currentVideoId))
      ).subscribe({
        next: (progress) => {
          this.downloadProgress = Math.round(progress.progress);

          if (progress.status === 'Completed') {
            this.isDownloading = false;
            this.isDownloaded = true;
            if (this.currentVideo) {
              this.currentVideo.isDownloaded = true;
            }
            this.checkStreamingStatus();
          } else if (progress.status === 'Failed') {
            this.isDownloading = false;
          }
        },
        error: () => {
          this.isDownloading = false;
        }
      })
    );
  }

  private pollTranscodingStatus(): void {
    this.subs.add(
      interval(3000).pipe(
        switchMap(() => this.api.getStreamingStatus(this.currentVideoId))
      ).subscribe({
        next: (status) => {
          this.transcodeProgress = status.progressPercent;
          if (status.isTranscoded) {
            this.isTranscoded = true;
            this.isTranscoding = false;
            this.initPlayer();
          } else if (!status.isTranscoding) {
            this.isTranscoding = false;
          }
        }
      })
    );
  }

  private initPlayer(): void {
    this.destroyPlayer();

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    const url = `${API_BASE_URL}/api/streaming/${this.currentVideoId}/master.m3u8`;

    if (Hls.isSupported()) {
      this.hls = new Hls({ enableWorker: true });
      this.hls.loadSource(url);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (this.seekToTime > 0) {
          video.currentTime = this.seekToTime;
        }
        video.play().catch(() => {});
      });
      this.hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          this.hls?.destroy();
          this.hls = null;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      if (this.seekToTime > 0) {
        video.currentTime = this.seekToTime;
      }
    }

    this.setupProgressTracking(video);
    this.setupAutoAdvance(video);
  }

  private destroyPlayer(): void {
    this.progressSub?.unsubscribe();
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    const video = this.videoElement?.nativeElement;
    if (video) {
      video.removeAttribute('src');
      video.load();
    }
  }

  private setupProgressTracking(video: HTMLVideoElement): void {
    this.progressSub = fromEvent(video, 'timeupdate').pipe(
      throttleTime(5000, undefined, { leading: false, trailing: true }),
      map(() => ({
        time: video.currentTime,
        duration: video.duration
      }))
    ).subscribe(({ time, duration }) => {
      if (!duration || duration === 0) return;
      const status = time >= duration * 0.9
        ? VideoStatus.Completed
        : VideoStatus.InProgress;
      this.api.updateVideoProgress(this.currentVideoId, time, status).subscribe({
        next: (progress) => {
          if (this.currentVideo) {
            this.currentVideo.watchedSeconds = progress.watchedSeconds;
            this.currentVideo.status = progress.status;
          }
          const playlistItem = this.playlist.find(v => v.id === this.currentVideoId);
          if (playlistItem) {
            playlistItem.watchedSeconds = progress.watchedSeconds;
            playlistItem.status = progress.status;
          }
        }
      });
    });
  }

  private setupAutoAdvance(video: HTMLVideoElement): void {
    this.subs.add(
      fromEvent(video, 'ended').subscribe(() => {
        this.markVideoCompleted();
        this.playNextVideo();
      })
    );
  }

  private markVideoCompleted(): void {
    const video = this.videoElement?.nativeElement;
    const finalTime = video ? video.duration : 0;

    this.subs.add(
      this.api.updateVideoProgress(this.currentVideoId, finalTime, VideoStatus.Completed).subscribe({
        next: (progress) => {
          if (this.currentVideo) {
            this.currentVideo.watchedSeconds = progress.watchedSeconds;
            this.currentVideo.status = progress.status;
          }
          const playlistItem = this.playlist.find(v => v.id === this.currentVideoId);
          if (playlistItem) {
            playlistItem.watchedSeconds = progress.watchedSeconds;
            playlistItem.status = progress.status;
          }
        }
      })
    );
  }

  playNextVideo(): void {
    const currentIndex = this.playlist.findIndex(v => v.id === this.currentVideoId);
    if (currentIndex >= 0 && currentIndex < this.playlist.length - 1) {
      const nextVideo = this.playlist[currentIndex + 1];
      this.selectVideo(nextVideo);
    } else if (this.hasMoreVideos) {
      this.subs.add(
        this.api.getPlaylistVideos(this.playlistId!, this.currentPage + 1, 10).subscribe({
          next: (result) => {
            this.playlist = [...this.playlist, ...result.videos];
            this.hasMoreVideos = result.hasMore;
            this.currentPage = result.page;
            const nextVideo = this.playlist.find(v => v.id !== this.currentVideoId);
            if (nextVideo) this.selectVideo(nextVideo);
          }
        })
      );
    }
  }

  selectVideo(video: VideoListItemDto): void {
    this.currentVideoId = video.id;
    this.currentVideo = video;
    this.seekToTime = video.watchedSeconds;
    this.isDownloaded = video.isDownloaded;
    this.isDownloading = false;
    this.isTranscoded = false;
    this.isTranscoding = false;
    this.destroyPlayer();
    this.checkDownloadStatus();
  }

  onVideoScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 100) {
      this.loadNextPage();
    }
  }

  private loadNextPage(): void {
    if (this.hasMoreVideos && !this.loadingPage && this.playlistId) {
      this.loadPlaylistPage(this.currentPage + 1);
    }
  }

  getProgressPercent(video: VideoListItemDto): number {
    if (video.durationSeconds <= 0) return 0;
    return Math.min(100, Math.round((video.watchedSeconds / video.durationSeconds) * 100));
  }

  formatDuration(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds <= 0) return '0:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  getWatchedPercent(): number {
    if (!this.currentVideo || this.currentVideo.durationSeconds <= 0) return 0;
    return Math.min(100, Math.round((this.currentVideo.watchedSeconds / this.currentVideo.durationSeconds) * 100));
  }

  getVideoIndex(): number {
    return this.playlist.findIndex(v => v.id === this.currentVideoId) + 1;
  }
}
