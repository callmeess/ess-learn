import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-account-page',
  templateUrl: './account.html',
  styleUrls: ['./account.css'],
  standalone: true,
  imports: [FormsModule]
})
export class AccountPageComponent {
  profile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    defaultQuality: '1080p'
  };

  preferences = {
    emailNotifications: true,
    downloadNotifications: true,
    weeklyDigest: false,
    autoDownload: false
  };
}
