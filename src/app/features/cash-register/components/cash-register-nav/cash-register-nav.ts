import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cash-register-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cash-register-nav.html',
  styleUrl: './cash-register-nav.css'
})
export class CashRegisterNavComponent {
  navItems = [
    {
      label: 'Dashboard',
      icon: 'chart-pie',
      route: '/admin-panel/cash-register/dashboard',
      description: 'Overview and statistics'
    },
    {
      label: 'Sessions',
      icon: 'clock',
      route: '/admin-panel/cash-register/sessions',
      description: 'Manage cash register sessions'
    },
    {
      label: 'Movements',
      icon: 'arrow-left-right',
      route: '/admin-panel/cash-register/movements',
      description: 'Track and manage transactions'
    },
    {
      label: 'Movement Types',
      icon: 'tag',
      route: '/admin-panel/cash-register/movement-types',
      description: 'Configure movement categories'
    },
    {
      label: 'Reports & Analytics',
      icon: 'chart-bar',
      route: '/admin-panel/cash-register/reports',
      description: 'Comprehensive reporting and analytics'
    },
    {
      label: 'Approvals',
      icon: 'shield-check',
      route: '/admin-panel/cash-register/approvals',
      description: 'Manage approval workflows and discrepancies'
    },
    {
      label: 'Management',
      icon: 'cog',
      route: '/admin-panel/cash-register/management',
      description: 'Create and manage cash registers'
    }
  ];
}
