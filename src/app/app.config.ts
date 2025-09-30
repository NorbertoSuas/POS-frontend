import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { AuthService } from './core/services/auth';
import { ThemeService } from './core/services/theme';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      const themeService = inject(ThemeService);
      
      // Initialize theme when loading the application
      themeService.applyTheme();
      
      return firstValueFrom(authService.authenticateApp()).catch(err => {
        // In development, we don't show authentication errors
        if (environment.production === false) {
          console.log('🔧 Development mode: continuing without backend authentication');
          return null;
        }
        console.error('⚠️ Error al autenticar la aplicación (AppToken):', err);
        // Puedes guardar un flag en el servicio si quieres mostrar un mensaje luego
        return null; // Continue loading the app
      });
    })
  ]
};