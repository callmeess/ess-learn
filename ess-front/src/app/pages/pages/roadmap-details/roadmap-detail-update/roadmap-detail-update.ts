import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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

type NodeStatus = NodeItem['status'];

type AddNodeFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  duration: FormControl<string>;
  resourceCount: FormControl<number>;
  status: FormControl<NodeStatus>;
  prerequisiteId: FormControl<string>;
  followingNodeId: FormControl<string>;
  besideNodeId: FormControl<string>;
}>;

@Component({
  selector: 'app-roadmap-detail-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roadmap-detail-update.html',
  styleUrl: './roadmap-detail-update.css',
})
export class RoadmapDetailUpdate implements OnChanges {
  private readonly NODE_W = 190;
  private readonly NODE_H = 130;
  private readonly H_GAP = 60;
  private readonly V_GAP = 40;

  @Input() isOpen = false;
  @Input() nodes: NodeItem[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() nodesUpdated = new EventEmitter<NodeItem[]>();

  readonly addForm: AddNodeFormGroup = this.createForm();
  submitted = false;

  get titleControl(): FormControl<string> {
    return this.addForm.controls.title;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue && !changes['isOpen']?.previousValue) {
      this.resetForm();
    }
  }

  close(): void {
    this.closed.emit();
  }

  addCourse(): void {
    this.submitNode('video');
  }

  addReading(): void {
    this.submitNode('book');
  }

  followingNodeOptions(): NodeItem[] {
    const prerequisiteId = this.addForm.controls.prerequisiteId.value;
    if (!prerequisiteId) {
      return this.nodes;
    }

    return this.nodes.filter((node) => node.id !== prerequisiteId);
  }

  showError(controlName: keyof AddNodeFormGroup['controls']): boolean {
    const control = this.addForm.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  private createForm(): AddNodeFormGroup {
    return new FormGroup({
      title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
      description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(300)] }),
      duration: new FormControl('6h', { nonNullable: true, validators: [Validators.required, Validators.maxLength(20)] }),
      resourceCount: new FormControl(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
      status: new FormControl<NodeStatus>('available', { nonNullable: true, validators: [Validators.required] }),
      prerequisiteId: new FormControl('', { nonNullable: true }),
      followingNodeId: new FormControl('', { nonNullable: true }),
      besideNodeId: new FormControl('', { nonNullable: true })
    });
  }

  private resetForm(): void {
    this.submitted = false;
    this.addForm.reset({
      title: '',
      description: '',
      duration: '6h',
      resourceCount: 1,
      status: 'available',
      prerequisiteId: '',
      followingNodeId: '',
      besideNodeId: ''
    });
  }

  private submitNode(mediaType: NodeItem['mediaType']): void {
    this.submitted = true;
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const formValue = this.addForm.getRawValue();
    const title = formValue.title.trim();
    const description = formValue.description.trim();
    const duration = formValue.duration.trim();
    const prerequisites = formValue.prerequisiteId ? [formValue.prerequisiteId] : [];

    const newNodeId = this.nextNodeId(mediaType);
    const pos = this.nextPosition(prerequisites[0] ?? null, formValue.besideNodeId || null);
    const status = prerequisites.length
      ? this.isPrerequisiteComplete(prerequisites[0])
        ? formValue.status
        : 'locked'
      : formValue.status;

    const newNode: NodeItem = {
      id: newNodeId,
      title,
      description: description || (mediaType === 'book' ? 'Reading node' : 'Course node'),
      duration: duration || '6h',
      mediaType,
      resourceCount: Math.max(1, formValue.resourceCount),
      status,
      prerequisites,
      pos
    };

    let updatedNodes = [...this.nodes, newNode];
    if (formValue.followingNodeId) {
      updatedNodes = updatedNodes.map((node) => {
        if (node.id !== formValue.followingNodeId) {
          return node;
        }

        if (node.prerequisites.includes(newNodeId)) {
          return node;
        }

        return { ...node, prerequisites: [...node.prerequisites, newNodeId] };
      });
    }

    this.nodesUpdated.emit(this.normalizeSameLevelOrder(updatedNodes));
    this.resetForm();
    this.close();
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
