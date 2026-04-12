import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppShellComponent } from './app-shell.component';
import { VideosPageComponent } from './pages/videos/videos-page.component';
import { PlaylistsPageComponent } from './pages/playlist/playlists-page.component';
import { ChannelsPageComponent } from './pages/channels/channels-page.component';
import { DownloadsPageComponent } from './pages/downloads/downloads-page.component';
import { AnalyticsPageComponent } from './pages/analytics/analytics-page.component';
import { SchedulePageComponent } from './pages/schedule/schedule-page.component';
import { RoadmapsPageComponent } from './pages/roadmap/roadmaps-page.component';
import { RoadmapDetailPageComponent } from './pages/roadmap-details/roadmap-detail-page.component';
import { VideoDetailPageComponent } from './pages/video-details/video-detail-page.component';
import { AccountPageComponent } from './pages/account/account-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';

const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', component: VideosPageComponent },
      { path: 'videos/:id', component: VideoDetailPageComponent },
      { path: 'playlists', component: PlaylistsPageComponent },
      { path: 'channels', component: ChannelsPageComponent },
      { path: 'downloads', component: DownloadsPageComponent },
      { path: 'analytics', component: AnalyticsPageComponent },
      { path: 'schedule', component: SchedulePageComponent },
      { path: 'roadmaps', component: RoadmapsPageComponent },
      { path: 'roadmaps/:id', component: RoadmapDetailPageComponent },
      { path: 'reading', redirectTo: 'roadmaps', pathMatch: 'full' },
      { path: 'reading/:id', redirectTo: 'roadmaps/:id', pathMatch: 'full' },
      { path: 'account', component: AccountPageComponent }
    ]
  },
  { path: '404', component: NotFoundPageComponent },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
