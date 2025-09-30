import { Routes } from '@angular/router';
import { UserPage } from './pages/user/user-page';
import { EmployeePage } from './pages/employee/employee-page';
import { RolePage } from './pages/roles/role-page';

export const userRoutes: Routes = [
  { path: '', redirectTo: 'user', pathMatch: 'full' },
  { path: 'user', component: UserPage },
  { path: 'role', component: RolePage  },
  { path: 'employee', component: EmployeePage  }
];
