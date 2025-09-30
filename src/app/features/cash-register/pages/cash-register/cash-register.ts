import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';

import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegisterSessionService } from '../../services/cash-register-session.service';
import { CashRegister } from '../../models';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GenericModal],
  templateUrl: './cash-register.html',
  styleUrl: './cash-register.css'
})
export class CashRegisterPage implements OnInit, OnDestroy {
  showModal = false;
  editingCashRegister: CashRegister | null = null;
  cashRegisterForm: FormGroup;
  private refreshSubscription?: Subscription;

  constructor(
    public cashRegisterService: CashRegisterService,
    public sessionService: CashRegisterSessionService,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {
    this.cashRegisterForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      branchId: ['', Validators.required],
      initialBalance: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadCashRegisters();
    this.sessionService.loadSessions();
    // Refresh cash register status every 30 seconds for real-time updates
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadCashRegisters() {
    this.cashRegisterService.loadCashRegisters().subscribe();
  }

  startAutoRefresh() {
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.cashRegisterService.loadCashRegisters().subscribe();
      this.sessionService.loadSessions().subscribe();
    });
  }


  openEditModal(cashRegister: CashRegister) {
    this.editingCashRegister = cashRegister;
    this.cashRegisterForm.patchValue({
      name: cashRegister.name,
      description: cashRegister.description || '',
      branchId: cashRegister.branchId,
      initialBalance: cashRegister.initialBalance
    });
    this.showModal = true;
  }

  saveCashRegister() {
    if (this.cashRegisterForm.valid) {
      const cashRegisterData = this.cashRegisterForm.value;

      if (this.editingCashRegister) {
        // Update existing cash register
        this.cashRegisterService.update(this.editingCashRegister.id!, cashRegisterData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error updating cash register:', error)
        });
      } else {
        // Create new cash register
        this.cashRegisterService.create(cashRegisterData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error creating cash register:', error)
        });
      }
    }
  }

  deleteCashRegister(cashRegister: CashRegister) {
    if (confirm(`Are you sure you want to delete ${cashRegister.name}?`)) {
      this.cashRegisterService.delete(cashRegister.id!).subscribe({
        error: (error) => console.error('Error deleting cash register:', error)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingCashRegister = null;
    this.cashRegisterForm.reset();
  }

  // Get statistics for dashboard
  getTotalCashRegisters(): number {
    return this.cashRegisterService.cashRegisters().length;
  }

  getActiveCashRegisters(): number {
    return this.cashRegisterService.cashRegisters().filter(cr => cr.isActive).length;
  }

  getTotalBalance(): number {
    return this.cashRegisterService.cashRegisters()
      .filter(cr => cr.isActive)
      .reduce((total, cr) => total + cr.currentBalance, 0);
  }


  // Format currency for display
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  openSessionFromDashboard(cashRegister: CashRegister) {
    // Navigate to sessions page or show session modal
    console.log('Open session requested for:', cashRegister.name);
  }

  closeSessionFromDashboard(cashRegister: CashRegister) {
    // Navigate to sessions page or show close session modal
    console.log('Close session requested for:', cashRegister.name);
  }

  // New dashboard-specific methods
  getAvailableCashRegisters(): number {
    return this.cashRegisterService.cashRegisters().filter(cr => this.getCashRegisterStatus(cr) === 'Available').length;
  }

  getInUseRegisters(): number {
    return this.cashRegisterService.cashRegisters().filter(cr => this.getCashRegisterStatus(cr) === 'In Use').length;
  }

  getAverageBalance(): number {
    const activeRegisters = this.cashRegisterService.cashRegisters().filter(cr => cr.isActive);
    if (activeRegisters.length === 0) return 0;
    
    const totalBalance = activeRegisters.reduce((total, cr) => total + cr.currentBalance, 0);
    return totalBalance / activeRegisters.length;
  }

  getTopPerformingRegisters(): CashRegister[] {
    return this.cashRegisterService.cashRegisters()
      .filter(cr => cr.isActive)
      .sort((a, b) => b.currentBalance - a.currentBalance)
      .slice(0, 5);
  }

  getActiveSessionsCount(): number {
    return this.sessionService.activeSessions().length;
  }

  getLastUpdateTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }


  // Navigation methods
  navigateToSessions(): void {
    this.router.navigate(['/admin-panel/cash-register/sessions']);
  }

  navigateToMovements(): void {
    this.router.navigate(['/admin-panel/cash-register/movements']);
  }

  navigateToReports(): void {
    this.router.navigate(['/admin-panel/cash-register/reports']);
  }

  navigateToApprovals(): void {
    this.router.navigate(['/admin-panel/cash-register/approvals']);
  }

  // Quick actions

  getCashRegisterStatus(cashRegister: CashRegister): string {
    if (!cashRegister.isActive) {
      return 'Inactive';
    }
    
    // Check if there's an active session for this cash register
    const hasActiveSession = this.sessionService.activeSessions().some(session => 
      session.cashRegisterId === cashRegister.id
    );
    
    return hasActiveSession ? 'In Use' : 'Available';
  }

  refreshDashboard(): void {
    this.loadCashRegisters();
    this.sessionService.loadSessions();
  }
}
