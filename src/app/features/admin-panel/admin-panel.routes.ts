import { Routes } from '@angular/router';
import { AdminPanel } from './pages/admin-panel/admin-panel';
import { Welcome } from './pages/welcome/welcome';
import { roleGuard } from '../../core/guards/role-guard';
import { authGuard } from '../../core/guards/auth-guard';
import { sessionGuard } from '../../core/guards/session-guard';

export const adminPanelRoutes: Routes = [
  {
    path: '',
    component: AdminPanel,
    canActivate: [sessionGuard],
    children: [
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },
      { path: 'welcome', component: Welcome },

      // lazy‑load dashboard desde feature/dashboard
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../dashboard/dashboard.routes').then(m => m.dashboardRoutes),
        canActivate: [roleGuard],
        data: { 
          roles: ['admin'],
        }
      },

      // lazy‑load cash‑register
      {
        path: 'cash-register',
        loadChildren: () =>
          import('../cash-register/cash-register.routes').then(m => m.cashRegisterRoutes),
        canActivate: [roleGuard],
        data: { 
          roles: ['admin', 'cajero'],
        }
      },
      // lazy‑load orders
      {
        path: 'order',
        loadChildren: () =>
          import('../order/order.routes').then(m => m.orderRoutes),
        canActivate: [roleGuard],
        data: {
          roles: ['admin', 'cajero'],
        }
      },
      // lazy‑load user
      {
        path: 'user',
        loadChildren: () =>
          import('../user/user.routes').then(m => m.userRoutes),
        canActivate: [roleGuard],
        data: {
          roles: ['admin', 'cajero'],
        }
      },
      
      // lazy‑load inventory
      {
        path: 'inventory',
        loadChildren: () =>
          import('../inventory/inventory.routes').then(m => m.inventoryRoutes),
        canActivate: [roleGuard],
        data: {
          roles: ['admin', 'inventory-manager'],
        }
      },
      
      // lazy‑load audit
      {
        path: 'audit',
        loadChildren: () =>
          import('../audit/audit.routes').then(m => m.auditRoutes),
        canActivate: [roleGuard],
        data: {
          roles: ['admin'],
        }
      }
    ]
  }
];