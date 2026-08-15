import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchStateService } from './search-state.service';
import { FieldService, ImportService, PlaylistService } from './core/services';
import { FieldDto, ImportResultDto, PlaylistDto } from './core/models';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
}

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class AppShellComponent implements OnInit {
  searchQuery = '';
  isMobileMenuOpen = false;

  showImportDialog = false;
  importUrl = '';
  importFieldId: number | null = null;
  importType: 'video' | 'playlist' | null = null;
  isImporting = false;
  importResult: ImportResultDto | null = null;
  importError = '';

  fields: FieldDto[] = [];
  playlists: PlaylistDto[] = [];
  importPlaylistId: number | null = null;

  showAddField = false;
  newFieldName = '';
  isCreatingField = false;

  readonly navItems: NavItem[] = [
    { path: '/roadmaps', label: 'Roadmaps' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/channels', label: 'Channels' },
    { path: '/playlists', label: 'Playlists' },
    { path: '/', label: 'Videos' },
    { path: '/downloads', label: 'Downloads' }
  ];

  constructor(
    private readonly searchState: SearchStateService,
    private readonly fieldService: FieldService,
    private readonly playlistService: PlaylistService,
    private readonly importService: ImportService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFields();
  }

  loadFields(): void {
    this.fieldService.getFields().subscribe({
      next: (fields) => {
        this.fields = fields;
        if (this.showImportDialog && this.importFieldId === null && fields.length > 0) {
          this.importFieldId = fields[0].id;
          this.loadPlaylists();
        }
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  loadPlaylists(): void {
    if (!this.importFieldId) {
      this.playlists = [];
      return;
    }

    this.playlistService.getPlaylists(this.importFieldId).subscribe({
      next: (playlists) => {
        this.playlists = playlists;
        this.cdr.markForCheck();
      },
      error: () => {
        this.playlists = [];
        this.cdr.markForCheck();
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchState.setQuery(query);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  openImportDialog(): void {
    this.showImportDialog = true;
    this.importUrl = '';
    this.importFieldId = this.fields.length > 0 ? this.fields[0].id : null;
    this.importType = null;
    this.importResult = null;
    this.importError = '';
    this.showAddField = false;
    this.newFieldName = '';
    this.importPlaylistId = null;
    this.loadPlaylists();
  }

  closeImportDialog(): void {
    this.showImportDialog = false;
  }

  onImportUrlChange(url: string): void {
    this.importUrl = url;
    this.importType = this.detectImportType(url);
    if (this.importType === 'playlist') {
      this.importPlaylistId = null;
    }
  }

  onFieldChange(fieldId: number): void {
    this.importFieldId = fieldId;
    this.importPlaylistId = null;
    this.loadPlaylists();
  }

  private detectImportType(url: string): 'video' | 'playlist' | null {
    if (url.includes('list=')) return 'playlist';
    if (url.includes('watch?v=') || url.includes('youtu.be/')) return 'video';
    return null;
  }

  toggleAddField(): void {
    this.showAddField = !this.showAddField;
    this.newFieldName = '';
  }

  createField(): void {
    if (!this.newFieldName.trim() || this.isCreatingField) return;

    this.isCreatingField = true;
    this.fieldService.createField({ name: this.newFieldName.trim() }).subscribe({
      next: (field) => {
        this.fields = [...this.fields, field];
        this.importFieldId = field.id;
        this.newFieldName = '';
        this.showAddField = false;
        this.isCreatingField = false;
        this.loadPlaylists();
        this.cdr.markForCheck();
      },
      error: () => {
        this.isCreatingField = false;
        this.cdr.markForCheck();
      }
    });
  }

  submitImport(): void {
    if (!this.importUrl.trim() || !this.importFieldId || this.isImporting) return;

    this.isImporting = true;
    this.importResult = null;
    this.importError = '';

    const type = this.importType ?? 'video';

    const request = type === 'playlist'
      ? this.importService.importPlaylist({ playlistUrl: this.importUrl.trim(), fieldId: this.importFieldId })
      : this.importService.importVideo({
          videoUrl: this.importUrl.trim(),
          fieldId: this.importFieldId,
          ...(this.importPlaylistId ? { playlistId: this.importPlaylistId } : {})
        });

    request.subscribe({
      next: (result) => {
        this.importResult = result;
        this.isImporting = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.importError = err.error?.message ?? 'Import failed. Please check the URL and try again.';
        this.isImporting = false;
        this.cdr.markForCheck();
      }
    });
  }
}
