import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { FollowResponse, UserProfileModel } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  followUser(userId: number): Observable<FollowResponse> {
    return this.http.post<FollowResponse>(`${this.apiUrl}/${userId}/follow`, {}).pipe(
      tap((response) => {
        console.log(`✅ Now following @${response.followingUsername}`);
      }),
      catchError(this.handleError),
    );
  }

  unfollowUser(userId: number): Observable<FollowResponse> {
    return this.http.delete<FollowResponse>(`${this.apiUrl}/${userId}/unfollow`).pipe(
      tap((response) => {
        console.log(`✅ Unfollowed @${response.followingUsername}`);
      }),
      catchError(this.handleError),
    );
  }

  getUserProfile(userId: number): Observable<UserProfileModel> {
    return this.http.get<UserProfileModel>(`${this.apiUrl}/${userId}/profile`).pipe(
      tap((profile) => {
        console.log(`✅ Loaded profile: @${profile.username}`);
      }),
      catchError(this.handleError),
    );
  }

  getUserProfileByUsername(username: string): Observable<UserProfileModel> {
    console.log(`📥 Fetching profile for username: @${username}...`);

    // TODO: Backend needs a /api/users/username/{username}/profile endpoint
    // For now, you'll need to get userId first or add this endpoint to backend
    // Placeholder - will implement based on your backend

    return throwError(() => new Error('Not implemented: Use getUserProfile(userId) instead'));
  }

  getMyProfile(): Observable<UserProfileModel> {
    return this.http.get<UserProfileModel>(`${this.apiUrl}/my-profile`).pipe(
      tap((profile) => {
        console.log(`✅ Loaded my profile: @${profile.username}`);
      }),
      catchError(this.handleError),
    );
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
        errorMessage = 'User not found.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }

    console.error('Subscription service error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
