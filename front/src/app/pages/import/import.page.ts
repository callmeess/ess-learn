import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs';
import type { FieldDto, ImportResultDto } from '../../types';

@Component({
  selector: 'app-import-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-2xl space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Import Playlist</h1>
        <p class="text-gray-500 text-sm mt-1">Import metadata from YouTube or from an offline manifest file in the mounted volume.</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Metadata Source</label>
          <select [(ngModel)]="source" name="source" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
            <option value="youtube">Online YouTube metadata</option>
            <option value="offline">Offline manifest from mounted volume</option>
          </select>
        </div>

        <div *ngIf="source === 'youtube'">
          <label class="block text-sm font-medium text-gray-300 mb-1.5">YouTube Playlist URL</label>
          <input [(ngModel)]="url" name="url" placeholder="https://www.youtube.com/playlist?list=PL..." class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" required />
        </div>

        <div *ngIf="source === 'offline'">
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Offline Manifest Path</label>
          <input [(ngModel)]="offlineManifestPath" name="offlineManifestPath" placeholder="playlists/my-course/manifest.json" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" required />
          <p class="text-xs text-gray-500 mt-1.5">Path is relative to the API mounted volume root (default /data in Docker).</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Learning Field</label>
          <div *ngIf="!showNewField" class="flex gap-2">
            <select [(ngModel)]="fieldId" name="fieldId" class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" required>
              <option value="">Select a field...</option>
              <option *ngFor="let f of (fields$ | async)" [value]="f.id">{{ f.name }}</option>
            </select>
            <button type="button" (click)="showNewField = true" class="flex items-center gap-1.5 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-gray-200">New</button>
          </div>
          <div *ngIf="showNewField" class="flex gap-2">
            <input [(ngModel)]="newFieldName" name="newFieldName" placeholder="e.g. Machine Learning" class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
            <button type="button" (click)="createField()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Create</button>
            <button type="button" (click)="showNewField=false" class="text-gray-500 hover:text-gray-300 px-2 text-sm">Cancel</button>
          </div>
        </div>

        <button type="submit" [disabled]="importing || !fieldId || (source === 'youtube' ? !url : !offlineManifestPath)" class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ importing ? 'Importing...' : 'Import Playlist' }}
        </button>
      </form>

      <div *ngIf="result" class="bg-green-500/10 border border-green-500/30 rounded-xl p-5 flex items-start gap-3">
        <div class="w-5 h-5 text-green-400">✔️</div>
        <div>
          <p class="font-medium text-green-400">Playlist imported successfully!</p>
          <p class="text-sm text-gray-400 mt-1"><strong>{{ result.title }}</strong> — {{ result.videosImported }} videos from {{ result.channelTitle }}</p>
          <a [routerLink]="['/playlists', result.playlistId]" class="inline-block mt-3 text-sm text-indigo-400 hover:underline">Go to playlist →</a>
        </div>
      </div>

      <div *ngIf="error" class="bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-start gap-3">
        <div class="w-5 h-5 text-red-400">❌</div>
        <div>
          <p class="font-medium text-red-400">Import failed</p>
          <p class="text-sm text-gray-400 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>
  `,
})
export class ImportPage {
  fields$: Observable<FieldDto[]>;
  source: 'youtube' | 'offline' = 'youtube';
  url = '';
  offlineManifestPath = '';
  fieldId: number | '' = '';
  showNewField = false;
  newFieldName = '';
  importing = false;
  result: ImportResultDto | null = null;
  error: string | null = null;

  constructor(private api: ApiService) {
    this.fields$ = this.api.getFields();
  }

  createField() {
    if (!this.newFieldName.trim()) return;
    this.api.createField({ name: this.newFieldName.trim() }).subscribe(f => {
      this.fieldId = f.id;
      this.showNewField = false;
      this.newFieldName = '';
      this.fields$ = this.api.getFields();
    });
  }

  onSubmit() {
    if (!this.fieldId) return;
    if (this.source === 'youtube' && !this.url.trim()) return;
    if (this.source === 'offline' && !this.offlineManifestPath.trim()) return;

    this.importing = true;
    this.error = null;
    this.api.importPlaylist({ playlistUrl: this.source === 'youtube' ? this.url.trim() : undefined, fieldId: Number(this.fieldId), source: this.source, offlineManifestPath: this.source === 'offline' ? this.offlineManifestPath.trim() : undefined }).subscribe({
      next: (r) => {
        this.result = r;
        this.importing = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Something went wrong. Check the playlist URL and try again.';
        this.importing = false;
      }
    });
  }
}
