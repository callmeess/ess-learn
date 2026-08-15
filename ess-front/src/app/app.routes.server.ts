import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'videos/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'watch/:videoId',
    renderMode: RenderMode.Client
  },
  {
    path: 'roadmaps/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'playlists/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'reading/:id',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
