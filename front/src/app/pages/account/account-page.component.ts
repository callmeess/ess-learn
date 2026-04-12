import { Component } from '@angular/core';

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.css'],
  standalone: false
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
