import { Component } from '@angular/core';

interface ReadingList {
  id: string;
  title: string;
  category: string;
  totalItems: number;
  completedItems: number;
  estimatedHours: number;
  tags: string[];
}

@Component({
  selector: 'app-reading-page',
  templateUrl: './reading-page.component.html',
  styleUrls: ['./reading-page.component.css'],
  standalone: false
})
export class ReadingPageComponent {
  searchQuery = '';
  category = 'all';

  readonly lists: ReadingList[] = [
    { id: '1', title: 'Web Development Essentials', category: 'Web Development', totalItems: 4, completedItems: 2, estimatedHours: 25, tags: ['JavaScript', 'Programming'] },
    { id: '2', title: 'React Deep Dive', category: 'Frontend', totalItems: 3, completedItems: 2, estimatedHours: 12, tags: ['React', 'Frontend'] },
    { id: '3', title: 'System Design Fundamentals', category: 'System Design', totalItems: 3, completedItems: 0, estimatedHours: 30, tags: ['Architecture'] }
  ];

  get categories(): string[] {
    return ['all', ...new Set(this.lists.map((item) => item.category))];
  }

  get filtered(): ReadingList[] {
    return this.lists.filter((item) => {
      const byCategory = this.category === 'all' || item.category === this.category;
      const q = this.searchQuery.trim().toLowerCase();
      const bySearch = !q || item.title.toLowerCase().includes(q) || item.tags.some((tag) => tag.toLowerCase().includes(q));
      return byCategory && bySearch;
    });
  }
}
