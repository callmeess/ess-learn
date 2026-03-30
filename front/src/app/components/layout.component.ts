import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="flex h-screen bg-gray-950 text-gray-100">
      <!-- Sidebar -->
      <aside class="w-60 border-r border-gray-800 flex flex-col">
        <div class="p-5 border-b border-gray-800">
          <div class="flex items-center gap-2">
            <span class="text-lg font-bold tracking-tight">EssLearn</span>
          </div>
        </div>
        <nav class="flex-1 p-3 space-y-1">
          <a routerLink="/" routerLinkActive="active" class="nav-link">Dashboard</a>
          <a routerLink="/fields" routerLinkActive="active" class="nav-link">Fields</a>
          <a routerLink="/import" routerLinkActive="active" class="nav-link">Import</a>
        </nav>
      </aside>
      <main class="flex-1 p-8 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #a1a1aa;
      transition: color 0.2s, background 0.2s;
      text-decoration: none;
    }
    .nav-link.active {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
    }
    .nav-link:hover {
      color: #e5e7eb;
      background: rgba(31, 41, 55, 0.5);
    }
  `],
})
export class LayoutComponent {}
