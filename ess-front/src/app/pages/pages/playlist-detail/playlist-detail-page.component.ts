import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FieldService, PlaylistService, VideoService } from '../../../core/services';
import {
  FieldDto,
  PlaylistDetailDto,
  PlaylistDto,
  UpdatePlaylistDto,
  VideoDto,
  VideoListItemDto,
  VideoStatus
} from '../../../core/models';

@Component({
  selector: 'app-playlist-detail-page',
  templateUrl: './playlist-detail-page.component.html',
  styleUrls: ['./playlist-detail-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class PlaylistDetailPageComponent implements OnInit, OnDestroy {
  readonly fallbackThumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';

  playlistId = 0;
  detail: PlaylistDetailDto | null = null;
  fields: FieldDto[] = [];
  libraryVideos: VideoListItemDto[] = [];
  isLoading = false;
  errorMessage = '';

  showDialog = false;
  formTitle = '';
  formFieldId: number | null = null;
  formDescription = '';
  isSaving = false;
  formError = '';
  showDeleteConfirm = false;
  isDeleting = false;

  addSearch = '';
  selectedVideoIds = new Set<number>();
  isAdding = false;
  addError = '';

  private readonly subs: Subscription[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly playlistService: PlaylistService,
    private readonly fieldService: FieldService,
    private readonly videoService: VideoService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.route.paramMap.subscribe((params) => {
        const id = Number(params.get('id'));
        if (!id) {
          this.router.navigate(['/playlists']);
          return;
        }
        this.playlistId = id;
        this.loadDetail();
        this.loadLibrary();
      })
    );
    this.loadFields();
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  get playlist(): PlaylistDto | null {
    return this.detail?.playlist ?? null;
  }

  get videos(): VideoDto[] {
    return this.detail?.videos ?? [];
  }

  get fieldName(): string {
    return this.fields.find((f) => f.id === this.playlist?.fieldId)?.name ?? '';
  }

  get candidateVideos(): VideoListItemDto[] {
    const query = this.addSearch.trim().toLowerCase();
    return this.libraryVideos.filter((video) => {
      if (video.playlistId === this.playlistId) return false;
      return !query || video.title.toLowerCase().includes(query);
    });
  }

  loadDetail(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.subs.push(
      this.playlistService.getPlaylist(this.playlistId).subscribe({
        next: (detail) => {
          this.detail = detail;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Unable to load playlist.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      })
    );
  }

  loadFields(): void {
    this.subs.push(
      this.fieldService.getFields().subscribe({
        next: (fields) => {
          this.fields = fields;
          this.cdr.markForCheck();
        },
        error: () => {}
      })
    );
  }

  loadLibrary(): void {
    this.subs.push(
      this.videoService.getVideos().subscribe({
        next: (videos) => {
          this.libraryVideos = videos;
          this.cdr.markForCheck();
        },
        error: () => {}
      })
    );
  }

  toggleVideo(id: number): void {
    if (this.selectedVideoIds.has(id)) {
      this.selectedVideoIds.delete(id);
    } else {
      this.selectedVideoIds.add(id);
    }
  }

  addSelected(): void {
    if (this.selectedVideoIds.size === 0 || this.isAdding) return;

    this.isAdding = true;
    this.addError = '';
    const videoIds = Array.from(this.selectedVideoIds);

    this.subs.push(
      this.playlistService.addVideosToPlaylist(this.playlistId, { videoIds }).subscribe({
        next: () => {
          this.isAdding = false;
          this.selectedVideoIds.clear();
          this.addSearch = '';
          this.loadDetail();
          this.loadLibrary();
          this.cdr.markForCheck();
        },
        error: () => {
          this.addError = 'Unable to add the selected videos.';
          this.isAdding = false;
          this.cdr.markForCheck();
        }
      })
    );
  }

  removeVideo(videoId: number): void {
    this.subs.push(
      this.playlistService.removeVideoFromPlaylist(this.playlistId, videoId).subscribe({
        next: () => {
          this.loadDetail();
          this.cdr.markForCheck();
        },
        error: () => {}
      })
    );
  }

  openEditDialog(): void {
    const playlist = this.playlist;
    if (!playlist) return;

    this.formTitle = playlist.title;
    this.formFieldId = playlist.fieldId;
    this.formDescription = playlist.description ?? '';
    this.formError = '';
    this.showDialog = true;
  }

  closeDialog(): void {
    if (this.isSaving) return;
    this.showDialog = false;
  }

  savePlaylist(): void {
    if (!this.formTitle.trim() || this.formFieldId === null || this.isSaving) return;

    this.isSaving = true;
    this.formError = '';

    const payload: UpdatePlaylistDto = {
      title: this.formTitle.trim(),
      fieldId: this.formFieldId,
      description: this.formDescription.trim() || null
    };

    this.subs.push(
      this.playlistService.updatePlaylist(this.playlistId, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.showDialog = false;
          this.loadDetail();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.formError = err.error?.message ?? 'Unable to save the playlist.';
          this.isSaving = false;
          this.cdr.markForCheck();
        }
      })
    );
  }

  deletePlaylist(): void {
    if (this.isDeleting) return;

    this.isDeleting = true;
    this.subs.push(
      this.playlistService.deletePlaylist(this.playlistId).subscribe({
        next: () => {
          this.router.navigate(['/playlists']);
        },
        error: () => {
          this.isDeleting = false;
          this.cdr.markForCheck();
        }
      })
    );
  }

  videoProgress(video: VideoDto): number {
    if (video.durationSeconds <= 0 || video.watchedSeconds <= 0) return 0;
    return Math.min(100, Math.round((video.watchedSeconds / video.durationSeconds) * 100));
  }

  statusLabel(video: VideoDto): string {
    if (video.status === VideoStatus.Completed) return 'Completed';
    if (video.status === VideoStatus.InProgress) return 'In progress';
    return 'Not started';
  }

  formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}