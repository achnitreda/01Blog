import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar class="navbar">
      <div class="navbar-content">
        <div class="brand" routerLink="/feed">
          <h1>01Blog</h1>
        </div>

        <nav class="nav-links">
          <a
            mat-button
            routerLink="/feed"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: false }"
          >
            <mat-icon>home</mat-icon>
            <span>Feed</span>
          </a>
          <a mat-button routerLink="/my-posts" routerLinkActive="active">
            <mat-icon>article</mat-icon>
            <span>My Posts</span>
          </a>
        </nav>

        <div class="user-menu">
          <button mat-button [matMenuTriggerFor]="menu" class="user-btn">
            <mat-icon>account_circle</mat-icon>
            <span>{{ username() }}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item routerLink="/my-posts">
              <mat-icon>article</mat-icon>
              <span>My Posts</span>
            </button>
            <button mat-menu-item (click)="onLogout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [
    `
      .navbar {
        background: white !important;
        color: #1a1a1b !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 1000;
        height: 64px;
        padding: 0;
      }

      .navbar-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 16px;
        height: 100%;
      }

      .brand {
        cursor: pointer;

        h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #ff4500;
          letter-spacing: -0.5px;
        }
      }

      .nav-links {
        display: flex;
        gap: 8px;
        flex: 1;
        justify-content: center;

        @media (max-width: 576px) {
          display: none;
        }

        a {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #7c7c7c;
          font-weight: 500;
          transition: all 0.2s;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }

          &:hover {
            color: #1a1a1b;
            background: rgba(0, 0, 0, 0.04);
            text-decoration: none;
          }

          &.active {
            color: #ff4500;
            background: rgba(255, 69, 0, 0.08);
          }
        }
      }

      .user-menu {
        .user-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #7c7c7c;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }

          span {
            font-weight: 500;

            @media (max-width: 576px) {
              display: none;
            }
          }

          &:hover {
            color: #1a1a1b;
            background: rgba(0, 0, 0, 0.04);
          }
        }
      }

      // Mobile adjustments
      @media (max-width: 576px) {
        .navbar {
          height: 56px;
        }

        .brand h1 {
          font-size: 20px;
        }

        .navbar-content {
          padding: 0 8px;
        }
      }
    `,
  ],
})
export class Navbar {
  username = signal<string>('');

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.username.set(this.authService.getUsername() || 'Guest');
  }

  onLogout(): void {
    console.log('🚪 Logging out...');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
