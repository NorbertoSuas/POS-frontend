import { Injectable } from '@angular/core';
import { Router, Routes, Route } from '@angular/router';
import { NavItem } from '../models/nav-item';

@Injectable({ providedIn: 'root' })
export class NavItemService {
  constructor(private router: Router) {}

  /** Builds the menu from the child routes of `admin-panel` */
  getMenu(): NavItem[] {
    // 1) search for the "admin-panel" route in your main configuration
    const adminRoute = this.router.config.find(r => r.path === 'admin-panel');

    // 2) extract its children (or empty array if not found)
    const children: Routes = adminRoute?.children ?? [];

    // 3) build the menu using only those routes
    return this.buildMenu(children, '/admin-panel');
  }

  private buildMenu(routes: Routes, parentPath: string): NavItem[] {
    return routes
      .filter(route => route.data && route.data['nav'])
      .map(route => this.routeToNavItem(route, parentPath))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  private routeToNavItem(route: Route, parentPath: string): NavItem {
    const meta = route.data!['nav'] as {
      label: string;
      icon: string;
      order?: number;
    };

    // build the complete URL
    const fullPath = `${parentPath}/${route.path}`;

    const item: NavItem = {
      label: meta.label,
      icon: meta.icon,
      route: fullPath,
      order: meta.order
    };

    // recursion for sub-modules
    if (route.children) {
      item.children = this.buildMenu(route.children, fullPath);
    }

    return item;
  }
}