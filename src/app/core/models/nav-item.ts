// src/app/core/navigation/nav-item.ts
export interface NavItem {
  label: string;
  icon: string;           // icon name (Material or Lucide)
  route: string;          // absolute route, e.g. '/admin-panel/order/list'
  children?: NavItem[];   // sub-modules
  order?: number;         // for sorting in the menu
}