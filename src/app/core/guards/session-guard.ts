import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../features/auth/services/login.service';

export const sessionGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  
  // Use the service method to check authentication
  if (loginService.isAuthenticated()) {
    return true;
  }
  
  // Clear any stale data and redirect to login
  loginService.logout();
  return false;
};
