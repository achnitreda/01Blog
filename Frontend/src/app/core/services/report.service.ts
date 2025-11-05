import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ReportRequest, ReportSubmitResponse } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  submitReport(userId: number, reason: string): Observable<ReportSubmitResponse> {
    const request: ReportRequest = { reason };

    return this.http.post<ReportSubmitResponse>(`${this.apiUrl}/user/${userId}`, request).pipe(
      tap((response) => {
        console.log('✅ Report submitted successfully:', response.message);
        console.log('Report ID:', response.reportId);
      }),
      catchError(this.handleError),
    );
  }

  validateReason(reason: string): { valid: boolean; error?: string } {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return {
        valid: false,
        error: 'Reason is required',
      };
    }

    if (trimmedReason.length < 10) {
      return {
        valid: false,
        error: 'Reason must be at least 10 characters',
      };
    }

    if (trimmedReason.length > 500) {
      return {
        valid: false,
        error: 'Reason must be 500 characters or less',
      };
    }

    // Check for HTML tags and script characters
    const invalidCharsPattern = /[<>"']/;
    if (invalidCharsPattern.test(trimmedReason)) {
      return {
        valid: false,
        error: 'Reason cannot contain HTML tags or script characters (< > " \')',
      };
    }

    return { valid: true };
  }

  getCharacterCount(reason: string): number {
    return reason.trim().length;
  }

  isReasonValid(reason: string): boolean {
    return this.validateReason(reason).valid;
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
      } else if (error.status === 400) {
        // Handle specific backend validation errors
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else {
          errorMessage = 'Invalid request. Please check your input.';
        }
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

    console.error('❌ Report service error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
