import { Routes } from '@angular/router';
import { AppShellComponent } from './app-shell.component';
import { AccountPageComponent } from './pages/pages/account/account';
import { AnalyticsPageComponent } from './pages/pages/analytics/analytics';
import { ChannelsPageComponent } from './pages/pages/channels/channels-page.component';
import { DownloadsPageComponent } from './pages/pages/downloads/downloads-page.component';
import { NotFoundPageComponent } from './pages/pages/not-found/not-found-page.component';
import { PlaylistsPageComponent } from './pages/pages/playlist/playlists-page.component';
import { ReadingDetailPageComponent } from './pages/pages/reading-detail/reading-detail-page.component';
import { ReadingPageComponent } from './pages/pages/reading/reading-page.component';
import { RoadmapDetailPageComponent } from './pages/pages/roadmap-details/roadmap-detail-page.component';
import { RoadmapsPageComponent } from './pages/pages/roadmap/roadmaps-page.component';
import { SchedulePageComponent } from './pages/pages/schedule/schedule-page.component';
import { VideoDetailPageComponent } from './pages/pages/video-detail/video-detail-page.component';
import { VideosPageComponent } from './pages/pages/videos/videos-page.component';

export const routes: Routes = [
	{
		path: '',
		component: AppShellComponent,
		children: [
			{ path: '', component: VideosPageComponent, pathMatch: 'full' },
			{ path: 'videos/:id', component: VideoDetailPageComponent },
			{ path: 'roadmaps', component: RoadmapsPageComponent },
			{ path: 'roadmaps/:id', component: RoadmapDetailPageComponent },
			{ path: 'schedule', component: SchedulePageComponent },
			{ path: 'analytics', component: AnalyticsPageComponent },
			{ path: 'channels', component: ChannelsPageComponent },
			{ path: 'playlists', component: PlaylistsPageComponent },
			{ path: 'downloads', component: DownloadsPageComponent },
			{ path: 'reading', component: ReadingPageComponent },
			{ path: 'reading/:id', component: ReadingDetailPageComponent },
			{ path: 'account', component: AccountPageComponent },
			{ path: '**', component: NotFoundPageComponent }
		]
	}
];
