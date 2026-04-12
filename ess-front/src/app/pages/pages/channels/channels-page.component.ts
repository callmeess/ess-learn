import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Channel {
  id: string;
  name: string;
  handle: string;
  thumbnail: string;
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
export class ChannelsPageComponent {
  readonly channels: Channel[] = [
    {
      id: '1',
      name: 'Web Dev Simplified',
      handle: '@webdevsimplified',
      thumbnail: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200',
      subscriberCount: '1.2M',
      videoCount: 248,
      downloadedCount: 42,
      watchProgress: 35
    },
    {
      id: '2',
      name: 'TechWorld with Nana',
      handle: '@techworldwithnana',
      thumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200',
      subscriberCount: '856K',
      videoCount: 156,
      downloadedCount: 28,
      watchProgress: 45
    },
    {
      id: '3',
      name: 'freeCodeCamp.org',
      handle: '@freecodecamp',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      subscriberCount: '8.5M',
      videoCount: 1250,
      downloadedCount: 85,
      watchProgress: 12
    },
    {
      id: '4',
      name: 'Fireship',
      handle: '@fireship',
      thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      subscriberCount: '2.8M',
      videoCount: 524,
      downloadedCount: 67,
      watchProgress: 28
    }
  ];

  get avgProgress(): number {
    return Math.round(this.channels.reduce((sum, c) => sum + c.watchProgress, 0) / this.channels.length);
  }
}
