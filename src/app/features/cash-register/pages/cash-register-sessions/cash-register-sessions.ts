import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegisterSessionService } from '../../services/cash-register-session.service';
import { CashRegister, CashRegisterSession, CashRegisterSessionCreateRequest, CashRegisterSessionCloseRequest } from '../../models';
import { interval, Subscription } from 'rxjs';
import { LoginService } from '../../../auth/services/login.service';

@Component({
  selector: 'app-cash-register-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonExport, GenericModal],
  templateUrl: './cash-register-sessions.html',
  styleUrl: './cash-register-sessions.css'
})
export class CashRegisterSessionsPage implements OnInit, OnDestroy {
  showOpenSessionModal = false;
  showCloseSessionModal = false;
  showCreateSessionModal = false;
  showCashRegisterModal = false;
  selectedCashRegister: CashRegister | null = null;
  selectedSession: CashRegisterSession | null = null;
  selectedCashRegisterForCreate: number | null = null;
  editingCashRegister: CashRegister | null = null;
  openSessionForm!: FormGroup;
  closeSessionForm!: FormGroup;
  createSessionForm!: FormGroup;
  cashRegisterForm!: FormGroup;
  private refreshSubscription?: Subscription;

   constructor(
    public cashRegisterService: CashRegisterService,
    public sessionService: CashRegisterSessionService,
    private readonly fb: FormBuilder,
    private readonly loginService: LoginService
  ) {
    this.openSessionForm = this.fb.group({
      openingBalance: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });

    this.closeSessionForm = this.fb.group({
      closingBalance: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });

    this.createSessionForm = this.fb.group({
      openingBalance: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });

    this.cashRegisterForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      branchId: [0, [Validators.required, Validators.min(1)]],
      initialBalance: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadData(): void {
    this.cashRegisterService.loadCashRegisters();
    this.sessionService.loadSessions();
    this.sessionService.loadSessionStatuses();
  }

  startAutoRefresh(): void {
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadData();
    });
  }

  openCreateSessionModalFromRegister(cashRegister: CashRegister): void {
    this.selectedCashRegister = cashRegister;
    this.openSessionForm.patchValue({
      openingBalance: cashRegister.currentBalance,
      notes: ''
    });
    this.showOpenSessionModal = true;
  }

  openCloseSessionModal(session: CashRegisterSession): void {
    this.selectedSession = session;
    this.closeSessionForm.patchValue({
      closingBalance: session.openingBalance,
      notes: ''
    });
    this.showCloseSessionModal = true;
  }

  closeOpenSessionModal(): void {
    this.showOpenSessionModal = false;
    this.selectedCashRegister = null;
    this.openSessionForm.reset();
  }

  closeCloseSessionModal(): void {
    this.showCloseSessionModal = false;
    this.selectedSession = null;
    this.closeSessionForm.reset();
  }

  openCreateSessionModal(): void {
    this.showCreateSessionModal = true;
    this.selectedCashRegisterForCreate = null;
    this.createSessionForm.reset();
  }

  closeCreateSessionModal(): void {
    this.showCreateSessionModal = false;
    this.selectedCashRegisterForCreate = null;
    this.createSessionForm.reset();
  }

  openCreateCashRegisterModal(): void {
    this.editingCashRegister = null;
    this.cashRegisterForm.reset();
    this.showCashRegisterModal = true;
  }

  openEditCashRegisterModal(cashRegister: CashRegister): void {
    this.editingCashRegister = cashRegister;
    this.cashRegisterForm.patchValue({
      name: cashRegister.name,
      description: cashRegister.description || '',
      branchId: cashRegister.branchId,
      initialBalance: cashRegister.initialBalance
    });
    this.showCashRegisterModal = true;
  }

  closeCashRegisterModal(): void {
    this.showCashRegisterModal = false;
    this.editingCashRegister = null;
    this.cashRegisterForm.reset();
  }

  openSession(): void {
    if (this.openSessionForm.valid && this.selectedCashRegister) {
      const sessionData: CashRegisterSessionCreateRequest = {
        cashRegisterId: this.selectedCashRegister.id!,
        employeeId: this.getCurrentEmployeeId(),
        openingBalance: this.openSessionForm.value.openingBalance,
        notes: this.openSessionForm.value.notes
      };

      this.sessionService.openSession(sessionData).subscribe({
        next: (result: any) => {
          if (result) {
            this.closeOpenSessionModal();
            this.loadData();
          }
        },
        error: (error: any) => {
          console.error('Error opening session:', error);
        }
      });
    }
  }

  closeSession(): void {
    if (this.closeSessionForm.valid && this.selectedSession) {
      const closeData: CashRegisterSessionCloseRequest = {
        closingBalance: this.closeSessionForm.value.closingBalance,
        notes: this.closeSessionForm.value.notes
      };

      this.sessionService.closeSession(this.selectedSession.id!, closeData).subscribe({
        next: (result: any) => {
          if (result) {
            this.closeCloseSessionModal();
            this.loadData();
          }
        },
        error: (error: any) => {
          console.error('Error closing session:', error);
        }
      });
    }
  }

  createSession(): void {
    if (this.createSessionForm.valid && this.selectedCashRegisterForCreate) {
      const sessionData: CashRegisterSessionCreateRequest = {
        cashRegisterId: this.selectedCashRegisterForCreate,
        employeeId: this.getCurrentEmployeeId(),
        openingBalance: this.createSessionForm.value.openingBalance,
        notes: this.createSessionForm.value.notes
      };

      this.sessionService.openSession(sessionData).subscribe({
        next: (result: any) => {
          if (result) {
            this.closeCreateSessionModal();
            this.loadData();
          }
        },
        error: (error: any) => {
          console.error('Error creating session:', error);
        }
      });
    }
  }

  saveCashRegister(): void {
    if (this.cashRegisterForm.valid) {
      const cashRegisterData = {
        name: this.cashRegisterForm.value.name,
        description: this.cashRegisterForm.value.description,
        branchId: this.cashRegisterForm.value.branchId,
        initialBalance: this.cashRegisterForm.value.initialBalance
      };

      if (this.editingCashRegister) {
        // Update existing cash register
        this.cashRegisterService.update(this.editingCashRegister.id!, cashRegisterData).subscribe({
          next: (result: any) => {
            if (result) {
              this.closeCashRegisterModal();
              this.loadData();
            }
          },
          error: (error: any) => {
            console.error('Error updating cash register:', error);
          }
        });
      } else {
        // Create new cash register
        this.cashRegisterService.create(cashRegisterData).subscribe({
          next: (result: any) => {
            if (result) {
              this.closeCashRegisterModal();
              this.loadData();
            }
          },
          error: (error: any) => {
            console.error('Error creating cash register:', error);
          }
        });
      }
    }
  }

  getCashRegisterStatus(cashRegister: CashRegister): string {
    if (!cashRegister.isActive) {
      return 'Inactive';
    }
    
    if (this.sessionService.hasActiveSession(cashRegister.id!)) {
      return 'In Use';
    }
    
    return 'Available';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'In Use':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Maintenance':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  }

  getSessionStatus(session: CashRegisterSession): string {
    return session.status;
  }

  getSessionStatusClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'Suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  }

  getActiveSession(cashRegisterId: number): CashRegisterSession | undefined {
    return this.sessionService.getActiveSession(cashRegisterId);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalActiveSessions(): number {
    return this.sessionService.activeSessions().length;
  }

  getTotalSessions(): number {
    return this.sessionService.sessions().length;
  }

  getTotalBalance(): number {
    return this.cashRegisterService.cashRegisters().reduce((total, cr) => total + cr.currentBalance, 0);
  }

  getAvailableCashRegistersCount(): number {
    return this.cashRegisterService.cashRegisters().filter(cr => this.getCashRegisterStatus(cr) === 'Available').length;
  }

  // New session-specific methods
  getTodaySessions(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.sessionService.sessions().filter(session => {
      const sessionDate = new Date(session.openDate);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    }).length;
  }

  getAverageSessionDuration(): string {
    const closedSessions = this.sessionService.sessions().filter(s => s.status === 'Closed' && s.closeDate);
    if (closedSessions.length === 0) return '0h 0m';
    
    const totalMinutes = closedSessions.reduce((total, session) => {
      if (session.closeDate) {
        const duration = this.getSessionDurationInMinutes(session.openDate, session.closeDate);
        return total + duration;
      }
      return total;
    }, 0);
    
    const avgMinutes = Math.round(totalMinutes / closedSessions.length);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  }

  getTotalSessionValue(): number {
    return this.sessionService.sessions().reduce((total, session) => {
      return total + session.openingBalance;
    }, 0);
  }

  getRecentSessions(): CashRegisterSession[] {
    return this.sessionService.sessions()
      .filter(session => session.status === 'Closed')
      .sort((a, b) => {
        const dateA = a.closeDate || a.openDate;
        const dateB = b.closeDate || b.openDate;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 10);
  }

  getSessionDuration(openDate: Date, closeDate: Date): string {
    const open = new Date(openDate);
    const close = new Date(closeDate);
    const diff = close.getTime() - open.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  private getSessionDurationInMinutes(openDate: Date, closeDate: Date): number {
    const open = new Date(openDate);
    const close = new Date(closeDate);
    const diff = close.getTime() - open.getTime();
    return Math.floor(diff / (1000 * 60));
  }

  refreshData(): void {
    this.loadData();
  }

  viewSessionDetails(session: CashRegisterSession): void {
    // Navigate to session details or show detailed modal
    console.log('View session details:', session);
    // For now, we'll just log the session details
    // In the future, this could open a detailed modal or navigate to a dedicated details page
    alert(`Session Details:\nID: ${session.id}\nCash Register: ${this.getCashRegisterName(session.cashRegisterId)}\nStatus: ${session.status}\nOpening Balance: ${this.formatCurrency(session.openingBalance)}\nOpened: ${this.formatDate(session.openDate)}`);
  }

  getCashRegisterName(cashRegisterId: number): string {
    const cashRegister = this.cashRegisterService.cashRegisters().find(cr => cr.id === cashRegisterId);
    return cashRegister?.name || 'Unknown';
  }

  getDuration(openDate: Date): string {
    const now = new Date();
    const open = new Date(openDate);
    const diff = now.getTime() - open.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  private getCurrentEmployeeId(): number {
    const currentUser = this.loginService.getCurrentUser();
    if (currentUser?.id) {
      // Convert string user ID to number for employee ID, fallback to 1 if conversion fails
      const employeeId = parseInt(currentUser.id, 10);
      return isNaN(employeeId) ? 1 : employeeId;
    }
    // Fallback to default employee ID if no user is logged in
    return 1;
  }

  getAvailableCashRegisters(): CashRegister[] {
    return this.cashRegisterService.cashRegisters().filter(cashRegister => 
      this.getCashRegisterStatus(cashRegister) === 'Available'
    );
  }

  getSelectedCashRegisterName(): string {
    if (!this.selectedCashRegisterForCreate) return '';
    const cashRegister = this.cashRegisterService.cashRegisters().find(cr => cr.id === this.selectedCashRegisterForCreate);
    return cashRegister?.name || '';
  }

  getSelectedCashRegisterBalance(): string {
    if (!this.selectedCashRegisterForCreate) return '';
    const cashRegister = this.cashRegisterService.cashRegisters().find(cr => cr.id === this.selectedCashRegisterForCreate);
    return cashRegister ? this.formatCurrency(cashRegister.currentBalance) : '';
  }

  onCashRegisterSelectionChange(): void {
    if (this.selectedCashRegisterForCreate) {
      const cashRegister = this.cashRegisterService.cashRegisters().find(cr => cr.id === this.selectedCashRegisterForCreate);
      if (cashRegister) {
        this.createSessionForm.patchValue({
          openingBalance: cashRegister.currentBalance
        });
      }
    }
  }

  getRegisterStatusData(): any[] {
    return this.cashRegisterService.cashRegisters().map(cr => ({
      name: cr.name,
      status: this.getCashRegisterStatus(cr),
      balance: cr.currentBalance,
      branchId: cr.branchId
    }));
  }

  viewActiveSession(cashRegister: CashRegister): void {
    // Navigate to sessions page to view active session
    console.log('View active session for:', cashRegister.name);
    // You could implement navigation to a specific session or highlight it in the sessions list
  }
}
