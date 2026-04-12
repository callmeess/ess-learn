import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface NodeItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'available' | 'locked';
  duration: string;
  mediaType: 'video' | 'book';
  resourceCount: number;
  prerequisites: string[];
  pos: { x: number; y: number };
}

interface RoadmapDetail {
  title: string;
  description: string;
  color: string;
  nodes: NodeItem[];
}

interface AddNodeForm {
  title: string;
  description: string;
  duration: string;
  resourceCount: number;
  status: NodeItem['status'];
  prerequisiteId: string;
  followingNodeId: string;
  besideNodeId: string;
}

@Component({
  selector: 'app-roadmap-detail-page',
  templateUrl: './roadmap-detail-page.component.html',
  styleUrls: ['./roadmap-detail-page.component.css'],
  standalone: false
})
export class RoadmapDetailPageComponent {
  readonly NODE_W = 190;
  readonly NODE_H = 130;
  readonly H_GAP = 60;
  readonly V_GAP = 40;
  readonly roadmapId: string;
  readonly roadmapData: RoadmapDetail;

  nodes: NodeItem[] = [];
  selectedNode: NodeItem | null = null;
  addModalOpen = false;
  addForm: AddNodeForm = this.createEmptyAddForm();

  private readonly roadmapMap: Record<string, RoadmapDetail> = {
    '1': {
      title: 'Full Stack Web Development',
      description: 'Complete hybrid roadmap with videos and books for frontend, backend, databases, and deployment.',
      color: '#3b82f6',
      nodes: [
        { id: 'n1', title: 'HTML and CSS Basics', description: 'Foundation of web development', duration: '8h', mediaType: 'video', resourceCount: 5, status: 'completed', prerequisites: [], pos: { x: 370, y: 30 } },
        { id: 'n2', title: 'JavaScript Fundamentals', description: 'Core JavaScript concepts', duration: '15h', mediaType: 'video', resourceCount: 10, status: 'completed', prerequisites: ['n1'], pos: { x: 120, y: 200 } },
        { id: 'n3', title: 'Git and GitHub', description: 'Version control basics', duration: '5h', mediaType: 'video', resourceCount: 4, status: 'completed', prerequisites: ['n1'], pos: { x: 620, y: 200 } },
        { id: 'r1', title: 'JavaScript Reading List', description: 'Essential books and articles', duration: '25h', mediaType: 'book', resourceCount: 4, status: 'in-progress', prerequisites: ['n2'], pos: { x: 370, y: 370 } },
        { id: 'n4', title: 'React Basics', description: 'Modern frontend framework', duration: '20h', mediaType: 'video', resourceCount: 12, status: 'in-progress', prerequisites: ['n2'], pos: { x: 50, y: 540 } },
        { id: 'n5', title: 'Node.js and Express', description: 'Backend with JavaScript', duration: '18h', mediaType: 'video', resourceCount: 11, status: 'available', prerequisites: ['n2'], pos: { x: 300, y: 540 } },
        { id: 'n6', title: 'Database Design (SQL)', description: 'Relational databases', duration: '12h', mediaType: 'video', resourceCount: 8, status: 'available', prerequisites: ['n2'], pos: { x: 550, y: 540 } },
        { id: 'r2', title: 'React Deep Dive', description: 'React books and articles', duration: '12h', mediaType: 'book', resourceCount: 3, status: 'available', prerequisites: ['n4'], pos: { x: 50, y: 710 } },
        { id: 'n7', title: 'RESTful APIs', description: 'Building web APIs', duration: '10h', mediaType: 'video', resourceCount: 7, status: 'locked', prerequisites: ['n5', 'n6'], pos: { x: 420, y: 710 } },
        { id: 'n9', title: 'React Advanced Patterns', description: 'Advanced React concepts', duration: '15h', mediaType: 'video', resourceCount: 9, status: 'locked', prerequisites: ['n4', 'r2'], pos: { x: 50, y: 880 } },
        { id: 'n8', title: 'Authentication and Security', description: 'User auth and security', duration: '8h', mediaType: 'video', resourceCount: 6, status: 'locked', prerequisites: ['n7'], pos: { x: 420, y: 880 } },
        { id: 'n10', title: 'Full Stack Integration', description: 'Connect frontend and backend', duration: '12h', mediaType: 'video', resourceCount: 8, status: 'locked', prerequisites: ['n8', 'n9'], pos: { x: 200, y: 1060 } },
        { id: 'r3', title: 'System Design Reading', description: 'Architectural patterns', duration: '30h', mediaType: 'book', resourceCount: 3, status: 'locked', prerequisites: ['n10'], pos: { x: 450, y: 1060 } },
        { id: 'n11', title: 'Testing and QA', description: 'Unit and integration tests', duration: '10h', mediaType: 'video', resourceCount: 7, status: 'locked', prerequisites: ['n10'], pos: { x: 80, y: 1230 } },
        { id: 'n12', title: 'Deployment and DevOps', description: 'Deploy to production', duration: '8h', mediaType: 'video', resourceCount: 5, status: 'locked', prerequisites: ['n10'], pos: { x: 360, y: 1230 } }
      ]
    }
  };

