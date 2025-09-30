import { NavItem } from '../models/nav-item';

export const NAV_MENU: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'chart-pie',
    route: '/admin-panel/dashboard',
    order: 0
  },
  {
    label: 'Cash Register',
    icon: 'circle-dollar-sign',
    route: '/admin-panel/cash-register',
    order: 1,
    children: [
      {
        label: 'Dashboard',
        icon: 'chart-pie',
        route: '/admin-panel/cash-register/dashboard',
        order: 0
      },
      {
        label: 'Cashier Dashboard',
        icon: 'user-circle',
        route: '/admin-panel/cash-register/cashier',
        order: 1
      },
      {
        label: 'Sessions',
        icon: 'clock',
        route: '/admin-panel/cash-register/sessions',
        order: 2
      }
    ]
  },
  {
    label: 'Orders',
    icon: 'notepad-text',
    route: '/admin-panel/order',
    order: 2,
    children: [
      {
        label: 'Create Order',
        icon: 'plus',
        route: '/admin-panel/order/create',
        order: 0
      },
      {
        label: 'Order List',
        icon: 'list',
        route: '/admin-panel/order/list',
        order: 1
      }
    ]
  },
  {
    label: 'Inventory',
    icon: 'package',
    route: '/admin-panel/inventory',
    order: 3,
    children: [
      {
        label: 'Products',
        icon: 'box',
        route: '/admin-panel/inventory/products',
        order: 0
      },
      {
        label: 'Product Types',
        icon: 'tags',
        route: '/admin-panel/inventory/product-types',
        order: 1
      },
      {
        label: 'Product Taxes',
        icon: 'receipt',
        route: '/admin-panel/inventory/product-taxes',
        order: 2
      },
      {
        label: 'Prices',
        icon: 'dollar-sign',
        route: '/admin-panel/inventory/prices',
        order: 3
      },
      {
        label: 'Product Prices',
        icon: 'tag',
        route: '/admin-panel/inventory/product-prices',
        order: 4
      },
      {
        label: 'Warehouses',
        icon: 'warehouse',
        route: '/admin-panel/inventory/warehouses',
        order: 5
      },
      {
        label: 'Storage Types',
        icon: 'layers',
        route: '/admin-panel/inventory/storage-types',
        order: 6
      },
      {
        label: 'Detail Storage Types',
        icon: 'layers-3',
        route: '/admin-panel/inventory/detail-storage-types',
        order: 7
      },
      {
        label: 'Inventories',
        icon: 'clipboard-list',
        route: '/admin-panel/inventory/inventories',
        order: 8
      },
      {
        label: 'Inventory Movements',
        icon: 'arrow-left-right',
        route: '/admin-panel/inventory/inventory-movements',
        order: 9
      },
      {
        label: 'Movement Types',
        icon: 'repeat',
        route: '/admin-panel/inventory/movement-types',
        order: 10
      },
      {
        label: 'Suppliers',
        icon: 'truck',
        route: '/admin-panel/inventory/suppliers',
        order: 11
      }
    ]
  },
  {
    label: 'Users',
    icon: 'user',
    route: '/admin-panel/user',
    order: 4,
    children: [
      {
        label: 'User',
        icon: 'user',
        route: '/admin-panel/user/user',
        order: 0
      },
      {
        label: 'Role',
        icon: 'shield',
        route: '/admin-panel/user/role',
        order: 1
      },
      {
        label: 'Employee',
        icon: 'users',
        route: '/admin-panel/user/employee',
        order: 2
      }
    ]
  },
  {
    label: 'Audit',
    icon: 'shield-check',
    route: '/admin-panel/audit',
    order: 5,
    children: [
      {
        label: 'Audit Logs',
        icon: 'file-text',
        route: '/admin-panel/audit/logs',
        order: 0
      }
    ]
  }
];