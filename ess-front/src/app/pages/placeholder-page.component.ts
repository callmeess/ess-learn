import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder-page',
  templateUrl: './placeholder-page.component.html',
  styleUrls: ['./placeholder-page.component.css'],
  standalone: false
})
export class PlaceholderPageComponent {
  readonly title: string;

  constructor(route: ActivatedRoute) {
    this.title = route.snapshot.data['title'] as string;
  }
}
