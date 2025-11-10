import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  AdminPost,
  AdminUser,
  BanUserRequest,
  DashboardStatistics,
  DeletePostResponse,
  DeleteUserResponse,
  HidePostRequest,
} from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // ============================================
  // USER MANAGEMENT
  // ============================================

  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`).pipe(
      tap((users) => {
        console.log(`✅ Loaded ${users.length} users`);
      }),
      catchError(this.handleError),
    );
  }

  getUserById(userId: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.apiUrl}/users/${userId}`).pipe(
      tap((user) => {
        console.log(`✅ Loaded user: @${user.username}`);
      }),
      catchError(this.handleError),
    );
  }

  banUser(userId: number, reason: string): Observable<AdminUser> {
    const request: BanUserRequest = { reason };

    return this.http.put<AdminUser>(`${this.apiUrl}/users/${userId}/ban`, request).pipe(
      tap((user) => {
        console.log(`✅ User @${user.username} banned`);
      }),
      catchError(this.handleError),
    );
  }

  unbanUser(userId: number): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.apiUrl}/users/${userId}/unban`, {}).pipe(
      tap((user) => {
        console.log(`✅ User @${user.username} unbanned`);
      }),
      catchError(this.handleError),
    );
  }

  deleteUser(userId: number): Observable<DeleteUserResponse> {
    return this.http.delete<DeleteUserResponse>(`${this.apiUrl}/users/${userId}`).pipe(
      tap((response) => {
        console.log(`✅ User deleted: ${response.message}`);
      }),
      catchError(this.handleError),
    );
  }

  // ============================================
  // POST MANAGEMENT
  // ============================================

  getAllPosts(): Observable<AdminPost[]> {
    return this.http.get<AdminPost[]>(`${this.apiUrl}/posts`).pipe(
      tap((posts) => {
        console.log(`✅ Loaded ${posts.length} posts`);
      }),
      catchError(this.handleError),
    );
  }

  getPostById(postId: number): Observable<AdminPost> {
    return this.http.get<AdminPost>(`${this.apiUrl}/posts/${postId}`).pipe(
      tap((post) => {
        console.log(`✅ Loaded post: "${post.title}"`);
      }),
      catchError(this.handleError),
    );
  }

  hidePost(postId: number, reason: string): Observable<AdminPost> {
    const request: HidePostRequest = { reason };

    return this.http.put<AdminPost>(`${this.apiUrl}/posts/${postId}/hide`, request).pipe(
      tap((post) => {
        console.log(`✅ Post "${post.title}" hidden`);
      }),
      catchError(this.handleError),
    );
  }

  unhidePost(postId: number): Observable<AdminPost> {
    return this.http.put<AdminPost>(`${this.apiUrl}/posts/${postId}/unhide`, {}).pipe(
      tap((post) => {
        console.log(`✅ Post "${post.title}" unhidden`);
      }),
      catchError(this.handleError),
    );
  }

  deletePost(postId: number): Observable<DeletePostResponse> {
    return this.http.delete<DeletePostResponse>(`${this.apiUrl}/posts/${postId}`).pipe(
      tap((response) => {
        console.log(`✅ Post deleted: ${response.message}`);
      }),
      catchError(this.handleError),
    );
  }

  // ============================================
  // DASHBOARD & STATISTICS
  // ============================================

  getDashboardStatistics(): Observable<DashboardStatistics> {
    return this.http.get<DashboardStatistics>(`${this.apiUrl}/dashboard/statistics`).pipe(
      tap((stats) => {
        console.log('✅ Dashboard statistics loaded');
        console.log(
          `Users: ${stats.totalUsers}, Posts: ${stats.totalPosts}, Reports: ${stats.totalReports}`,
        );
      }),
      catchError(this.handleError),
    );
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  isUserBanned(user: AdminUser): boolean {
    return user.banned;
  }

  isPostHidden(post: AdminPost): boolean {
    return post.hidden;
  }

  getUserStatusText(user: AdminUser): string {
    if (user.banned) {
      return 'Banned';
    }
    return 'Active';
  }

  getPostStatusText(post: AdminPost): string {
    if (post.hidden) {
      return 'Hidden';
    }
    return 'Visible';
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
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }

    console.error('❌ Admin service error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
