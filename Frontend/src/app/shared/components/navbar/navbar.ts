import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, NotificationService } from '../../../core/services';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationDropdown } from '../notification-dropdown/notification-dropdown';

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
    MatBadgeModule,
    NotificationDropdown,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  username: string | null = null;

  // Notification state
  unreadCount = signal(0);
  showNotificationDropdown = signal(false);

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.username = this.authService.getUsername();
    this.loadNotificationCount();
  }

  loadNotificationCount(): void {
    this.notificationService.getSummary().subscribe({
      next: (summary) => {
        this.unreadCount.set(summary.unreadCount);
        console.log(`🔔 Notification badge count: ${summary.unreadCount}`);
      },
      error: (error) => {
        console.error('❌ Failed to load notification count:', error.message);
      },
    });
  }

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown.update((show) => !show);
  }

  closeNotificationDropdown(): void {
    this.showNotificationDropdown.set(false);
  }

  handleNotificationCountUpdate(count: number): void {
    this.unreadCount.set(count);
  }

  handleNotificationClick(): void {
    this.closeNotificationDropdown();
  }

  /**
   * Close dropdown when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.notification-wrapper');

    if (!clickedInside && this.showNotificationDropdown()) {
      this.closeNotificationDropdown();
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.username = null;
    this.unreadCount.set(0);
    this.router.navigate(['/login']);
  }
}
