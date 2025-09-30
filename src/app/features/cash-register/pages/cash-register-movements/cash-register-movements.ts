import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegisterMovementService } from '../../services/cash-register-movement.service';
import { CashRegisterMovement, CashRegisterMovementCreateRequest, CashRegisterMovementUpdateRequest } from '../../models';


@Component({
  selector: 'app-cash-register-movements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cash-register-movements.html',
  styleUrls: ['./cash-register-movements.css']
})
export class CashRegisterMovementsPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  
  // Make services public so they can be accessed in template
  public cashRegisterService = inject(CashRegisterService);
  public movementService = inject(CashRegisterMovementService);

  // Component state
  showModal = signal(false);
  editingMovement = signal<CashRegisterMovement | null>(null);
  
  // Filter state
  startDate = signal<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  endDate = signal<Date>(new Date());
  selectedCashRegisterId = signal<number | ''>('');
  selectedMovementTypeId = signal<number | ''>('');

  // Form
  movementForm: FormGroup;

  constructor() {
    this.movementForm = this.fb.group({
      cashRegisterId: ['', Validators.required],
      movementTypeId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: [''],
      reference: ['']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  // Load initial data
  loadData() {
    this.cashRegisterService.loadCashRegisters();
    this.movementService.loadMovements();
    this.movementService.loadMovementTypes();
  }

  // Refresh movements data
  refreshMovements() {
    this.movementService.loadMovements();
  }

  // Computed properties
  filteredMovements = computed(() => {
    let movements = this.movementService.movements();
    
    // Filter by cash register
    if (this.selectedCashRegisterId()) {
      movements = movements.filter(m => m.cashRegisterId === this.selectedCashRegisterId());
    }
    
    // Filter by movement type
    if (this.selectedMovementTypeId()) {
      movements = movements.filter(m => m.movementTypeId === this.selectedMovementTypeId());
    }
    
    // Filter by date range
    if (this.startDate() && this.endDate()) {
      movements = movements.filter(m => {
        const movementDate = new Date(m.movementDate);
        return movementDate >= this.startDate() && movementDate <= this.endDate();
      });
    }
    
    return movements;
  });

  // Event handlers for form inputs
  onStartDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value) {
      this.startDate.set(new Date(target.value));
    }
  }

  onEndDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value) {
      this.endDate.set(new Date(target.value));
    }
  }

  onCashRegisterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCashRegisterId.set(target.value ? Number(target.value) : '');
  }

  onMovementTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedMovementTypeId.set(target.value ? Number(target.value) : '');
  }

  // Filter methods
  filterByDateRange() {
    if (this.startDate() && this.endDate()) {
      this.movementService.loadMovementsByDateRange(this.startDate(), this.endDate());
    }
  }

  filterByCashRegister() {
    if (this.selectedCashRegisterId()) {
      this.movementService.loadMovementsByCashRegister(this.selectedCashRegisterId() as number);
    } else {
      this.movementService.loadMovements();
    }
  }

  filterByMovementType() {
    // This is handled by the computed property
    // Just refresh the view
  }

  clearFilters() {
    this.startDate.set(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    this.endDate.set(new Date());
    this.selectedCashRegisterId.set('');
    this.selectedMovementTypeId.set('');
    this.movementService.loadMovements();
  }

  refreshData() {
    this.loadData();
  }

  // Export data
  exportData() {
    const movements = this.filteredMovements();
    const csvContent = this.convertToCSV(movements);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'movements.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(movements: CashRegisterMovement[]): string {
    const headers = ['Date', 'Cash Register', 'Type', 'Description', 'Amount', 'Reference'];
    const rows = movements.map(m => [
      this.formatDate(m.movementDate),
      this.getCashRegisterName(m.cashRegisterId),
      this.getMovementTypeName(m.movementTypeId),
      m.description || '',
      m.amount.toString(),
      m.reference || ''
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  // Modal methods
  openCreateModal() {
    this.editingMovement.set(null);
    this.movementForm.reset();
    this.showModal.set(true);
  }

  openEditModal(movement: CashRegisterMovement) {
    this.editingMovement.set(movement);
    this.movementForm.patchValue({
      cashRegisterId: movement.cashRegisterId,
      movementTypeId: movement.movementTypeId,
      amount: movement.amount,
      description: movement.description,
      reference: movement.reference
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingMovement.set(null);
    this.movementForm.reset();
  }

  // Form submission
  saveMovement() {
    if (this.movementForm.valid) {
      const formValue = this.movementForm.value;
      
      if (this.editingMovement()) {
        // Update existing movement
        const updateRequest: CashRegisterMovementUpdateRequest = {
          amount: formValue.amount,
          description: formValue.description,
          reference: formValue.reference
        };
        
        this.movementService.update(this.editingMovement()!.id!, updateRequest).subscribe(() => {
          this.closeModal();
        });
      } else {
        // Create new movement
        const createRequest: CashRegisterMovementCreateRequest = {
          cashRegisterId: formValue.cashRegisterId,
          movementTypeId: formValue.movementTypeId,
          amount: formValue.amount,
          description: formValue.description,
          reference: formValue.reference
        };
        
        this.movementService.create(createRequest).subscribe(() => {
          this.closeModal();
        });
      }
    }
  }

  // Delete movement
  deleteMovement(movement: CashRegisterMovement) {
    if (confirm('Are you sure you want to delete this movement?')) {
      this.movementService.delete(movement.id!).subscribe();
    }
  }

  // Helper methods
  getCashRegisterName(cashRegisterId: number): string {
    const cashRegister = this.cashRegisterService.cashRegisters().find(cr => cr.id === cashRegisterId);
    return cashRegister?.name || 'Unknown';
  }

  getMovementTypeName(movementTypeId: number): string {
    const movementType = this.movementService.movementTypes().find(mt => mt.id === movementTypeId);
    return movementType?.name || 'Unknown';
  }

  getMovementTypeClass(movementTypeId: number): string {
    const movementType = this.movementService.movementTypes().find(mt => mt.id === movementTypeId);
    if (!movementType) return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    
    switch (movementType.category) {
      case 'income':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'expense':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'transfer':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  }

  getAmountClass(movementTypeId: number): string {
    const movementType = this.movementService.movementTypes().find(mt => mt.id === movementTypeId);
    if (!movementType) return '';
    
    switch (movementType.category) {
      case 'income':
        return 'text-green-600 dark:text-green-400';
      case 'expense':
        return 'text-red-600 dark:text-red-400';
      case 'transfer':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return '';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }

  getTimeFromDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString();
  }
}
