import { Routes } from '@angular/router';
import { CashRegisterPage } from './pages/cash-register/cash-register';
import { CashRegisterSessionsPage } from './pages/cash-register-sessions/cash-register-sessions';
import { CashRegisterLandingPage } from './pages/cash-register-landing/cash-register-landing';
import { CashRegisterMovementsPage } from './pages/cash-register-movements/cash-register-movements';
import { CashRegisterMovementTypesPage } from './pages/cash-register-movement-types/cash-register-movement-types';
import { CashRegisterReportsPage } from './pages/cash-register-reports/cash-register-reports';
import { CashRegisterApprovalsPage } from './pages/cash-register-approvals/cash-register-approvals';
import { CashRegisterManagementPage } from './pages/cash-register-management/cash-register-management';
import { CashierDashboardPage } from './pages/cashier-dashboard/cashier-dashboard';

export const cashRegisterRoutes: Routes = [
  { 
    path: '', 
    component: CashRegisterLandingPage 
  },
  { 
    path: 'dashboard', 
    component: CashRegisterPage 
  },
  { 
    path: 'cashier', 
    component: CashierDashboardPage 
  },
  { 
    path: 'sessions', 
    component: CashRegisterSessionsPage 
  },
  { 
    path: 'movements', 
    component: CashRegisterMovementsPage 
  },
  { 
    path: 'movement-types', 
    component: CashRegisterMovementTypesPage 
  },
  { 
    path: 'reports', 
    component: CashRegisterReportsPage 
  },
  { 
    path: 'approvals', 
    component: CashRegisterApprovalsPage 
  },
  { 
    path: 'management', 
    component: CashRegisterManagementPage 
  }
];