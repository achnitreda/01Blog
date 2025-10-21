import { inject } from '@angular/core/primitives/di';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Redirect to login page and save the attempted URL
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }, // Save where user tried to go
    });
  }

  return false;
};
