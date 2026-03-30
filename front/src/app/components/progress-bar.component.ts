import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-gray-800 rounded-full overflow-hidden" [ngClass]="heightClass">
      <div
        class="rounded-full transition-all duration-500"
        [ngStyle]="{ width: pct + '%', backgroundColor: color }"
        [class]="heightClass"
      ></div>
    </div>
  `,
})
export class ProgressBarComponent {
  @Input() value = 0; // 0-100
  @Input() color = '#6366f1';
  @Input() size: 'sm' | 'md' = 'sm';

  get pct() {
    return Math.min(Math.max(Math.round(this.value), 0), 100);
  }

  get heightClass() {
    return this.size === 'sm' ? 'h-1.5' : 'h-2.5';
  }
}
