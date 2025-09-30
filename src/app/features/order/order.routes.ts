// src/app/features/order/order.routes.ts
import { Routes } from '@angular/router';
import { OrderListPage } from './pages/order-list/order-list-page';
import { CreateOrderPage } from './pages/create-order/create-order-page';

export const orderRoutes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list',   
    component: OrderListPage,
   },
  { path: 'create', 
    component: CreateOrderPage,
  },
]