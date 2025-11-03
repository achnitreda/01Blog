import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, Observable, of, tap, throwError } from 'rxjs';
import { Notification, NotificationSummary } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap((notifications) => {
        console.log(`✅ Loaded ${notifications.length} unread notifications`);
      }),
      catchError(this.handleError),
    );
  }

  getSummary(): Observable<NotificationSummary> {
    return this.http.get<NotificationSummary>(`${this.apiUrl}/summary`).pipe(
      tap((summary) => {
        console.log(`✅ Unread count: ${summary.unreadCount}`);
      }),
      catchError(this.handleError),
    );
  }

  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap((notification) => {
        console.log(`✅ Notification ${notificationId} marked as read`);
      }),
      catchError(this.handleError),
    );
  }

  markAllAsRead(notificationIds: number[]): Observable<Notification[]> {
    if (notificationIds.length === 0) {
      console.log('ℹ️ No notifications to mark as read');
      return of([]);
    }

    // Create array of mark-as-read requests
    const markAsReadRequests = notificationIds.map((id) => this.markAsRead(id));

    // Execute all requests in parallel
    return forkJoin(markAsReadRequests).pipe(
      tap(() => {
        console.log(`✅ Successfully marked ${notificationIds.length} notifications as read`);
      }),
      catchError((error) => {
        console.error('❌ Failed to mark all notifications as read:', error);
        return throwError(() => error);
      }),
    );
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'NEW_POST':
        return 'post_add';
      default:
        return 'notifications';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'NEW_POST':
        return '#FF4500'; // Orange
      default:
        return '#7C7C7C'; // Gray
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'Notification not found.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
