import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppShellComponent } from './app-shell.component';
import { VideosPageComponent } from './pages/videos/videos-page.component';
import { PlaylistsPageComponent } from './pages/playlist/playlists-page.component';
import { ChannelsPageComponent } from './pages/channels/channels-page.component';
import { DownloadsPageComponent } from './pages/downloads/downloads-page.component';
import { AnalyticsPageComponent } from './pages/analytics/analytics-page.component';
import { SchedulePageComponent } from './pages/schedule/schedule-page.component';
import { RoadmapsPageComponent } from './pages/roadmap/roadmaps-page.component';
import { RoadmapDetailPageComponent } from './pages/roadmap-details/roadmap-detail-page.component';
import { ReadingPageComponent } from './pages/reading/reading-page.component';
import { ReadingDetailPageComponent } from './pages/reading-detail/reading-detail-page.component';
import { VideoDetailPageComponent } from './pages/video-details/video-detail-page.component';
import { AccountPageComponent } from './pages/account/account-page.component';
import { PlaceholderPageComponent } from './pages/placeholder-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';

@NgModule({
  declarations: [
    AppComponent,
    AppShellComponent,
    VideosPageComponent,
    PlaylistsPageComponent,
    ChannelsPageComponent,
    DownloadsPageComponent,
    AnalyticsPageComponent,
    SchedulePageComponent,
    RoadmapsPageComponent,
    RoadmapDetailPageComponent,
    ReadingPageComponent,
    ReadingDetailPageComponent,
    VideoDetailPageComponent,
    AccountPageComponent,
    PlaceholderPageComponent,
    NotFoundPageComponent
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule, RouterModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
