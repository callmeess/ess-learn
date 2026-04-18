import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'home',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  showImage = false; // Set to true to show image, false to show quote
}