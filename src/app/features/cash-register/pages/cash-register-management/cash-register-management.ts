import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegister, CashRegisterCreateRequest, CashRegisterUpdateRequest } from '../../models';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-cash-register-management',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    GenericModal,
    PaginationComponent
  ],
  templateUrl: './cash-register-management.html',
  styleUrl: './cash-register-management.css'
})
export class CashRegisterManagementPage implements OnInit, OnDestroy {
  showModal = false;
  editingCashRegister: CashRegister | null = null;
  cashRegisterForm: FormGroup;
  private refreshSubscription?: Subscription;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Search and filters
  searchTerm = '';
  statusFilter = 'all';
  branchFilter = 'all';

  constructor(
    public cashRegisterService: CashRegisterService,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {
    this.cashRegisterForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      branchId: ['', Validators.required],
      initialBalance: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]]
    });
  }

  ngOnInit() {
    this.loadCashRegisters();
    // Refresh data every 30 seconds for real-time updates
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
      this.loadCashRegisters();
    });
  }

  // Modal operations
  openCreateModal() {
    this.editingCashRegister = null;
    this.cashRegisterForm.reset();
    this.cashRegisterForm.patchValue({
      initialBalance: 0
    });
    this.showModal = true;
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
      const formData = this.cashRegisterForm.value;
      
      if (this.editingCashRegister) {
        // Update existing cash register
        const updateData: CashRegisterUpdateRequest = {
          name: formData.name,
          description: formData.description,
          branchId: formData.branchId,
          isActive: this.editingCashRegister.isActive
        };
        
        this.cashRegisterService.update(this.editingCashRegister.id!, updateData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error updating cash register:', error)
        });
      } else {
        // Create new cash register
        const createData: CashRegisterCreateRequest = {
          name: formData.name,
          description: formData.description,
          branchId: formData.branchId,
          initialBalance: formData.initialBalance
        };
        
        this.cashRegisterService.create(createData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error creating cash register:', error)
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.cashRegisterForm.markAllAsTouched();
    }
  }

  deleteCashRegister(cashRegister: CashRegister) {
    if (confirm(`Are you sure you want to delete "${cashRegister.name}"? This action cannot be undone.`)) {
      this.cashRegisterService.delete(cashRegister.id!).subscribe({
        next: () => {
          console.log('Cash register deleted successfully');
        },
        error: (error) => console.error('Error deleting cash register:', error)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingCashRegister = null;
    this.cashRegisterForm.reset();
  }

  // Toggle cash register status
  toggleStatus(cashRegister: CashRegister) {
    const newStatus = !cashRegister.isActive;
    const updateData: CashRegisterUpdateRequest = {
      isActive: newStatus
    };
    
    this.cashRegisterService.update(cashRegister.id!, updateData).subscribe({
      next: () => {
        console.log(`Cash register ${newStatus ? 'activated' : 'deactivated'} successfully`);
      },
      error: (error) => console.error('Error updating cash register status:', error)
    });
  }

  // Filter and search methods
  get filteredCashRegisters(): CashRegister[] {
    let filtered = this.cashRegisterService.cashRegisters();
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cr => 
        cr.name.toLowerCase().includes(term) ||
        cr.description?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(cr => {
        switch (this.statusFilter) {
          case 'active':
            return cr.isActive;
          case 'inactive':
            return !cr.isActive;
          default:
            return true;
        }
      });
    }
    
    // Apply branch filter
    if (this.branchFilter !== 'all') {
      filtered = filtered.filter(cr => cr.branchId.toString() === this.branchFilter);
    }
    
    // Update total items for pagination
    this.totalItems = filtered.length;
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    return filtered.slice(startIndex, endIndex);
  }

  onSearchChange() {
    this.currentPage = 1; // Reset to first page when searching
  }

  onFilterChange() {
    this.currentPage = 1; // Reset to first page when filtering
  }

  // Pagination methods
  onPageChange(page: number) {
    this.currentPage = page;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginationInfo(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${start}-${end} of ${this.totalItems} cash registers`;
  }

  // Status and display methods
  getCashRegisterStatus(cashRegister: CashRegister): string {
    return cashRegister.isActive ? 'Active' : 'Inactive';
  }

  getStatusClass(status: string): string {
    return status === 'Active' ? 'badge-success' : 'badge-error';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Export functionality
  exportToCSV() {
    const data = this.cashRegisterService.cashRegisters();
    const csvContent = this.generateCSV(data);
    this.downloadCSV(csvContent, 'cash-registers.csv');
  }

  private generateCSV(data: CashRegister[]): string {
    const headers = ['Name', 'Description', 'Branch ID', 'Initial Balance', 'Current Balance', 'Status', 'Created At'];
    const rows = data.map(cr => [
      cr.name,
      cr.description || '',
      cr.branchId.toString(),
      cr.initialBalance.toString(),
      cr.currentBalance.toString(),
      cr.isActive ? 'Active' : 'Inactive',
      cr.createdAt ? new Date(cr.createdAt).toLocaleDateString() : ''
    ]);
    
    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  }

  private downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Navigation
  goBack() {
    this.router.navigate(['/admin-panel/cash-register']);
  }

  // Form validation helpers
  getFieldError(fieldName: string): string {
    const field = this.cashRegisterForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must not exceed ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cashRegisterForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  // TrackBy function for performance optimization
  trackByFn(index: number, item: CashRegister): number {
    return item.id || index;
  }

  // Statistics methods for template
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

  getAverageBalance(): number {
    const activeRegisters = this.cashRegisterService.cashRegisters().filter(cr => cr.isActive);
    if (activeRegisters.length === 0) return 0;
    
    const totalBalance = activeRegisters.reduce((total, cr) => total + cr.currentBalance, 0);
    return totalBalance / activeRegisters.length;
  }
}
