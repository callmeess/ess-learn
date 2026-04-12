import { Component } from '@angular/core';

interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  totalCourses: number;
  completedCourses: number;
  estimatedHours: number;
  color: string;
  icon: string;
  tags: string[];
}

@Component({
  selector: 'app-roadmaps-page',
  templateUrl: './roadmaps-page.component.html',
  styleUrls: ['./roadmaps-page.component.css'],
  standalone: false
})
export class RoadmapsPageComponent {
  readonly categories: string[] = [
    'all',
    'Web Development',
    'Frontend',
    'DevOps',
    'System Design',
    'Data Science',
    'Mobile'
  ];

  roadmaps: Roadmap[] = [
    {
      id: '1',
      title: 'Full Stack Web Development',
      description: 'Complete roadmap to become a full-stack web developer covering frontend, backend, databases, and deployment.',
      category: 'Web Development',
      totalCourses: 12,
      completedCourses: 7,
      estimatedHours: 150,
      color: '#3b82f6',
      icon: '🌐',
      tags: ['JavaScript', 'Node.js', 'React']
    },
    {
      id: '2',
      title: 'React Developer Path',
      description: 'Master React ecosystem including hooks, state management, routing, and modern patterns.',
      category: 'Frontend',
      totalCourses: 8,
      completedCourses: 5,
      estimatedHours: 80,
      color: '#06b6d4',
      icon: '⚛️',
      tags: ['React', 'TypeScript', 'Redux']
    },
    {
      id: '3',
      title: 'DevOps Engineering',
      description: 'Learn Docker, Kubernetes, CI/CD pipelines, cloud platforms, and infrastructure as code.',
      category: 'DevOps',
      totalCourses: 10,
      completedCourses: 3,
      estimatedHours: 120,
      color: '#8b5cf6',
      icon: '🚀',
      tags: ['Docker', 'Kubernetes', 'AWS']
    },
    {
      id: '4',
      title: 'System Design Fundamentals',
      description: 'Core concepts in distributed systems, scalability, databases, and architectural patterns.',
      category: 'System Design',
      totalCourses: 9,
      completedCourses: 0,
      estimatedHours: 90,
      color: '#f59e0b',
      icon: '🏗️',
      tags: ['Architecture', 'Databases', 'Scalability']
    },
    {
      id: '5',
      title: 'Python and Data Science',
      description: 'From Python basics to machine learning, data visualization, and statistical analysis.',
      category: 'Data Science',
      totalCourses: 14,
      completedCourses: 6,
      estimatedHours: 180,
      color: '#10b981',
      icon: '🐍',
      tags: ['Python', 'ML', 'Pandas']
    },
    {
      id: '6',
      title: 'Flutter Mobile Development',
      description: 'Build cross-platform mobile apps for iOS and Android with Flutter and Dart.',
      category: 'Mobile',
      totalCourses: 11,
      completedCourses: 2,
      estimatedHours: 130,
      color: '#ec4899',
      icon: '📱',
      tags: ['Flutter', 'Dart', 'Mobile']
    }
  ];

  currentSearch = '';
  currentFilter = 'all';
  createModalOpen = false;
  toastMessage = '';

  newRoadmap = {
    title: '',
    category: '',
    description: '',
    icon: '📚',
    color: '#3b82f6'
  };

  progress(item: Roadmap): number {
    return Math.round((item.completedCourses / item.totalCourses) * 100);
  }

  get totalRoadmaps(): number {
    return this.roadmaps.length;
  }

  get inProgressCount(): number {
    return this.roadmaps.filter((r) => r.completedCourses > 0 && r.completedCourses < r.totalCourses).length;
  }

  get completedCount(): number {
    return this.roadmaps.filter((r) => r.completedCourses === r.totalCourses).length;
  }

  get totalHours(): number {
    return this.roadmaps.reduce((sum, roadmap) => sum + roadmap.estimatedHours, 0);
  }

  get filteredRoadmaps(): Roadmap[] {
    const q = this.currentSearch.trim().toLowerCase();

    return this.roadmaps.filter((roadmap) => {
      const categoryMatch = this.currentFilter === 'all' || roadmap.category === this.currentFilter;
      const searchMatch =
        !q ||
        roadmap.title.toLowerCase().includes(q) ||
        roadmap.description.toLowerCase().includes(q) ||
        roadmap.tags.some((tag) => tag.toLowerCase().includes(q));

      return categoryMatch && searchMatch;
    });
  }

  openCreateModal(): void {
    this.createModalOpen = true;
  }

  closeCreateModal(): void {
    this.createModalOpen = false;
  }

  createRoadmap(): void {
    if (!this.newRoadmap.title.trim()) {
      this.showToast('Roadmap title is required');
      return;
    }

    const nextId = String(this.roadmaps.length + 1);
    this.roadmaps = [
      {
        id: nextId,
        title: this.newRoadmap.title.trim(),
        description: this.newRoadmap.description.trim() || 'Custom learning path roadmap.',
        category: this.newRoadmap.category.trim() || 'Custom',
        totalCourses: 0,
        completedCourses: 0,
        estimatedHours: 0,
        color: this.newRoadmap.color,
        icon: this.newRoadmap.icon.trim() || '📚',
        tags: ['Custom']
      },
      ...this.roadmaps
    ];

    this.newRoadmap = {
      title: '',
      category: '',
      description: '',
      icon: '📚',
      color: '#3b82f6'
    };

    this.closeCreateModal();
    this.showToast('Roadmap created!');
  }

  showToast(message: string): void {
    this.toastMessage = message;
    window.setTimeout(() => {
      this.toastMessage = '';
    }, 2400);
  }
}
