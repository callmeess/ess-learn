import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../../core/api.service';
import { CreateRoadmapNodeDto } from '../../../../core/api.models';

interface NodeItem {
  id: number;
  title: string;
  description: string;
  status: string;
  duration: string;
  mediaType: string;
  resourceCount: number;
  prerequisites: number[];
  pos: { x: number; y: number };
}

type AddNodeFormGroup = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  duration: FormControl<string>;
  resourceCount: FormControl<number>;
  status: FormControl<string>;
  prerequisiteId: FormControl<number>;
  followingNodeId: FormControl<number>;
}>;

@Component({
  selector: 'app-roadmap-detail-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roadmap-detail-update.html',
  styleUrl: './roadmap-detail-update.css',
})
export class RoadmapDetailUpdate implements OnChanges {
  @Input() isOpen = false;
  @Input() nodes: NodeItem[] = [];
  @Input() roadmapId = 0;
  @Output() closed = new EventEmitter<void>();
  @Output() nodesUpdated = new EventEmitter<void>();

  readonly addForm: AddNodeFormGroup = this.createForm();
  submitted = false;

  get titleControl(): FormControl<string> {
    return this.addForm.controls.title;
  }

  constructor(private readonly api: ApiService) {}

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
      status: new FormControl('available', { nonNullable: true, validators: [Validators.required] }),
      prerequisiteId: new FormControl(0, { nonNullable: true }),
      followingNodeId: new FormControl(0, { nonNullable: true })
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
      prerequisiteId: 0,
      followingNodeId: 0
    });
  }

  private submitNode(mediaType: string): void {
    this.submitted = true;
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const formValue = this.addForm.getRawValue();
    const prereqId = formValue.prerequisiteId || undefined;
    const followingId = formValue.followingNodeId || undefined;

    const status = prereqId
      ? this.isPrerequisiteComplete(prereqId)
        ? formValue.status
        : 'locked'
      : formValue.status;

    const dto: CreateRoadmapNodeDto = {
      title: formValue.title.trim(),
      description: formValue.description.trim() || undefined,
      duration: formValue.duration.trim() || '6h',
      mediaType,
      resourceCount: Math.max(1, formValue.resourceCount),
      status,
      prerequisiteIds: prereqId ? [prereqId] : undefined,
      followingNodeId: followingId
    };

    this.api.addRoadmapNode(this.roadmapId, dto).subscribe({
      next: () => {
        this.nodesUpdated.emit();
        this.resetForm();
        this.close();
      },
      error: () => {
        this.submitted = false;
      }
    });
  }

  private isPrerequisiteComplete(id: number): boolean {
    return this.nodes.some((node) => node.id === id && node.status === 'completed');
  }
}
