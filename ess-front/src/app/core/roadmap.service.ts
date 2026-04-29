import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  RoadmapDto,
  RoadmapDetailDto,
  RoadmapNodeDto,
  CreateRoadmapDto,
  UpdateRoadmapDto,
  AddPlaylistToRoadmapDto,
  UpdateRoadmapNodeDto
} from './api.models';

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {
  private readonly roadmapsSubject = new BehaviorSubject<RoadmapDto[]>([]);
  private readonly selectedRoadmapSubject = new BehaviorSubject<RoadmapDetailDto | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly roadmaps$: Observable<RoadmapDto[]> = this.roadmapsSubject.asObservable();
  readonly selectedRoadmap$: Observable<RoadmapDetailDto | null> = this.selectedRoadmapSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<string | null> = this.errorSubject.asObservable();

  constructor(private readonly apiService: ApiService) {}

  /**
   * Load all roadmaps
   */
  loadRoadmaps(): Observable<RoadmapDto[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.getRoadmaps().pipe(
      tap(
        (roadmaps) => {
          this.roadmapsSubject.next(roadmaps);
          this.loadingSubject.next(false);
        },
        (error) => {
          this.errorSubject.next(error?.message || 'Failed to load roadmaps');
          this.loadingSubject.next(false);
        }
      )
    );
  }

  /**
   * Load a specific roadmap with all its nodes
   */
  loadRoadmap(id: number): Observable<RoadmapDetailDto> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.getRoadmap(id).pipe(
      tap(
        (roadmap) => {
          this.selectedRoadmapSubject.next(roadmap);
          this.loadingSubject.next(false);
        },
        (error) => {
          this.errorSubject.next(error?.message || 'Failed to load roadmap');
          this.loadingSubject.next(false);
        }
      )
    );
  }

  /**
   * Create a new roadmap
   */
  createRoadmap(dto: CreateRoadmapDto): Observable<RoadmapDto> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.createRoadmap(dto).pipe(
      tap(
        (roadmap) => {
          const currentRoadmaps = this.roadmapsSubject.value;
          this.roadmapsSubject.next([roadmap, ...currentRoadmaps]);
          this.loadingSubject.next(false);
        },
        (error) => {
          this.errorSubject.next(error?.message || 'Failed to create roadmap');
          this.loadingSubject.next(false);
        }
      )
    );
  }

  /**
   * Update an existing roadmap
   */
  updateRoadmap(id: number, dto: UpdateRoadmapDto): Observable<RoadmapDto> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.updateRoadmap(id, dto).pipe(
      tap(
        (updatedRoadmap) => {
          // Update in roadmaps list
          const roadmaps = this.roadmapsSubject.value.map((r) =>
            r.id === id ? updatedRoadmap : r
          );
          this.roadmapsSubject.next(roadmaps);

          // Update selected roadmap if it's the same
          const selected = this.selectedRoadmapSubject.value;
          if (selected && selected.id === id) {
            this.selectedRoadmapSubject.next({
              ...selected,
              name: updatedRoadmap.name,
              description: updatedRoadmap.description,
              iconUrl: updatedRoadmap.iconUrl,
              updatedAt: updatedRoadmap.updatedAt
            });
          }

          this.loadingSubject.next(false);
        },
        (error) => {
          this.errorSubject.next(error?.message || 'Failed to update roadmap');
          this.loadingSubject.next(false);
        }
      )
    );
  }

  /**
   * Delete a roadmap
   */
  deleteRoadmap(id: number): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.deleteRoadmap(id).pipe(
      tap(
        () => {
          // Remove from roadmaps list
          const roadmaps = this.roadmapsSubject.value.filter((r) => r.id !== id);
          this.roadmapsSubject.next(roadmaps);

          // Clear selected if it's the one being deleted
          if (this.selectedRoadmapSubject.value?.id === id) {
            this.selectedRoadmapSubject.next(null);
          }

          this.loadingSubject.next(false);
        },
        (error) => {
          this.errorSubject.next(error?.message || 'Failed to delete roadmap');
          this.loadingSubject.next(false);
        }
      )
    );
  }

  /**
   * Add a playlist to a roadmap
   */
  addPlaylistToRoadmap(
    roadmapId: number,
    dto: AddPlaylistToRoadmapDto
  ): Observable<RoadmapNodeDto> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.addPlaylistToRoadmap(roadmapId, dto).pipe(
      tap(
        (node) => {
          // Reload the roadmap to reflect the new node
          this.loadRoadmap(roadmapId).subscribe();
          this.loadingSubject.next(false);
        },
        (error) => {
          this.errorSubject.next(error?.message || 'Failed to add playlist');
          this.loadingSubject.next(false);
        }
      )
    );
  }

  /**
   * Update a roadmap node
   */
  updateRoadmapNode(nodeId: number, dto: UpdateRoadmapNodeDto): Observable<RoadmapNodeDto> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.updateRoadmapNode(nodeId, dto).pipe(
      tap(
        () => {
          this.loadingSubject.next(false);
        },
        (error) => {
          this.errorSubject.next(error?.message || 'Failed to update node');
          this.loadingSubject.next(false);
        }
      )
    );
  }

  /**
   * Remove a roadmap node
   */
  removeRoadmapNode(nodeId: number): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.removeRoadmapNode(nodeId).pipe(
      tap(
        () => {
          this.loadingSubject.next(false);
        },
        (error) => {
          this.errorSubject.next(error?.message || 'Failed to remove node');
          this.loadingSubject.next(false);
        }
      )
    );
  }

  /**
   * Get current roadmaps value
   */
  getRoadmapsList(): RoadmapDto[] {
    return this.roadmapsSubject.value;
  }

  /**
   * Get current selected roadmap value
   */
  getSelectedRoadmap(): RoadmapDetailDto | null {
    return this.selectedRoadmapSubject.value;
  }

  /**
   * Clear selected roadmap
   */
  clearSelectedRoadmap(): void {
    this.selectedRoadmapSubject.next(null);
  }

  /**
   * Clear all errors
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}
