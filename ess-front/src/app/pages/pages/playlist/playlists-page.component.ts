import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/api.service';
import { PlaylistDto } from '../../../core/api.models';

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
  imports: [CommonModule]
})
export class PlaylistsPageComponent {
  playlists: Playlist[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private readonly api: ApiService) {
    this.loadPlaylists();
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

    this.api.getPlaylists().subscribe({
      next: (playlists) => {
        this.playlists = playlists.map((playlist) => this.mapPlaylist(playlist));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load playlists. Make sure the API is running on port 5083.';
        this.isLoading = false;
      }
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
