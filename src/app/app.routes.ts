import { Routes } from '@angular/router';
import { sessionGuard } from './core/guards/session-guard';

export const routes: Routes = [
  // 1) Feature Auth (Login)
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // 2) Feature Admin Panel (layout + children)
  {
    path: 'admin-panel',
    canActivate: [sessionGuard],
    loadChildren: () =>
      import('./features/admin-panel/admin-panel.routes').then(m => m.adminPanelRoutes)
  },

  // catch everything else
  { path: '**', redirectTo: 'login' }
];
