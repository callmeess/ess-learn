import { Component } from '@angular/core';
import { SearchStateService } from './search-state.service';

interface NavItem {
  path: string;
  label: string;
}

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.css'],
  standalone: false
})
export class AppShellComponent {
  searchQuery = '';
  isMobileMenuOpen = false;

  readonly navItems: NavItem[] = [
    { path: '/roadmaps', label: 'Roadmaps' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/channels', label: 'Channels' },
    { path: '/playlists', label: 'Playlists' },
    { path: '/', label: 'Videos' },
    { path: '/downloads', label: 'Downloads' }
  ];

  constructor(private readonly searchState: SearchStateService) {}

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchState.setQuery(query);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
