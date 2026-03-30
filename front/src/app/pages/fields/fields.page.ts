import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ProgressBarComponent } from '../../components/progress-bar.component';
import { Observable, Subject, switchMap, startWith } from 'rxjs';
import type { FieldDto } from '../../types';

@Component({
  selector: 'app-fields-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProgressBarComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Learning Fields</h1>
          <p class="text-gray-500 text-sm mt-1">Organize your playlists by topic</p>
        </div>
        <button (click)="toggleCreate()" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          New Field
        </button>
      </div>

      <form *ngIf="showCreate" (ngSubmit)="onCreate()" class="flex items-end gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div class="flex-1">
          <label class="block text-xs text-gray-500 mb-1">Name</label>
          <input [(ngModel)]="name" name="name" placeholder="e.g. Machine Learning" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Color</label>
          <input type="color" [(ngModel)]="color" name="color" class="w-10 h-9 rounded cursor-pointer bg-transparent" />
        </div>
        <button type="submit" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Create</button>
      </form>

      <ng-container *ngIf="fields$ | async as fields; else loading">
        <div *ngIf="fields.length === 0 && !showCreate" class="text-center py-20">
          <div class="w-12 h-12 text-gray-700 mx-auto mb-4">📁</div>
          <h2 class="text-lg font-medium text-gray-400">No fields yet</h2>
          <p class="text-sm text-gray-600">Create a field to start organizing your playlists.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <a *ngFor="let f of fields" [routerLink]="['/fields', f.id]" class="group bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full" [ngStyle]="{ backgroundColor: f.color }"></div>
                <span class="font-semibold">{{ f.name }}</span>
              </div>
              <button (click)="onDelete(f.id, $event)" class="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1">🗑️</button>
            </div>
            <div class="grid grid-cols-3 gap-3 text-center mb-4">
              <div>
                <div class="text-lg font-bold">{{ f.playlistCount }}</div>
                <div class="text-xs text-gray-500">Playlists</div>
              </div>
              <div>
                <div class="text-lg font-bold">{{ f.videoCount }}</div>
                <div class="text-xs text-gray-500">Videos</div>
              </div>
              <div>
                <div class="text-lg font-bold">{{ formatHours(f.totalDurationSeconds) }}</div>
                <div class="text-xs text-gray-500">Duration</div>
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>{{ f.completedVideos }}/{{ f.videoCount }} completed</span>
              <span>{{ pct(f.completedVideos, f.videoCount) }}%</span>
            </div>
            <app-progress-bar [value]="pct(f.completedVideos, f.videoCount)" [color]="f.color" size="md"></app-progress-bar>
          </a>
        </div>
      </ng-container>

      <ng-template #loading>
        <div class="animate-pulse space-y-4">
          <div class="h-20 bg-gray-900 rounded-xl" *ngFor="let i of [1,2,3]"></div>
        </div>
      </ng-template>
    </div>
  `,
})
export class FieldsPage {
  fields$: Observable<FieldDto[]>;
  showCreate = false;
  name = '';
  color = '#6366f1';

  private refresh$ = new Subject<void>();

  constructor(private api: ApiService) {
    this.fields$ = this.refresh$.pipe(startWith(void 0), switchMap(() => this.api.getFields()));
  }

  toggleCreate() {
    this.showCreate = !this.showCreate;
  }

  onCreate() {
    if (!this.name.trim()) return;
    this.api.createField({ name: this.name.trim(), color: this.color }).subscribe(() => {
      this.name = '';
      this.showCreate = false;
      this.refresh$.next();
    });
  }

  onDelete(id: number, event: Event) {
    event.preventDefault();
    if (!confirm('Delete this field?')) return;
    this.api.deleteField(id).subscribe(() => this.refresh$.next());
  }

  pct(completed: number, total: number) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  formatHours(s: number) {
    const hours = s / 3600;
    if (hours < 1) return `${Math.round(s / 60)}m`;
    return `${hours.toFixed(1)}h`;
  }
}
