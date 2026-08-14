import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FieldService, PlaylistService } from '../../../core/services';
import { CreatePlaylistDto, FieldDto, PlaylistDto, UpdatePlaylistDto } from '../../../core/models';

interface Playlist {
  id: number;
  title: string;
  channel: string;
  videoCount: number;
  totalDuration: string;
  thumbnail: string;
  progress: number;
  completedCount: number;
}

@Component({
  selector: 'app-playlists-page',
  templateUrl: './playlists-page.component.html',
  styleUrls: ['./playlists-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class PlaylistsPageComponent implements OnInit {
  playlists: Playlist[] = [];
  playlistDtos: PlaylistDto[] = [];
  fields: FieldDto[] = [];
  isLoading = false;
  errorMessage = '';

  showDialog = false;
  editingPlaylist: PlaylistDto | null = null;
  formTitle = '';
  formFieldId: number | null = null;
  formDescription = '';
  isSaving = false;
  formError = '';
  deleteConfirmId: number | null = null;

  constructor(
    private readonly playlistService: PlaylistService,
    private readonly fieldService: FieldService
  ) {}

  ngOnInit(): void {
    this.loadPlaylists();
    this.loadFields();
  }

  get totalVideos(): number {
    return this.playlists.reduce((sum, item) => sum + item.videoCount, 0);
  }

  get totalCompleted(): number {
    return this.playlists.reduce((sum, item) => sum + item.completedCount, 0);
  }

  loadPlaylists(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.playlistService.getPlaylists().subscribe({
      next: (playlists) => {
        this.playlistDtos = playlists;
        this.playlists = playlists.map((playlist) => this.mapPlaylist(playlist));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load playlists. Make sure the API is running on port 5083.';
        this.isLoading = false;
      }
    });
  }

  loadFields(): void {
    this.fieldService.getFields().subscribe({
      next: (fields) => {
        this.fields = fields;
        if (this.showDialog && this.formFieldId === null && fields.length > 0) {
          this.formFieldId = fields[0].id;
        }
      },
      error: () => {}
    });
  }

  openCreateDialog(): void {
    this.editingPlaylist = null;
    this.formTitle = '';
    this.formDescription = '';
    this.formFieldId = this.fields.length > 0 ? this.fields[0].id : null;
    this.formError = '';
    this.showDialog = true;
  }

  openEditDialog(playlist: PlaylistDto | null): void {
    if (!playlist) return;
    this.editingPlaylist = playlist;
    this.formTitle = playlist.title;
    this.formDescription = playlist.description ?? '';
    this.formFieldId = playlist.fieldId;
    this.formError = '';
    this.showDialog = true;
  }

  closeDialog(): void {
    if (this.isSaving) return;
    this.showDialog = false;
    this.editingPlaylist = null;
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

    const request = this.editingPlaylist
      ? this.playlistService.updatePlaylist(this.editingPlaylist.id, payload)
      : this.playlistService.createPlaylist(payload as CreatePlaylistDto);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.showDialog = false;
        this.editingPlaylist = null;
        this.loadPlaylists();
      },
      error: (err) => {
        this.formError = err.error?.message ?? 'Unable to save the playlist.';
        this.isSaving = false;
      }
    });
  }

  toggleDeleteConfirm(id: number): void {
    this.deleteConfirmId = this.deleteConfirmId === id ? null : id;
  }

  dtoById(id: number): PlaylistDto | null {
    return this.playlistDtos.find((p) => p.id === id) ?? null;
  }

  deletePlaylist(id: number): void {
    this.playlistService.deletePlaylist(id).subscribe({
      next: () => {
        this.deleteConfirmId = null;
        this.loadPlaylists();
      },
      error: () => {}
    });
  }

  private mapPlaylist(playlist: PlaylistDto): Playlist {
    const progress = playlist.totalVideos > 0
      ? Math.round((playlist.completedVideos / playlist.totalVideos) * 100)
      : 0;

    return {
      id: playlist.id,
      title: playlist.title,
      channel: playlist.channelTitle ?? 'Unknown Channel',
      videoCount: playlist.totalVideos,
      totalDuration: this.formatDuration(playlist.totalDurationSeconds),
      thumbnail: playlist.thumbnailUrl ?? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
      progress,
      completedCount: playlist.completedVideos
    };
  }

  private formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}