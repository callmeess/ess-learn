import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./components/layout.component').then(m => m.LayoutComponent),
		children: [
			{
				path: '',
				loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
				pathMatch: 'full',
			},
			{
				path: 'fields',
				loadComponent: () => import('./pages/fields/fields.page').then(m => m.FieldsPage),
			},
			{
				path: 'fields/:id',
				loadComponent: () => import('./pages/field-detail/field-detail.page').then(m => m.FieldDetailPage),
			},
			{
				path: 'playlists/:id',
				loadComponent: () => import('./pages/playlist/playlist.page').then(m => m.PlaylistPage),
			},
			{
				path: 'import',
				loadComponent: () => import('./pages/import/import.page').then(m => m.ImportPage),
			},
		],
	},
];
