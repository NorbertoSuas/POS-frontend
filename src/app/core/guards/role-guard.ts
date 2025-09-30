import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../features/auth/services/login.service';

/**
 * Guard to protect routes based on allowed roles.
 * Usage in routes:
 * canActivate: [roleGuard], data: { roles: ['admin', 'cajero'] }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as string[];
  const user = loginService.getCurrentUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    // If no roles are specified, allow access
    return true;
  }

  if (allowedRoles.includes(user.role)) {
    return true;
  } else {
    // Redirect to access denied page or dashboard
    router.navigate(['/']);
    return false;
  }
};