  constructor(route: ActivatedRoute) {
    this.roadmapId = route.snapshot.params['id'] ?? '1';
    this.roadmapData = this.roadmapMap[this.roadmapId] ?? this.roadmapMap['1'];
    this.nodes = this.roadmapData.nodes.map((node) => ({ ...node }));
  }

  get completedCount(): number {
    return this.nodes.filter((item) => item.status === 'completed').length;
  }

  get totalCount(): number {
    return this.nodes.length;
  }

  get progress(): number {
    return Math.round((this.completedCount / this.nodes.length) * 100);
  }

  get canvasWidth(): number {
    const maxX = this.nodes.reduce((acc, node) => Math.max(acc, node.pos.x + this.NODE_W), 800);
    return maxX + 40;
  }

  get canvasHeight(): number {
    const maxY = this.nodes.reduce((acc, node) => Math.max(acc, node.pos.y + this.NODE_H), 1000);
    return maxY + 40;
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
    if (node.status === 'locked') {
      return;
    }

    this.selectedNode = node;
  }

  closeNodeModal(): void {
    this.selectedNode = null;
  }

  startNode(id: string): void {
    this.nodes = this.nodes.map((node) => (node.id === id ? { ...node, status: 'in-progress' } : node));
    this.selectedNode = this.nodes.find((node) => node.id === id) ?? null;
  }

  completeNode(id: string): void {
    const updatedNodes: NodeItem[] = this.nodes.map((node) =>
      node.id === id ? { ...node, status: 'completed' as const } : node
    );

    this.nodes = updatedNodes.map((node): NodeItem => {
      if (node.status !== 'locked') {
        return node;
      }

      const isUnlocked = node.prerequisites.every((preId) =>
        updatedNodes.some((item) => item.id === preId && item.status === 'completed')
      );

      return isUnlocked ? { ...node, status: 'available' as const } : node;
    });

    this.selectedNode = this.nodes.find((node) => node.id === id) ?? null;
  }

  statusClass(node: NodeItem): string {
    return node.status;
  }

  contentLabel(node: NodeItem): string {
    return node.mediaType === 'book'
      ? `📖 ${node.resourceCount} books/articles`
      : `🎬 ${node.resourceCount} videos`;
  }

  nodeKindLabel(node: NodeItem): string {
    return node.mediaType === 'book' ? 'Book Node' : 'Video Node';
  }

  statusLabel(status: NodeItem['status']): string {
    return status.replace('-', ' ');
  }

