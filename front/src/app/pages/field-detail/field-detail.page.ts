import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Observable, switchMap } from 'rxjs';
import type { FieldDto, PlaylistDto } from '../../types';

@Component({
  selector: 'app-field-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <a [routerLink]="['/fields']" class="text-gray-500 hover:text-gray-300">←</a>
        <div class="flex items-center gap-3">
          <div *ngIf="field$ | async as field">
            <div class="w-3 h-3 rounded-full" [ngStyle]="{ backgroundColor: field.color }"></div>
          </div>
          <h1 class="text-2xl font-bold">{{ (field$ | async)?.name ?? 'Field' }}</h1>
        </div>
      </div>

      <ng-container *ngIf="playlists$ | async as playlists; else loading">
        <div *ngIf="playlists.length === 0" class="text-center py-16">
          <div class="w-12 h-12 text-gray-700 mx-auto mb-4">🎞️</div>
          <h2 class="text-lg font-medium text-gray-400">No playlists yet</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a *ngFor="let p of playlists" [routerLink]="['/playlists', p.id]" class="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-semibold">{{ p.title }}</div>
                <div class="text-xs text-gray-500">{{ p.channelTitle }}</div>
              </div>
              <div class="text-sm text-gray-400">{{ p.totalVideos }} videos</div>
            </div>
          </a>
        </div>
      </ng-container>

      <ng-template #loading>
        <div class="animate-pulse h-40 bg-gray-900 rounded-xl"></div>
      </ng-template>
    </div>
  `,
})
export class FieldDetailPage {
  field$: Observable<FieldDto> | undefined;
  playlists$: Observable<PlaylistDto[]> | undefined;

  constructor(private route: ActivatedRoute, private api: ApiService) {
    this.field$ = this.route.paramMap.pipe(switchMap(p => this.api.getField(Number(p.get('id')))));
    this.playlists$ = this.route.paramMap.pipe(switchMap(p => this.api.getPlaylists(Number(p.get('id')))));
  }
}
