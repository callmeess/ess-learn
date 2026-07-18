import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { RoadmapListItemDto } from '../../../core/api.models';

@Component({
  selector: 'app-roadmaps-page',
  templateUrl: './roadmaps-page.component.html',
  styleUrls: ['./roadmaps-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class RoadmapsPageComponent implements OnInit {
  readonly categories: string[] = [
    'all',
    'Web Development',
    'Frontend',
    'DevOps',
    'System Design',
    'Data Science',
    'Mobile'
  ];

  roadmaps: RoadmapListItemDto[] = [];
  loading = true;

  currentSearch = '';
  currentFilter = 'all';
  createModalOpen = false;
  toastMessage = '';

  newRoadmap = {
    title: '',
    category: '',
    description: '',
    icon: '📚',
    color: '#3b82f6'
  };

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.loadRoadmaps();
  }

  loadRoadmaps(): void {
    this.api.getRoadmaps().subscribe({
      next: (data) => {
        this.roadmaps = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  progress(item: RoadmapListItemDto): number {
    return Math.round(item.progress);
  }

  get totalRoadmaps(): number {
    return this.roadmaps.length;
  }

  get inProgressCount(): number {
    return this.roadmaps.filter((r) => r.completedNodes > 0 && r.completedNodes < r.totalNodes).length;
  }

  get completedCount(): number {
    return this.roadmaps.filter((r) => r.completedNodes === r.totalNodes && r.totalNodes > 0).length;
  }

  get totalHours(): number {
    return this.roadmaps.reduce((sum, roadmap) => sum + roadmap.estimatedHours, 0);
  }

  get filteredRoadmaps(): RoadmapListItemDto[] {
    const q = this.currentSearch.trim().toLowerCase();

    return this.roadmaps.filter((roadmap) => {
      const categoryMatch = this.currentFilter === 'all' || roadmap.category === this.currentFilter;
      const searchMatch =
        !q ||
        roadmap.name.toLowerCase().includes(q) ||
        (roadmap.description && roadmap.description.toLowerCase().includes(q)) ||
        roadmap.tags.some((tag) => tag.toLowerCase().includes(q));

      return categoryMatch && searchMatch;
    });
  }

  openCreateModal(): void {
    this.createModalOpen = true;
  }

  closeCreateModal(): void {
    this.createModalOpen = false;
  }

  createRoadmap(): void {
    if (!this.newRoadmap.title.trim()) {
      this.showToast('Roadmap title is required');
      return;
    }

    this.api.createRoadmap({
      name: this.newRoadmap.title.trim(),
      description: this.newRoadmap.description.trim() || 'Custom learning path roadmap.',
      category: this.newRoadmap.category.trim() || 'Custom',
      color: this.newRoadmap.color,
      icon: this.newRoadmap.icon.trim() || '📚',
      tags: ['Custom']
    }).subscribe({
      next: (created) => {
        this.roadmaps = [created, ...this.roadmaps];
        this.newRoadmap = { title: '', category: '', description: '', icon: '📚', color: '#3b82f6' };
        this.closeCreateModal();
        this.showToast('Roadmap created!');
      },
      error: () => {
        this.showToast('Failed to create roadmap');
      }
    });
  }

  showToast(message: string): void {
    this.toastMessage = message;
    window.setTimeout(() => {
      this.toastMessage = '';
    }, 2400);
  }
}
