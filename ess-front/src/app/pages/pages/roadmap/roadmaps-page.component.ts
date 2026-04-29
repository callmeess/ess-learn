import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RoadmapService } from '../../../core/roadmap.service';
import { CreateRoadmapDto, RoadmapDto } from '../../../core/api.models';



@Component({
  selector: 'app-roadmaps-page',
  templateUrl: './roadmaps-page.component.html',
  styleUrls: ['./roadmaps-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class RoadmapsPageComponent implements OnInit, OnDestroy {
  showCreateForm = false;
  searchQuery = '';
  sortBy: 'recent' | 'name' = 'recent';


  newRoadmap: CreateRoadmapDto = {
    name: '',
    description: ''
  };

  private destroy$ = new Subject<void>();

  constructor(
    private roadmapService: RoadmapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoadmaps();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoadmaps(): void {
    this.roadmapService
      .loadRoadmaps()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  openCreateForm(): void {
    this.showCreateForm = true;
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.resetForm();
  }

  createRoadmap(): void {
    if (!this.newRoadmap.name.trim()) {
      return;
    }

    this.roadmapService
      .createRoadmap(this.newRoadmap)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.closeCreateForm();
      });
  }

  deleteRoadmap(id: number): void {
    if (confirm('Are you sure you want to delete this roadmap?')) {
      this.roadmapService
        .deleteRoadmap(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  viewRoadmap(id: number): void {
    this.router.navigate(['/roadmap-details', id]);
  }

  resetForm(): void {
    this.newRoadmap = {
      name: '',
      description: ''
    };
  }

  getFilteredRoadmaps(roadmaps: RoadmapDto[]): RoadmapDto[] {
    let filtered = roadmaps;

    if (this.searchQuery.trim()) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.sortBy === 'name') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return filtered;
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return '#10b981';
    if (progress >= 50) return '#f59e0b';
    if (progress >= 25) return '#f97316';
    return '#ef4444';
  }

  clearError(): void {
    this.roadmapService.clearError();
  }
}
