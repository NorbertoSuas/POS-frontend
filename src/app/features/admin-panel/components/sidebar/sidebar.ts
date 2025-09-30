import { Component, computed, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, FileIcon } from 'lucide-angular';
import { NavItem } from '../../../../core/models/nav-item';
import { NAV_MENU } from '../../../../core/config/nav.config';
import { IconService } from '../../../../shared/services/icon';
import { LoginService } from '../../../auth/services/login.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule,LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  // controls general collapse
  collapsed = signal(false);
  // icons
  readonly FileIcon = signal(FileIcon);
  // reactive nav config
  readonly navMenu = signal<NavItem[]>(NAV_MENU);
  // State of expanded submenus (by route)
  private expandedSubmenus = signal<Record<string, boolean>>({});

  constructor(
    private iconService: IconService,
    private readonly loginService: LoginService
  ) {}

  toggleSubmenu(route: string) {
    const current = this.expandedSubmenus();
    this.expandedSubmenus.set({
      ...current,
      [route]: !current[route]
    });
  }

  isSubmenuExpanded(route: string): boolean {
    return !!this.expandedSubmenus()[route];
  }

  toggleSidebar() {
    this.collapsed.set(!this.collapsed());
  }
  getIconHref(name: string): string {
    return this.iconService.getIconHref(name);
  }

  logout() {
    this.loginService.logout();
  }

}