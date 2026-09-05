import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../core/services';
import { ChannelListItemDto } from '../../../core/models';

interface ChannelViewModel {
  id: number;
  title: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: number;
  downloadedCount: number;
  watchProgress: number;
}

@Component({
  selector: 'app-channels-page',
  templateUrl: './channels-page.component.html',
  styleUrls: ['./channels-page.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ChannelsPageComponent implements OnInit {
  readonly fallbackThumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';

  channels: ChannelViewModel[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly channelService: ChannelService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadChannels();
  }

  get avgProgress(): number {
    if (this.channels.length === 0) return 0;
    return Math.round(this.channels.reduce((sum, c) => sum + c.watchProgress, 0) / this.channels.length);
  }

  private loadChannels(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.channelService.getChannels().subscribe({
      next: (channels) => {
        this.channels = channels.map((c) => this.mapChannel(c));
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load channels. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  private mapChannel(c: ChannelListItemDto): ChannelViewModel {
    return {
      id: c.id,
      title: c.title,
      thumbnailUrl: c.thumbnailUrl ?? this.fallbackThumb,
      subscriberCount: this.formatCount(c.subscriberCount),
      videoCount: c.videoCount,
      downloadedCount: c.downloadedCount,
      watchProgress: this.calculateProgress(c.watchedSeconds, c.totalDurationSeconds)
    };
  }

  private calculateProgress(watchedSeconds: number, totalSeconds: number): number {
    if (totalSeconds <= 0) return 0;
    return Math.min(100, Math.round((watchedSeconds / totalSeconds) * 100));
  }

  private formatCount(count: number): string {
    if (count >= 1_000_000_000) return (count / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1_000) return (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return count.toString();
  }
}