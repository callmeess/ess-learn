import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-medium uppercase tracking-wider text-gray-500">{{ label }}</span>
        <div class="text-gray-600"><ng-content select="[icon]"></ng-content></div>
      </div>
      <div class="text-2xl font-bold">{{ value }}</div>
      <div *ngIf="sub" class="text-xs text-gray-500 mt-1">{{ sub }}</div>
    </div>
  `,
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() sub?: string;
}
