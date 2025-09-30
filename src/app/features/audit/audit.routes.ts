import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role-guard';

export const auditRoutes: Routes = [
  {
    path: 'logs',
    loadChildren: () =>
      import('./pages/audit-logs/audit-logs.routes').then(m => m.auditLogsRoutes),
    canActivate: [roleGuard],
    data: { 
      roles: ['admin'],
    }
  }
];
