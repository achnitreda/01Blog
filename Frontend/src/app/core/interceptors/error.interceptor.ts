import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services';
import { inject } from '@angular/core/primitives/di';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('401 Unauthorized - Logging out');

        if (!req.url.includes('/auth/')) {
          authService.logout();
        }
      } else if (error.status === 403) {
        console.error('403 Forbidden - Access denied');
      } else if (error.status === 0) {
        // Network error - backend is down
        console.error('Network error - Cannot connect to backend');
      } else {
        // Other errors
        console.error(`HTTP Error ${error.status}:`, error.message);
      }

      return throwError(() => error);
    }),
  );
};
