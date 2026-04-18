import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/api.service';
import { DashboardDto } from '../../../core/api.models';

interface TopicData {
  topic: string;
  hours: number;
  videos: number;
}

import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AnalyticsPageComponent {
  timeRange = 'all';
  isLoading = false;
  errorMessage = '';
  dashboard?: DashboardDto;

  constructor(private readonly api: ApiService) {
    this.loadDashboard();
  }

  get topicData(): TopicData[] {
    if (!this.dashboard) {
      return [];
    }

    return this.dashboard.fields.map((field) => ({
      topic: field.name,
      hours: this.averageHoursByVideos(field.videoCount, this.dashboard?.watchedSeconds ?? 0, this.dashboard?.totalVideos ?? 0),
      videos: field.videoCount
    }));
  }

  get totalHours(): number {
    return (this.dashboard?.watchedSeconds ?? 0) / 3600;
  }

  get totalVideos(): number {
    return this.dashboard?.totalVideos ?? 0;
  }

  get completedVideos(): number {
    return this.dashboard?.completedVideos ?? 0;
  }

  get averageDurationHours(): number {
    const totalVideos = this.dashboard?.totalVideos ?? 0;
    if (totalVideos === 0) {
      return 0;
    }

    return (this.dashboard?.totalDurationSeconds ?? 0) / totalVideos / 3600;
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.api.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load analytics. Make sure the API is running on port 5083.';
        this.isLoading = false;
      }
    });
  }

  private averageHoursByVideos(fieldVideos: number, watchedSeconds: number, totalVideos: number): number {
    if (fieldVideos === 0 || totalVideos === 0) {
      return 0;
    }

    const estimatedSeconds = (fieldVideos / totalVideos) * watchedSeconds;
    return estimatedSeconds / 3600;
  }
}
