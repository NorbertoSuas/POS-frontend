import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashRegister, CashRegisterStatus } from '../../models';
import { CashRegisterSessionService } from '../../services/cash-register-session.service';

@Component({
  selector: 'app-cash-register-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cash-register-status.html',
  styleUrl: './cash-register-status.css'
})
export class CashRegisterStatusComponent implements OnInit {
  @Input() cashRegisters: CashRegister[] = [];
  @Input() showActiveOnly = true;
  @Input() refreshInterval = 30000; // 30 seconds
  
  @Output() cashRegisterSelected = new EventEmitter<CashRegister>();
  @Output() openSessionRequested = new EventEmitter<CashRegister>();
  @Output() closeSessionRequested = new EventEmitter<CashRegister>();

  filteredCashRegisters: CashRegister[] = [];
  private sessionService = inject(CashRegisterSessionService);

  ngOnInit() {
    this.filterCashRegisters();
  }

  ngOnChanges() {
    this.filterCashRegisters();
  }

  filterCashRegisters() {
    if (this.showActiveOnly) {
      this.filteredCashRegisters = this.cashRegisters.filter(cr => cr.isActive);
    } else {
      this.filteredCashRegisters = this.cashRegisters;
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

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Available':
        return 'icon-check-circle';
      case 'In Use':
        return 'icon-clock';
      case 'Suspended':
        return 'icon-pause-circle';
      case 'Maintenance':
        return 'icon-tools';
      case 'Inactive':
        return 'icon-x-circle';
      default:
        return 'icon-help-circle';
    }
  }

  onCashRegisterClick(cashRegister: CashRegister) {
    this.cashRegisterSelected.emit(cashRegister);
  }

  onOpenSession(cashRegister: CashRegister, event: Event) {
    event.stopPropagation();
    this.openSessionRequested.emit(cashRegister);
  }

  onCloseSession(cashRegister: CashRegister, event: Event) {
    event.stopPropagation();
    this.closeSessionRequested.emit(cashRegister);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

