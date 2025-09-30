import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products-page').then(m => m.ProductsPage)
  },
  {
    path: 'product-types',
    loadComponent: () => import('./pages/product-types/product-types-page').then(m => m.ProductTypesPage)
  },
  {
    path: 'product-taxes',
    loadComponent: () => import('./pages/product-taxes/product-taxes-page').then(m => m.ProductTaxesPage)
  },
  {
    path: 'prices',
    loadComponent: () => import('./pages/prices/prices-page').then(m => m.PricesPage)
  },
  {
    path: 'product-prices',
    loadComponent: () => import('./pages/product-prices/product-prices-page').then(m => m.ProductPricesPage)
  },
  {
    path: 'warehouses',
    loadComponent: () => import('./pages/warehouses/warehouses-page').then(m => m.WarehousesPage)
  },
  {
    path: 'storage-types',
    loadComponent: () => import('./pages/storage-types/storage-types-page').then(m => m.StorageTypesPage)
  },
  {
    path: 'detail-storage-types',
    loadComponent: () => import('./pages/detail-storage-types/detail-storage-types-page').then(m => m.DetailStorageTypesPage)
  },
  {
    path: 'inventories',
    loadComponent: () => import('./pages/inventories/inventories-page').then(m => m.InventoriesPage)
  },
  {
    path: 'inventory-movements',
    loadComponent: () => import('./pages/inventory-movements/inventory-movements-page').then(m => m.InventoryMovementsPage)
  },
  {
    path: 'movement-types',
    loadComponent: () => import('./pages/movement-types/movement-types-page').then(m => m.MovementTypesPage)
  },
  {
    path: 'suppliers',
    loadComponent: () => import('./pages/suppliers/suppliers-page').then(m => m.SuppliersPage)
  }
]; 