  statusIcon(status: NodeItem['status']): string {
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

  openAddModal(): void {
    this.addForm = this.createEmptyAddForm();
    this.addModalOpen = true;
  }

  closeAddModal(): void {
    this.addModalOpen = false;
  }

  addCourse(): void {
    this.addNode('video');
  }

  addReading(): void {
    this.addNode('book');
  }

  followingNodeOptions(): NodeItem[] {
    if (!this.addForm.prerequisiteId) {
      return this.nodes;
    }

    return this.nodes.filter((node) => node.id !== this.addForm.prerequisiteId);
  }

  private createEmptyAddForm(): AddNodeForm {
    return {
      title: '',
      description: '',
      duration: '6h',
      resourceCount: 1,
      status: 'available',
      prerequisiteId: '',
      followingNodeId: '',
      besideNodeId: ''
    };
  }

  private addNode(mediaType: NodeItem['mediaType']): void {
    const title = this.addForm.title.trim();
    if (!title) {
      return;
    }

    const prerequisites = this.addForm.prerequisiteId ? [this.addForm.prerequisiteId] : [];
    const newNodeId = this.nextNodeId(mediaType);
    const pos = this.nextPosition(prerequisites[0] ?? null, this.addForm.besideNodeId || null);
    const status = prerequisites.length
      ? this.isPrerequisiteComplete(prerequisites[0])
        ? this.addForm.status
        : 'locked'
      : this.addForm.status;

    const newNode: NodeItem = {
      id: newNodeId,
      title,
      description: this.addForm.description.trim() || (mediaType === 'book' ? 'Reading node' : 'Course node'),
      duration: this.addForm.duration.trim() || '6h',
      mediaType,
      resourceCount: Math.max(1, this.addForm.resourceCount),
      status,
      prerequisites,
      pos
    };

    let updatedNodes = [...this.nodes, newNode];
    if (this.addForm.followingNodeId) {
      updatedNodes = updatedNodes.map((node) => {
        if (node.id !== this.addForm.followingNodeId) {
          return node;
        }

        if (node.prerequisites.includes(newNodeId)) {
          return node;
        }

        return { ...node, prerequisites: [...node.prerequisites, newNodeId] };
      });
    }

    this.nodes = this.normalizeSameLevelOrder(updatedNodes);
    this.closeAddModal();
  }

  private nextNodeId(mediaType: NodeItem['mediaType']): string {
    const prefix = mediaType === 'book' ? 'r' : 'n';
    const max = this.nodes.reduce((acc, node) => {
      if (!node.id.startsWith(prefix)) {
        return acc;
      }

      const parsed = Number(node.id.slice(1));
      return Number.isNaN(parsed) ? acc : Math.max(acc, parsed);
    }, 0);

    return `${prefix}${max + 1}`;
  }

  private isPrerequisiteComplete(id: string): boolean {
    return this.nodes.some((node) => node.id === id && node.status === 'completed');
  }

  private nextPosition(prerequisiteId: string | null, besideNodeId: string | null): NodeItem['pos'] {
    const beside = besideNodeId ? this.nodes.find((node) => node.id === besideNodeId) : null;
    if (beside) {
      return {
        x: beside.pos.x + this.NODE_W + this.H_GAP,
        y: beside.pos.y
      };
    }

    const prerequisite = prerequisiteId ? this.nodes.find((node) => node.id === prerequisiteId) : null;
    const y = prerequisite
      ? prerequisite.pos.y + this.NODE_H + this.V_GAP
      : this.nodes.reduce((acc, node) => Math.max(acc, node.pos.y), 0) + this.NODE_H + this.V_GAP;

    const levelNodes = this.nodes.filter((node) => Math.abs(node.pos.y - y) <= 8);
    const rightMost = levelNodes.reduce((acc, node) => Math.max(acc, node.pos.x), -this.NODE_W - this.H_GAP);

    return {
      x: rightMost + this.NODE_W + this.H_GAP,
      y
    };
  }

  private normalizeSameLevelOrder(items: NodeItem[]): NodeItem[] {
    const rows = new Map<number, NodeItem[]>();

    for (const node of items) {
      const key = Math.round(node.pos.y / 10) * 10;
      const row = rows.get(key) ?? [];
      row.push(node);
      rows.set(key, row);
    }

    const orderedRows = [...rows.entries()].sort((a, b) => a[0] - b[0]);
    const leftPadding = 50;

    for (const [rowKey, rowNodes] of orderedRows) {
      rowNodes.sort((a, b) => a.pos.x - b.pos.x);
      rowNodes.forEach((node, index) => {
        node.pos = {
          x: leftPadding + index * (this.NODE_W + this.H_GAP),
          y: rowKey
        };
      });
    }

    return items;
  }
}
