import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { auditRoutes } from './audit.routes';
import { authInterceptor } from '../../core/interceptors/auth-interceptor';

export const auditConfig: ApplicationConfig = {
  providers: [
    provideRouter(auditRoutes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
