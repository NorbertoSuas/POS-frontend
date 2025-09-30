import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const jwt = authService.getAppToken();

  const authReq = jwt
    ? req.clone({ setHeaders: { Authorization: `Bearer ${jwt}` } })
    : req;
  return next(authReq);
};
