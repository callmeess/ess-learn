import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '../../components/stat-card.component';
import { ProgressBarComponent } from '../../components/progress-bar.component';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs';
import type { DashboardDto } from '../../types';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, ProgressBarComponent],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-gray-500 text-sm mt-1">Your learning progress at a glance</p>
      </div>

      <ng-container *ngIf="dashboard$ | async as data; else loading">
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <app-stat-card label="Fields" [value]="data.totalFields">
            <span icon>📚</span>
          </app-stat-card>
          <app-stat-card label="Playlists" [value]="data.totalPlaylists">
            <span icon>🎞️</span>
          </app-stat-card>
          <app-stat-card label="Videos" [value]="data.totalVideos">
            <span icon>▶️</span>
          </app-stat-card>
          <app-stat-card label="Completed" [value]="data.completedVideos">
            <span icon>✅</span>
          </app-stat-card>
          <app-stat-card label="Watch Time" [value]="formatHours(data.watchedSeconds)" sub="of {{ formatHours(data.totalDurationSeconds) }}">
            <span icon>⏱️</span>
          </app-stat-card>
          <app-stat-card label="Progress" [value]="data.overallProgress + '%'">
            <span icon>📈</span>
          </app-stat-card>
        </div>

        <section *ngIf="data.fields?.length">
          <h2 class="text-lg font-semibold mb-4">Fields Progress</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <a *ngFor="let f of data.fields" [routerLink]="['/fields', f.id]" class="block bg-gray-900 border border-gray-800 rounded-xl p-4 hover:bg-gray-800 transition-colors">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full" [ngStyle]="{ backgroundColor: f.color }"></div>
                  <div class="font-medium">{{ f.name }}</div>
                </div>
                <div class="text-sm text-gray-400">{{ f.progress }}%</div>
              </div>
              <app-progress-bar [value]="f.progress" size="sm"></app-progress-bar>
            </a>
          </div>
        </section>
      </ng-container>

      <ng-template #loading>
        <div class="animate-pulse space-y-4">
          <div class="h-6 bg-gray-900 rounded" style="width: 40%"></div>
          <div class="grid grid-cols-3 gap-4">
            <div class="h-24 bg-gray-900 rounded"></div>
            <div class="h-24 bg-gray-900 rounded"></div>
            <div class="h-24 bg-gray-900 rounded"></div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
})
export class DashboardPage {
  dashboard$: Observable<DashboardDto>;
  constructor(private api: ApiService) {
    this.dashboard$ = this.api.getDashboard();
  }

  formatHours(s: number) {
    const hours = s / 3600;
    if (hours < 1) return `${Math.round(s / 60)}m`;
    return `${hours.toFixed(1)}h`;
  }
}
