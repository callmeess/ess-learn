import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ScheduledItem {
  id: string;
  title: string;
  date: string;
  status: 'scheduled' | 'completed' | 'missed';
}

@Component({
  selector: 'app-schedule-page',
  templateUrl: './schedule-page.component.html',
  styleUrls: ['./schedule-page.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SchedulePageComponent {
  viewMode: 'calendar' | 'list' = 'calendar';

  readonly schedule: ScheduledItem[] = [
    { id: '1', title: 'React Hooks Deep Dive', date: '2026-03-08', status: 'completed' },
    { id: '2', title: 'TypeScript Advanced Types', date: '2026-03-09', status: 'scheduled' },
    { id: '3', title: 'System Design Basics', date: '2026-03-10', status: 'scheduled' },
    { id: '4', title: 'Database Indexing', date: '2026-03-06', status: 'missed' }
  ];

  get scheduledCount(): number {
    return this.schedule.filter((i) => i.status === 'scheduled').length;
  }

  get completedCount(): number {
    return this.schedule.filter((i) => i.status === 'completed').length;
  }

  get missedCount(): number {
    return this.schedule.filter((i) => i.status === 'missed').length;
  }
}
