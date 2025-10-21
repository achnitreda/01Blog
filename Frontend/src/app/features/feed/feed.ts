import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feed-container">
      <div class="feed-card">
        <h1>🎉 Welcome to Your Feed!</h1>
        <p>
          You are logged in as: <strong>{{ username }}</strong>
        </p>
        <p>
          Role: <strong>{{ role }}</strong>
        </p>

        <div class="info">
          <p>✅ This page is protected by Auth Guard</p>
          <p>✅ Only authenticated users can see this</p>
        </div>

        <button (click)="logout()" class="btn-logout">Logout</button>
      </div>
    </div>
  `,
  styles: [
    `
      .feed-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #dae0e6;
        padding: 16px;
      }

      .feed-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
        padding: 48px 32px;
        max-width: 500px;
        text-align: center;
      }

      h1 {
        color: #ff4500;
        margin: 0 0 16px 0;
      }

      p {
        color: #7c7c7c;
        margin: 8px 0;
      }

      strong {
        color: #1a1a1b;
      }

      .info {
        margin: 24px 0;
        padding: 16px;
        background: #e0f2fe;
        border-radius: 8px;
        border-left: 4px solid #0079d3;
      }

      .info p {
        color: #0079d3;
        margin: 4px 0;
      }

      .btn-logout {
        margin-top: 24px;
        padding: 12px 32px;
        background: #ea0027;
        color: white;
        border: none;
        border-radius: 24px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-logout:hover {
        background: #c00020;
      }
    `,
  ],
})
export class Feed {
  username: string;
  role: string;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.username = this.authService.getUsername() || 'Guest';
    this.role = this.authService.getRole() || 'NONE';
  }

  logout(): void {
    this.authService.logout();
  }
}
