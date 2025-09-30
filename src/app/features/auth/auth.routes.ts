import { Routes } from '@angular/router';
import { LoginPage } from './pages/login-page/login-page';

export const authRoutes: Routes = [
  // when navigating to '/login', load this page
  { path: '', component: LoginPage }
];