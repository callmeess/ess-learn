import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval, fromEvent } from 'rxjs';
import { throttleTime, switchMap, map } from 'rxjs/operators';
import Hls from 'hls.js';
import { VideoService, PlaylistService, DownloadService, StreamingService } from '../../../core/services';
import { API_BASE_URL } from '../../../core/api.config';
import { VideoListItemDto, VideoStatus } from '../../../core/models';

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
  isBuffering = false;
  errorMessage = '';

  private hls: Hls | null = null;
  private subs = new Subscription();
  private progressSub?: Subscription;
  private advanceSub?: Subscription;
  private downloadPollSub?: Subscription;
  private transcodePollSub?: Subscription;
  private bufferingSub = new Subscription();
  private observer?: IntersectionObserver;
  private seekToTime = 0;
  private stallRetries = 0;
  private stallTimer?: ReturnType<typeof setTimeout>;
  private readonly maxStallRetries = 3;
  private readonly stallTimeoutMs = 10000;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly videoService: VideoService,
    private readonly playlistService: PlaylistService,
    private readonly downloadService: DownloadService,
    private readonly streamingService: StreamingService
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
    this.stopPolls();
    this.bufferingSub.unsubscribe();
    this.subs.unsubscribe();
    this.observer?.disconnect();
  }

  loadVideo(videoId: number): void {
    this.currentVideoId = videoId;
    this.stopPolls();
    this.videoLoading = true;
    this.isBuffering = false;
    this.errorMessage = '';
    this.isDownloaded = false;
    this.isDownloading = false;
    this.isTranscoded = false;
    this.isTranscoding = false;

    this.subs.add(
      this.videoService.getVideo(videoId).subscribe({
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
            isTranscoded: video.isTranscoded,
            publishedAt: null,
            createdAt: new Date().toISOString()
          };
          this.seekToTime = video.watchedSeconds;
          this.isTranscoded = video.isTranscoded;
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
      this.playlistService.getPlaylist(playlistId).subscribe({
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
      this.playlistService.getPlaylistVideos(this.playlistId, page, 10).subscribe({
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
    const videoId = this.currentVideoId;
    this.subs.add(
      this.downloadService.getStatus(videoId).subscribe({
        next: (status) => {
          if (videoId !== this.currentVideoId) return;
          this.isDownloaded = status.isDownloaded;
          if (this.currentVideo) {
            this.currentVideo.isDownloaded = status.isDownloaded;
          }

          if (this.isDownloaded) {
            this.checkStreamingStatus();
          }
        },
        error: () => {
          if (videoId !== this.currentVideoId) return;
          this.checkStreamingStatus();
        }
      })
    );
  }

  private checkStreamingStatus(): void {
    const videoId = this.currentVideoId;
    this.subs.add(
      this.streamingService.getStatus(videoId).subscribe({
        next: (status) => {
          if (videoId !== this.currentVideoId) return;
          this.isTranscoded = status.isTranscoded;
          this.isTranscoding = status.isTranscoding;
          this.transcodeProgress = status.progressPercent;

          if (this.isTranscoded) {
            this.initPlayer();
          } else if (status.isTranscoding || this.isDownloaded) {
            this.pollTranscodingStatus();
          }
        },
        error: () => {
          if (videoId !== this.currentVideoId) return;
          this.errorMessage = 'Failed to check streaming status.';
        }
      })
    );
  }

  downloadForStreaming(): void {
    if (this.isDownloading) return;

    this.isDownloading = true;
    this.downloadProgress = 0;

    this.subs.add(
      this.downloadService.getFormats(this.currentVideoId).subscribe({
        next: (formats) => {
          if (formats.length === 0) {
            this.isDownloading = false;
            this.errorMessage = 'No download formats available.';
            return;
          }

          const bestFormat = formats[0];
          this.downloadService.downloadVideo(this.currentVideoId, bestFormat.formatId, bestFormat.quality).subscribe({
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

  forceTranscode(): void {
    if (this.isDownloading || this.isTranscoding) return;

    this.isTranscoding = true;
    this.transcodeProgress = 0;

    this.subs.add(
      this.streamingService.forceTranscode(this.currentVideoId).subscribe({
        next: () => {
          this.pollTranscodingStatus();
        },
        error: () => {
          this.isTranscoding = false;
          this.errorMessage = 'Failed to start transcoding.';
        }
      })
    );
  }

  private pollDownloadProgress(): void {
    this.stopPolls();
    this.downloadPollSub = interval(2000).pipe(
      switchMap(() => this.downloadService.getProgress(this.currentVideoId))
    ).subscribe({
      next: (progress) => {
        this.downloadProgress = Math.round(progress.progress);

        if (progress.status === 'Completed') {
          this.isDownloading = false;
          this.isDownloaded = true;
          if (this.currentVideo) {
            this.currentVideo.isDownloaded = true;
          }
          this.stopPolls();
          this.checkStreamingStatus();
        } else if (progress.status === 'Failed') {
          this.isDownloading = false;
          this.stopPolls();
        }
      },
      error: () => {
        this.isDownloading = false;
        this.stopPolls();
      }
    });
  }

  private pollTranscodingStatus(): void {
    this.stopPolls();
    this.transcodePollSub = interval(3000).pipe(
      switchMap(() => this.streamingService.getStatus(this.currentVideoId))
    ).subscribe({
      next: (status) => {
        this.transcodeProgress = status.progressPercent;
        this.isTranscoding = status.isTranscoding;

        if (status.isTranscoded) {
          this.isTranscoded = true;
          this.isTranscoding = false;
          this.stopPolls();
          this.initPlayer();
        } else if (!status.isTranscoding) {
          this.isTranscoding = false;
          this.stopPolls();
        }
      },
      error: () => {
        this.isTranscoding = false;
        this.stopPolls();
      }
    });
  }

  private initPlayer(): void {
    this.destroyPlayer();

    const video = this.videoElement?.nativeElement;
    if (!video) return;

    // The video is ready to play: make sure no preparing/loading overlay lingers.
    this.videoLoading = false;
    this.isTranscoded = true;
    this.isBuffering = false;

    const url = `${API_BASE_URL}/api/streaming/${this.currentVideoId}/master.m3u8`;

    this.setupPlayerEvents(video);

    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        backBufferLength: 30,
        maxBufferSize: 60 * 1000 * 1000,
        startLevel: -1,
        fragLoadingMaxRetry: 10,
        fragLoadingRetryDelay: 500,
        manifestLoadingMaxRetry: 2,
        manifestLoadingRetryDelay: 1000
      });
      this.hls.loadSource(url);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (this.seekToTime > 0) {
          video.currentTime = this.seekToTime;
        }
        video.play().catch(() => {});
      });
      this.hls.on(Hls.Events.FRAG_BUFFERED, () => {
        this.stallRetries = 0;
        this.isBuffering = false;
        this.clearStallTimer();
      });
      this.hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              this.hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              this.hls?.recoverMediaError();
              break;
            default:
              this.hls?.destroy();
              this.hls = null;
              this.errorMessage = 'Failed to play this video. Please try again.';
              break;
          }
          return;
        }

        // Recover from persistent non-fatal stalls: if fragments repeatedly fail to
        // load or the buffer stalls, nudge hls.js to reload the manifest and resume.
        if (
          data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR ||
          data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR
        ) {
          this.stallRetries++;
          if (this.stallRetries >= this.maxStallRetries) {
            this.stallRetries = 0;
            this.hls?.startLoad();
          }
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

  private markPlaybackReady(): void {
    this.videoLoading = false;
    this.isBuffering = false;
    this.clearStallTimer();
  }

  private setupPlayerEvents(video: HTMLVideoElement): void {
    this.bufferingSub.unsubscribe();
    this.bufferingSub = new Subscription();

    this.bufferingSub.add(
      fromEvent(video, 'waiting').subscribe(() => {
        this.isBuffering = true;
        this.armStallTimer();
      })
    );

    this.bufferingSub.add(
      fromEvent(video, 'playing').subscribe(() => {
        this.markPlaybackReady();
        this.isDownloading = false;
        this.isTranscoding = false;
        this.errorMessage = '';
      })
    );

    this.bufferingSub.add(
      fromEvent(video, 'loadeddata').subscribe(() => {
        this.markPlaybackReady();
      })
    );

    this.bufferingSub.add(
      fromEvent(video, 'canplay').subscribe(() => {
        this.markPlaybackReady();
      })
    );

    this.bufferingSub.add(
      fromEvent(video, 'canplaythrough').subscribe(() => {
        this.markPlaybackReady();
      })
    );

    this.bufferingSub.add(
      fromEvent(video, 'seeked').subscribe(() => {
        this.markPlaybackReady();
      })
    );

    this.bufferingSub.add(
      fromEvent(video, 'timeupdate').subscribe(() => {
        if (!video.paused && video.currentTime > 0) {
          this.markPlaybackReady();
        }
      })
    );
  }

  private armStallTimer(): void {
    this.clearStallTimer();
    this.stallTimer = setTimeout(() => {
      this.stallTimer = undefined;
      if (this.isBuffering) {
        this.hls?.startLoad();
      }
    }, this.stallTimeoutMs);
  }

  private clearStallTimer(): void {
    if (this.stallTimer) {
      clearTimeout(this.stallTimer);
      this.stallTimer = undefined;
    }
  }

  private destroyPlayer(): void {
    this.progressSub?.unsubscribe();
    this.progressSub = undefined;
    this.advanceSub?.unsubscribe();
    this.advanceSub = undefined;
    this.bufferingSub.unsubscribe();
    this.clearStallTimer();
    this.stallRetries = 0;
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

  private stopPolls(): void {
    this.downloadPollSub?.unsubscribe();
    this.downloadPollSub = undefined;
    this.transcodePollSub?.unsubscribe();
    this.transcodePollSub = undefined;
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
      this.videoService.updateVideoProgress(this.currentVideoId, time, status).subscribe({
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
    this.advanceSub?.unsubscribe();
    this.advanceSub = fromEvent(video, 'ended').subscribe(() => {
      this.markVideoCompleted();
      this.playNextVideo();
    });
  }

  private markVideoCompleted(): void {
    const video = this.videoElement?.nativeElement;
    const finalTime = video ? video.duration : 0;

    this.subs.add(
      this.videoService.updateVideoProgress(this.currentVideoId, finalTime, VideoStatus.Completed).subscribe({
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
        this.playlistService.getPlaylistVideos(this.playlistId!, this.currentPage + 1, 10).subscribe({
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
    this.stopPolls();
    this.currentVideoId = video.id;
    this.currentVideo = video;
    this.seekToTime = video.watchedSeconds;
    this.isDownloaded = video.isDownloaded;
    this.isDownloading = false;
    this.isTranscoded = video.isTranscoded;
    this.isTranscoding = false;
    this.isBuffering = false;
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
