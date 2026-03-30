import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Observable, switchMap } from 'rxjs';
import type { PlaylistDetailDto, VideoDto } from '../../types';
import { ProgressBarComponent } from '../../components/progress-bar.component';
import { VideoStatus } from '../../types/enums';

@Component({
  selector: 'app-playlist-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ProgressBarComponent],
  template: `
    <div class="space-y-6">
      <ng-container *ngIf="playlist$ | async as data; else loading">
        <div class="flex items-start gap-4">
          <a [routerLink]="['/fields', data.playlist.fieldId]" class="text-gray-500 hover:text-gray-300 mt-1">←</a>
          <div class="flex-1">
            <h1 class="text-2xl font-bold">{{ data.playlist.title }}</h1>
            <p *ngIf="data.playlist.channelTitle" class="text-sm text-gray-500 mt-0.5">{{ data.playlist.channelTitle }}</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-sm text-gray-400">{{ data.playlist.completedVideos }}/{{ data.playlist.totalVideos }} completed</span>
              <span class="text-sm text-gray-600">·</span>
              <span class="text-sm text-gray-400">{{ pct(data.playlist.completedVideos, data.playlist.totalVideos) }}%</span>
            </div>
            <div class="mt-2 max-w-md"><app-progress-bar [value]="pct(data.playlist.completedVideos, data.playlist.totalVideos)" size="md"></app-progress-bar></div>
          </div>
        </div>

        <div class="flex gap-6">
          <div class="flex-1">
            <div *ngIf="activeVideo; else selectPlaceholder">
              <div class="aspect-video bg-black rounded-xl overflow-hidden">
                <iframe [src]="videoEmbedUrl(activeVideo)" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
              </div>
              <div class="mt-2 flex items-center gap-2">
                <button class="bg-indigo-600 text-white px-3 py-1 rounded" (click)="markCompleted(activeVideo)">Mark completed</button>
              </div>
            </div>
            <ng-template #selectPlaceholder>
              <div class="aspect-video bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center">
                <div class="text-center">
                  <div class="w-12 h-12 text-gray-700 mx-auto mb-2">▶️</div>
                  <p class="text-gray-500 text-sm">Select a video to start watching</p>
                </div>
              </div>
            </ng-template>
          </div>

          <div class="w-80 flex-shrink-0 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
            <button *ngFor="let v of data.videos; let i = index" (click)="selectVideo(v)" [class]="'w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ' + (activeVideo?.id===v.id ? 'bg-indigo-500/15 border border-indigo-500/30' : 'hover:bg-gray-900 border border-transparent')">
              <span class="text-xs text-gray-600 mt-1 w-5 text-right flex-shrink-0">{{ i + 1 }}</span>
              <div class="relative flex-shrink-0">
                <img *ngIf="v.thumbnailUrl" [src]="v.thumbnailUrl" alt="" class="w-24 h-14 rounded object-cover" />
                <span class="absolute bottom-0.5 right-0.5 bg-black/80 text-[10px] px-1 rounded">{{ formatDuration(v.durationSeconds) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-medium leading-tight line-clamp-2">{{ v.title }}</div>
                <div class="flex items-center gap-1.5 mt-1">
                  <span *ngIf="v.status === 2" class="text-green-400">✔️</span>
                  <span *ngIf="v.status === 1" class="text-indigo-400">▶️</span>
                  <span class="text-[10px] text-gray-500">{{ v.status === 2 ? 'Completed' : v.watchedSeconds > 0 ? formatDuration(v.watchedSeconds) : '' }}</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </ng-container>

      <ng-template #loading>
        <div class="animate-pulse h-96 bg-gray-900 rounded-xl"></div>
      </ng-template>
    </div>
  `,
})
export class PlaylistPage {
  playlist$: Observable<PlaylistDetailDto> | undefined;
  activeVideo: VideoDto | null = null;

  constructor(private route: ActivatedRoute, private api: ApiService) {
    this.playlist$ = this.route.paramMap.pipe(switchMap(p => this.api.getPlaylist(Number(p.get('id')))));
  }

  selectVideo(v: VideoDto) {
    this.activeVideo = v;
  }

  videoEmbedUrl(v: VideoDto) {
    const id = v.youtubeVideoId;
    if (id) return `https://www.youtube.com/embed/${id}`;
    return v.url || '';
  }

  markCompleted(v: VideoDto) {
    this.api.updateProgress(v.id, { watchedSeconds: v.durationSeconds, status: VideoStatus.Completed }).subscribe(() => {
      // refresh playlist
      this.route.paramMap.pipe(switchMap(p => this.api.getPlaylist(Number(p.get('id'))))).subscribe(p => (this.activeVideo = p.videos.find(x => x.id === v.id) ?? null));
    });
  }

  formatDuration(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  pct(completed: number, total: number) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }
}
