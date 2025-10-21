import { Injectable, signal } from '@angular/core';
import { AuthResponse, LoginRequest, RegisterRequest, Role } from '../../shared/models';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  // Signal to track authentication state
  isAuthenticated = signal<boolean>(this.hasToken());

  // BehaviorSubject for current user (can be observed by multiple components)
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(
    this.getCurrentUserFromStorage(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    console.log('🔐 AuthService initialized');
  }

  // ============================================
  // AUTHENTICATION METHODS
  // ============================================

  register(data: RegisterRequest): Observable<AuthResponse> {
    console.log('-> Registering user:', data.username);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap((response) => {
        console.log('-> Registration successful:', response.username);
        this.handleAuthSuccess(response);
      }),
      catchError(this.handleError),
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
      }),
      catchError(this.handleError),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.isAuthenticated.set(false);
    this.currentUserSubject.next(null);

    this.router.navigate(['/login']);
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  // ============================================
  // USER INFO METHODS
  // ============================================

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  getUsername(): string | null {
    return this.getCurrentUser()?.username || null;
  }

  getRole(): Role | null {
    return this.getCurrentUser()?.role || null;
  }

  isAdmin(): boolean {
    return this.getRole() === Role.ADMIN;
  }

  isUser(): boolean {
    return this.getRole() === Role.USER;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));

    this.isAuthenticated.set(true);
    this.currentUserSubject.next(response);
  }

  private getCurrentUserFromStorage(): AuthResponse | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as AuthResponse;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        return null;
      }
    }
    return null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.details) {
        // Validation errors
        const details = error.error.details;
        const firstError = Object.values(details)[0] as string;
        errorMessage = firstError || errorMessage;
      } else [(errorMessage = `Server Error: ${error.status} - ${error.message}`)];
    }

    return throwError(() => new Error(errorMessage));
  }
}
