import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoadmapService } from '../../../core/services';
import { RoadmapDetailDto, RoadmapNodeDto } from '../../../core/models';
import { RoadmapDetailUpdate } from './roadmap-detail-update/roadmap-detail-update';

interface NodeItem {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'available' | 'locked' | 'not-started';
  duration: string;
  mediaType: 'video' | 'book';
  resourceCount: number;
  prerequisites: number[];
  pos: { x: number; y: number };
}

@Component({
  selector: 'app-roadmap-detail-page',
  templateUrl: './roadmap-detail-page.component.html',
  styleUrls: ['./roadmap-detail-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RoadmapDetailUpdate]
})
export class RoadmapDetailPageComponent implements OnInit, OnDestroy {
  readonly NODE_W = 190;
  readonly NODE_H = 130;
  private readonly H_GAP = 60;
  private readonly V_GAP = 80;
  roadmapId = 0;
  roadmapColor = '#3b82f6';
  roadmapTitle = '';
  roadmapDescription = '';

  nodes: NodeItem[] = [];
  selectedNode: NodeItem | null = null;
  updateModalOpen = false;
  editModalOpen = false;
  editingNode: NodeItem | null = null;
  loading = true;

  editForm = {
    title: '',
    description: '',
    duration: '',
    resourceCount: 1,
    mediaType: 'video'
  };

  private routeSub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly roadmapService: RoadmapService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id && id !== this.roadmapId) {
        this.roadmapId = id;
        this.loadRoadmap();
      } else if (id) {
        this.roadmapId = id;
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  loadRoadmap(): void {
    this.loading = true;
    this.roadmapService.getRoadmap(this.roadmapId).subscribe({
      next: (data) => {
        this.roadmapTitle = data.name;
        this.roadmapDescription = data.description ?? '';
        this.roadmapColor = data.color;
        this.nodes = data.nodes.map((n) => this.mapNode(n));
        this.computeLayout();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapNode(dto: RoadmapNodeDto): NodeItem {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description ?? '',
      status: dto.status as NodeItem['status'],
      duration: dto.duration ?? '0h',
      mediaType: dto.mediaType as 'video' | 'book',
      resourceCount: dto.resourceCount,
      prerequisites: dto.prerequisites,
      pos: { x: 0, y: 0 }
    };
  }

  private computeLayout(): void {
    if (!this.nodes.length) return;

    const levelOf = new Map<number, number>();
    const queue: NodeItem[] = [];

    for (const node of this.nodes) {
      if (node.prerequisites.length === 0) {
        levelOf.set(node.id, 0);
        queue.push(node);
      }
    }

    while (queue.length) {
      const current = queue.shift()!;
      const currentLevel = levelOf.get(current.id)!;
      for (const node of this.nodes) {
        if (levelOf.has(node.id)) continue;
        if (node.prerequisites.includes(current.id)) {
          const allPrereqsLeveled = node.prerequisites.every((pid) => levelOf.has(pid));
          if (allPrereqsLeveled) {
            const maxPrereqLevel = Math.max(...node.prerequisites.map((pid) => levelOf.get(pid)!));
            levelOf.set(node.id, maxPrereqLevel + 1);
            queue.push(node);
          }
        }
      }
    }

    for (const node of this.nodes) {
      if (!levelOf.has(node.id)) {
        levelOf.set(node.id, 0);
      }
    }

    const levels = new Map<number, NodeItem[]>();
    for (const node of this.nodes) {
      const lvl = levelOf.get(node.id)!;
      if (!levels.has(lvl)) levels.set(lvl, []);
      levels.get(lvl)!.push(node);
    }

    const maxLevelWidth = this.nodes.length * this.NODE_W + (this.nodes.length - 1) * this.H_GAP;

    for (const [lvl, levelNodes] of levels) {
      const levelWidth = levelNodes.length * this.NODE_W + (levelNodes.length - 1) * this.H_GAP;
      const startX = (maxLevelWidth - levelWidth) / 2;

      for (let i = 0; i < levelNodes.length; i++) {
        levelNodes[i].pos = {
          x: startX + i * (this.NODE_W + this.H_GAP),
          y: lvl * (this.NODE_H + this.V_GAP)
        };
      }
    }
  }

  get completedCount(): number {
    return this.nodes.filter((item) => item.status === 'completed').length;
  }

  get totalCount(): number {
    return this.nodes.length;
  }

  get progress(): number {
    return this.nodes.length > 0 ? Math.round((this.completedCount / this.nodes.length) * 100) : 0;
  }

  get canvasWidth(): number {
    if (!this.nodes.length) return 600;
    const maxX = Math.max(...this.nodes.map((n) => n.pos.x + this.NODE_W));
    return maxX + this.H_GAP;
  }

  get canvasHeight(): number {
    if (!this.nodes.length) return 400;
    const maxY = Math.max(...this.nodes.map((n) => n.pos.y + this.NODE_H));
    return maxY + this.V_GAP;
  }

  get connections(): Array<{ from: NodeItem; to: NodeItem }> {
    return this.nodes.flatMap((node) =>
      node.prerequisites
        .map((id) => {
          const from = this.nodes.find((item) => item.id === id);
          if (!from) {
            return null;
          }
          return { from, to: node };
        })
        .filter((item): item is { from: NodeItem; to: NodeItem } => !!item)
    );
  }

  openNode(node: NodeItem): void {
    this.selectedNode = node;
  }

  closeNodeModal(): void {
    this.selectedNode = null;
  }

  startNode(id: number): void {
    this.roadmapService.updateNodeStatus(this.roadmapId, id, { status: 'in-progress' }).subscribe({
      next: () => {
        this.loadRoadmap();
        this.selectedNode = null;
      }
    });
  }

  completeNode(id: number): void {
    this.roadmapService.updateNodeStatus(this.roadmapId, id, { status: 'completed' }).subscribe({
      next: () => {
        this.loadRoadmap();
        this.selectedNode = null;
      }
    });
  }

  openEditModal(node: NodeItem): void {
    this.editingNode = node;
    this.editForm = {
      title: node.title,
      description: node.description,
      duration: node.duration,
      resourceCount: node.resourceCount,
      mediaType: node.mediaType
    };
    this.editModalOpen = true;
  }

  closeEditModal(): void {
    this.editModalOpen = false;
    this.editingNode = null;
  }

  saveNodeEdit(): void {
    if (!this.editingNode) return;

    this.roadmapService.updateRoadmapNode(this.roadmapId, this.editingNode.id, {
      title: this.editForm.title.trim(),
      description: this.editForm.description.trim(),
      duration: this.editForm.duration.trim(),
      mediaType: this.editForm.mediaType,
      resourceCount: this.editForm.resourceCount
    }).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadRoadmap();
      }
    });
  }

  deleteNode(id: number): void {
    if (!confirm('Delete this node?')) return;

    this.roadmapService.deleteRoadmapNode(this.roadmapId, id).subscribe({
      next: () => {
        this.closeNodeModal();
        this.loadRoadmap();
      }
    });
  }

  statusClass(node: NodeItem): string {
    return node.status;
  }

  contentLabel(node: NodeItem): string {
    return node.mediaType === 'book'
      ? `${node.resourceCount} books/articles`
      : `${node.resourceCount} videos`;
  }

  nodeKindLabel(node: NodeItem): string {
    return node.mediaType === 'book' ? 'Book Node' : 'Video Node';
  }

  statusLabel(status: string): string {
    return status.replace('-', ' ');
  }

  statusIcon(status: NodeItem['status']): string {
    if (status === 'completed') return '✅';
    if (status === 'in-progress') return '▶️';
    if (status === 'available') return '⭕';
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

  prerequisiteTitle(id: number): string {
    return this.nodes.find((node) => node.id === id)?.title ?? 'Unknown';
  }

  openUpdateModal(): void {
    this.updateModalOpen = true;
  }

  closeUpdateModal(): void {
    this.updateModalOpen = false;
  }

  applyUpdatedNodes(): void {
    this.updateModalOpen = false;
    this.loadRoadmap();
  }
}
