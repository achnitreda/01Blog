import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <div class="admin-card">
        <h1>👑 Admin Panel</h1>
        <p>
          Welcome, Admin <strong>{{ username }}</strong>
        </p>

        <div class="info">
          <p>✅ This page is protected by Admin Guard</p>
          <p>✅ Only users with ADMIN role can see this</p>
          <p>🔒 Regular users will be redirected</p>
        </div>

        <button (click)="goToFeed()" class="btn-secondary">Go to Feed</button>

        <button (click)="logout()" class="btn-logout">Logout</button>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1a1a1b;
        padding: 16px;
      }

      .admin-card {
        background: #2d2d2e;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        padding: 48px 32px;
        max-width: 500px;
        text-align: center;
        border: 2px solid #ff4500;
      }

      h1 {
        color: #ffb000;
        margin: 0 0 16px 0;
      }

      p {
        color: #a8a8a8;
        margin: 8px 0;
      }

      strong {
        color: #ffffff;
      }

      .info {
        margin: 24px 0;
        padding: 16px;
        background: rgba(255, 69, 0, 0.1);
        border-radius: 8px;
        border-left: 4px solid #ff4500;
      }

      .info p {
        color: #ffc6b3;
        margin: 4px 0;
      }

      button {
        margin: 8px;
        padding: 12px 32px;
        border: none;
        border-radius: 24px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-secondary {
        background: #0079d3;
        color: white;
      }

      .btn-secondary:hover {
        background: #0064c5;
      }

      .btn-logout {
        background: #ea0027;
        color: white;
      }

      .btn-logout:hover {
        background: #c00020;
      }
    `,
  ],
})
export class Admin {
  username: string;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.username = this.authService.getUsername() || 'Admin';
  }

  goToFeed(): void {
    this.router.navigate(['/feed']);
  }

  logout(): void {
    this.authService.logout();
  }
}
