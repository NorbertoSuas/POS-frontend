import { APP_INITIALIZER, Provider } from '@angular/core';
import { AuthService } from '../services/auth';

export function initAppFactory(authService: AuthService) {
  return () => authService.authenticateApp().toPromise(); // ← ejecuta authenticateApp() al iniciar
}

export const AppInitializerProvider: Provider = {
  provide: APP_INITIALIZER,
  useFactory: initAppFactory,
  deps: [AuthService],
  multi: true
};
