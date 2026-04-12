import { Component } from '@angular/core';

type DownloadStatus = 'downloading' | 'completed' | 'paused' | 'failed' | 'queued';

interface DownloadItem {
  id: string;
  title: string;
  channel: string;
  progress: number;
  size: string;
  totalSize: string;
  speed: string;
  eta: string;
  status: DownloadStatus;
}

@Component({
  selector: 'app-downloads-page',
  templateUrl: './downloads-page.component.html',
  styleUrls: ['./downloads-page.component.css'],
  standalone: false
})
export class DownloadsPageComponent {
  tab: 'active' | 'completed' = 'active';

  readonly activeDownloads: DownloadItem[] = [
    {
      id: '1',
      title: 'Advanced React Hooks Deep Dive',
      channel: 'Web Dev Simplified',
      progress: 67,
      size: '420 MB',
      totalSize: '625 MB',
      speed: '5.2 MB/s',
      eta: '00:39',
      status: 'downloading'
    },
    {
      id: '2',
      title: 'System Design Fundamentals',
      channel: 'Gaurav Sen',
      progress: 45,
      size: '285 MB',
      totalSize: '635 MB',
      speed: '-',
      eta: '-',
      status: 'paused'
    },
    {
      id: '3',
      title: 'TypeScript 5.0 New Features',
      channel: 'Matt Pocock',
      progress: 23,
      size: '145 MB',
      totalSize: '630 MB',
      speed: '-',
      eta: '-',
      status: 'failed'
    },
    {
      id: '4',
      title: 'Database Indexing Strategies',
      channel: 'Hussein Nasser',
      progress: 0,
      size: '0 MB',
      totalSize: '890 MB',
      speed: '-',
      eta: '-',
      status: 'queued'
    }
  ];

  readonly completedDownloads: DownloadItem[] = [
    {
      id: 'c1',
      title: 'Kubernetes for Beginners',
      channel: 'TechWorld with Nana',
      progress: 100,
      size: '1.5 GB',
      totalSize: '1.5 GB',
      speed: '-',
      eta: '-',
      status: 'completed'
    },
    {
      id: 'c2',
      title: 'React Server Components Explained',
      channel: 'Fireship',
      progress: 100,
      size: '425 MB',
      totalSize: '425 MB',
      speed: '-',
      eta: '-',
      status: 'completed'
    }
  ];

  get activeCount(): number {
    return this.activeDownloads.filter((item) => item.status === 'downloading' || item.status === 'queued').length;
  }

  get pausedCount(): number {
    return this.activeDownloads.filter((item) => item.status === 'paused').length;
  }

  get failedCount(): number {
    return this.activeDownloads.filter((item) => item.status === 'failed').length;
  }

  statusClass(status: DownloadStatus): string {
    return `status ${status}`;
  }
}
