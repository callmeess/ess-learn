import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';

interface ReadingItem {
  id: string;
  title: string;
  author: string;
  status: 'completed' | 'in-progress' | 'available' | 'locked';
}

@Component({
  selector: 'app-reading-detail-page',
  templateUrl: './reading-detail-page.component.html',
  styleUrls: ['./reading-detail-page.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ReadingDetailPageComponent {
  readonly listId: string;

  readonly items: ReadingItem[] = [
    { id: 'r1', title: "You Don't Know JS Yet", author: 'Kyle Simpson', status: 'completed' },
    { id: 'r2', title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', status: 'completed' },
    { id: 'r3', title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', status: 'in-progress' },
    { id: 'r4', title: 'Modern JavaScript Features', author: 'MDN Web Docs', status: 'available' },
    { id: 'r5', title: 'Design Patterns in JS', author: 'Addy Osmani', status: 'locked' }
  ];

  constructor(route: ActivatedRoute) {
    this.listId = route.snapshot.params['id'] ?? '1';
  }
}
