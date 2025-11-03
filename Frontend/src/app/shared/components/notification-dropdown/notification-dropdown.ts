import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { NotificationService } from '../../../core/services';
import { Router } from '@angular/router';
import { Notification } from '../../models';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-notification-dropdown',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, TimeAgoPipe],
  templateUrl: './notification-dropdown.html',
  styleUrl: './notification-dropdown.scss',
})
export class NotificationDropdown implements OnInit {
  notifications = signal<Notification[]>([]);

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  isMarkingAllAsRead = signal(false);

  @Output() countUpdated = new EventEmitter<number>();
  @Output() notificationClicked = new EventEmitter<void>();

  constructor(
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.notificationService.getUnreadNotifications().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.isLoading.set(false);

        // Emit count for badge update
        this.countUpdated.emit(notifications.length);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Failed to load notifications');
      },
    });
  }

  /**
   * Handle notification click
   * - Mark as read
   * - Remove from list
   * - Navigate to post
   * - Close dropdown
   */
  handleNotificationClick(notification: Notification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // Mark as read
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        // Remove from list
        this.notifications.update((list) => list.filter((n) => n.id !== notification.id));

        // Update badge count
        const newCount = this.notifications().length;
        this.countUpdated.emit(newCount);

        // Navigate to post
        this.router.navigate(['/posts', notification.postId]);

        // Emit event to close dropdown
        this.notificationClicked.emit();
      },
      error: (error) => {
        console.error('Failed to mark notification as read:', error.message);
        alert('Failed to mark notification as read. Please try again.');
      },
    });
  }

  navigateToProfile(notification: Notification, event: Event): void {
    event.stopPropagation(); // Prevent notification click
    this.router.navigate(['/users', notification.actorId]);
    this.notificationClicked.emit();
  }

  markAllAsRead(): void {
    const notificationIds = this.notifications().map((n) => n.id);

    if (notificationIds.length === 0) {
      return;
    }

    this.isMarkingAllAsRead.set(true);

    this.notificationService.markAllAsRead(notificationIds).subscribe({
      next: () => {
        this.notifications.set([]);

        this.countUpdated.emit(0);

        this.isMarkingAllAsRead.set(false);
      },
      error: (error) => {
        console.error('❌ Failed to mark all as read:', error.message);
        this.isMarkingAllAsRead.set(false);
        alert('Failed to mark all as read. Please try again.');
      },
    });
  }

  retry(): void {
    this.loadNotifications();
  }

  hasNotifications(): boolean {
    return this.notifications().length > 0;
  }

  getNotificationIcon(notification: Notification): string {
    return this.notificationService.getNotificationIcon(notification.type);
  }

  getNotificationColor(notification: Notification): string {
    return this.notificationService.getNotificationColor(notification.type);
  }
}
