import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegisterSessionService } from '../../services/cash-register-session.service';
import { CashRegisterMovementService } from '../../services/cash-register-movement.service';
import { CashRegisterApprovalService } from '../../services/cash-register-approval.service';
import { LoginService } from '../../../auth/services/login.service';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';

interface QuickAction {
  title: string;
  icon: string;
  description: string;
  action: string;
  route?: string;
  color: string;
}

interface TodayStats {
  totalMovements: number;
  totalAmount: number;
  sessionStatus: string;
  pendingCorrections: number;
  currentBalance: number;
}

@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GenericModal],
  templateUrl: './cashier-dashboard.html',
  styleUrl: './cashier-dashboard.css'
})
export class CashierDashboardPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly loginService = inject(LoginService);
  
  // Services
  public cashRegisterService = inject(CashRegisterService);
  public sessionService = inject(CashRegisterSessionService);
  public movementService = inject(CashRegisterMovementService);
  public approvalService = inject(CashRegisterApprovalService);

  // Component state
  showCorrectionModal = signal(false);
  
  // Forms
  correctionForm: FormGroup;
  
  // Auto-refresh
  private refreshSubscription?: Subscription;

  // Quick actions for cashiers
  quickActions: QuickAction[] = [
    {
      title: 'View Movements',
      icon: 'list',
      description: 'Manage today\'s movements',
      action: 'viewMovements',
      route: '/admin-panel/cash-register/movements',
      color: 'blue'
    },
    {
      title: 'Report Correction',
      icon: 'alert-triangle',
      description: 'Request movement correction',
      action: 'reportCorrection',
      color: 'orange'
    },
    {
      title: 'Close Session',
      icon: 'stop-circle',
      description: 'End current session',
      action: 'closeSession',
      color: 'red'
    }
  ];

  constructor() {
    this.correctionForm = this.fb.group({
      movementId: ['', Validators.required],
      correctionType: ['', Validators.required],
      currentValue: ['', Validators.required],
      proposedValue: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      urgency: ['medium', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  // Computed properties
  currentUser = computed(() => this.loginService.getCurrentUser());
  todayDate = new Date();
  
  todayStats = computed((): TodayStats => {
    const movements = this.movementService.movements();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayMovements = movements.filter(movement => {
      const movementDate = new Date(movement.movementDate);
      movementDate.setHours(0, 0, 0, 0);
      return movementDate.getTime() === today.getTime();
    });

    const totalAmount = todayMovements.reduce((sum, movement) => sum + movement.amount, 0);
    const activeSessions = this.sessionService.activeSessions();
    const pendingCorrections = this.approvalService.pendingDiscrepancies().length;

    return {
      totalMovements: todayMovements.length,
      totalAmount,
      sessionStatus: activeSessions.length > 0 ? 'Active' : 'Inactive',
      pendingCorrections,
      currentBalance: activeSessions.length > 0 ? activeSessions[0].openingBalance + totalAmount : 0
    };
  });

  // Data loading
  async loadData() {
    try {
      await Promise.all([
        this.cashRegisterService.loadCashRegisters(),
        this.sessionService.loadSessions(),
        this.movementService.loadMovements(),
        this.approvalService.loadDiscrepancyReports()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  setupAutoRefresh() {
    // Refresh data every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadData();
    });
  }

  // Quick actions
  executeAction(action: QuickAction) {
    switch (action.action) {
      case 'viewMovements':
        this.router.navigate([action.route]);
        break;
      case 'reportCorrection':
        this.openCorrectionModal();
        break;
      case 'closeSession':
        this.closeCurrentSession();
        break;
    }
  }

  // Session management
  async closeCurrentSession() {
    try {
      const activeSessions = this.sessionService.activeSessions();
      if (activeSessions.length > 0) {
        // Here you would implement the close session logic
        console.log('Closing current session');
        await this.loadData();
      }
      
      // Show confirmation before logout
      if (confirm('Are you sure you want to close the session and logout?')) {
        // After closing session, logout the user
        this.loginService.logout();
      }
    } catch (error) {
      console.error('Error closing session:', error);
      // Still logout even if there's an error
      this.loginService.logout();
    }
  }

  // Correction management
  openCorrectionModal() {
    this.showCorrectionModal.set(true);
    this.correctionForm.reset();
  }

  closeCorrectionModal() {
    this.showCorrectionModal.set(false);
    this.correctionForm.reset();
  }

  async submitCorrection() {
    if (this.correctionForm.valid) {
      try {
        const formValue = this.correctionForm.value;
        // Here you would call the approval service to create a correction request
        console.log('Submitting correction:', formValue);
        this.closeCorrectionModal();
        await this.loadData();
      } catch (error) {
        console.error('Error submitting correction:', error);
      }
    }
  }


  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Active': 'status-active',
      'Inactive': 'status-inactive',
      'Pending': 'status-pending'
    };
    return statusClasses[status] || 'status-default';
  }

  getActionClass(color: string): string {
    const colorClasses: { [key: string]: string } = {
      'green': 'action-green',
      'blue': 'action-blue',
      'orange': 'action-orange',
      'red': 'action-red',
      'purple': 'action-purple',
      'gray': 'action-gray'
    };
    return colorClasses[color] || 'action-default';
  }
}
