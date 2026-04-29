import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RoadmapService } from '../../../core/roadmap.service';
import { RoadmapNodeDto, AddPlaylistToRoadmapDto } from '../../../core/api.models';
import { RoadmapDetailUpdate } from './roadmap-detail-update/roadmap-detail-update';

export interface NodeItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  mediaType: 'video' | 'book';
  resourceCount: number;
  prerequisites: string[];
  pos: { x: number; y: number };
  status: 'completed' | 'in-progress' | 'available' | 'locked';
}

@Component({
  selector: 'app-roadmap-detail-page',
  templateUrl: './roadmap-detail-page.component.html',
  styleUrls: ['./roadmap-detail-page.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RoadmapDetailUpdate],
})
export class RoadmapDetailPageComponent implements OnInit, OnDestroy {
  // UI State
  showAddPlaylistForm = false;
  updateModalOpen = false;
  selectedNode: NodeItem | null = null;

  // Roadmap Data
  roadmapData = {
    title: 'Loading...',
    description: '',
    color: '#3b82f6',
  };

  // Canvas Data
  nodes: NodeItem[] = [];
  connections: { from: NodeItem; to: NodeItem }[] = [];
  NODE_W = 200;
  NODE_H = 100;
  canvasWidth = 1200;
  canvasHeight = 600;

  // Progress Data
  completedCount = 0;
  totalCount = 0;
  progress = 0;

  // Form Data
  newNodeForm = {
    playlistId: 0,
    position: 0,
    levelOrder: 0,
    parentNodeId: null as number | null,
  };

  private roadmapId = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private roadmapService: RoadmapService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.roadmapId = +params['id'];
      if (this.roadmapId) {
        this.loadRoadmap();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoadmap(): void {
    this.roadmapService.loadRoadmap(this.roadmapId).pipe(takeUntil(this.destroy$)).subscribe();
  }

  addPlaylist(): void {
    if (this.newNodeForm.playlistId <= 0) {
      alert('Please select a playlist');
      return;
    }

    const dto: AddPlaylistToRoadmapDto = {
      playlistId: this.newNodeForm.playlistId,
      position: this.newNodeForm.position,
      levelOrder: this.newNodeForm.levelOrder,
      parentNodeId: this.newNodeForm.parentNodeId,
    };

    this.roadmapService
      .addPlaylistToRoadmap(this.roadmapId, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.showAddPlaylistForm = false;
        this.resetForm();
      });
  }

  removeNode(nodeId: number): void {
    if (confirm('Are you sure you want to remove this node from the roadmap?')) {
      this.roadmapService
        .removeRoadmapNode(nodeId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadRoadmap();
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/roadmap']);
  }

  resetForm(): void {
    this.newNodeForm = {
      playlistId: 0,
      position: 0,
      levelOrder: 0,
      parentNodeId: null,
    };
  }

  toggleAddPlaylistForm(): void {
    this.showAddPlaylistForm = !this.showAddPlaylistForm;
    if (!this.showAddPlaylistForm) {
      this.resetForm();
    }
  }

  clearError(): void {
    this.roadmapService.clearError();
  }

  getNodeStatusClass(node: RoadmapNodeDto): string {
    const playlist = node.playlist;
    const progress =
      playlist.totalVideos > 0 ? (playlist.completedVideos / playlist.totalVideos) * 100 : 0;

    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'available';
  }

  statusLabel(status: string): string {
    return status.replace('-', ' ');
  }

  statusIcon(status: string): string {
    if (status === 'completed') {
      return '✅';
    }

    if (status === 'in-progress') {
      return '▶️';
    }

    if (status === 'available') {
      return '⭕';
    }

    return '🔒';
  }

  pathData(connection: { from: NodeItem; to: NodeItem }): string {
    const x1 = connection.from.pos.x + this.NODE_W / 2;
    const y1 = connection.from.pos.y + this.NODE_H;
    const x2 = connection.to.pos.x + this.NODE_W / 2;
    const y2 = connection.to.pos.y;

    const c1y = y1 + (y2 - y1) * 0.5;
    const c2y = y2 - (y2 - y1) * 0.5;

    return `M${x1},${y1} C${x1},${c1y} ${x2},${c2y} ${x2},${y2}`;
  }

  toNodeX(connection: { to: NodeItem }): number {
    return connection.to.pos.x + this.NODE_W / 2;
  }

  toNodeY(connection: { to: NodeItem }): number {
    return connection.to.pos.y;
  }

  connectionColor(connection: { to: NodeItem }): string {
    return connection.to.status === 'locked' ? '#cbd5e1' : '#94a3b8';
  }

  prerequisiteTitle(id: string): string {
    return this.nodes.find((node) => node.id === id)?.title ?? 'Unknown';
  }

  openUpdateModal(): void {
    this.updateModalOpen = true;
  }

  closeUpdateModal(): void {
    this.updateModalOpen = false;
  }

  applyUpdatedNodes(nodes: NodeItem[]): void {
    this.nodes = nodes;
    this.updateModalOpen = false;
  }

  statusClass(node: NodeItem): string {
    return node.status;
  }

  openNode(node: NodeItem): void {
    this.selectedNode = node;
  }

  closeNodeModal(): void {
    this.selectedNode = null;
  }

  startNode(nodeId: string): void {
    // TODO: Implement start node functionality
    console.log('Starting node:', nodeId);
    this.closeNodeModal();
  }

  completeNode(nodeId: string): void {
    // TODO: Implement complete node functionality
    console.log('Completing node:', nodeId);
    this.closeNodeModal();
  }

  contentLabel(node: NodeItem): string {
    if (node.mediaType === 'book') {
      return `${node.resourceCount} books/articles`;
    }
    return `${node.resourceCount} videos`;
  }

  nodeKindLabel(node: NodeItem): string {
    return node.mediaType === 'book' ? 'Reading' : 'Video';
  }
}
