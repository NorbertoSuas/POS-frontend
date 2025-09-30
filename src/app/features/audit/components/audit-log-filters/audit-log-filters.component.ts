import { Component, signal, input, output, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuditLogFilters } from '../../types/audit.types';

@Component({
  selector: 'app-audit-log-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './audit-log-filters.component.html',
  styleUrls: ['./audit-log-filters.component.css']
})
export class AuditLogFiltersComponent implements OnInit {
  currentFilters = input.required<AuditLogFilters>();
  filtersChange = output<AuditLogFilters>();

  filtersForm: FormGroup;
  showAdvancedFilters = signal(false);

  // Predefined options for filters
  readonly actionOptions = [
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'APPROVE', 'REJECT'
  ] as const;

  readonly entityTypeOptions = [
    'User', 'Product', 'Inventory', 'Order', 'Customer', 'Supplier', 'Warehouse', 'Tax', 'Price',
    'CashRegister', 'Employee', 'Role', 'Permission', 'Branch', 'Shift', 'Menu', 'Table', 'Reservation'
  ] as const;

  // Computed signals for derived state
  readonly hasActiveFilters = computed(() => {
    const formValue = this.filtersForm.value;
    return Object.values(formValue).some(value => value !== '' && value !== null && value !== undefined);
  });

  readonly activeFiltersCount = computed(() => {
    const formValue = this.filtersForm.value;
    return Object.values(formValue).filter(value => value !== '' && value !== null && value !== undefined).length;
  });

  readonly canClearFilters = computed(() => this.hasActiveFilters());

  constructor(private readonly fb: FormBuilder) {
    this.filtersForm = this.fb.group({
      userId: [''],
      action: [''],
      entityType: [''],
      entityId: [''],
      startDate: [''],
      endDate: ['']
    });

    // Effect to automatically apply filters when form values change
    // This must be in the constructor to have proper injection context
    effect(() => {
      if (this.filtersForm.valid && this.hasActiveFilters()) {
        // Apply filters after a small delay to avoid too many calls
        setTimeout(() => {
          this.applyFilters();
        }, 300);
      }
    });
  }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    const filters = this.currentFilters();
    if (filters) {
      this.filtersForm.patchValue({
        userId: filters.userId || '',
        action: filters.action || '',
        entityType: filters.entityType || '',
        entityId: filters.entityId || '',
        startDate: filters.startDate ? this.formatDateForInput(filters.startDate) : '',
        endDate: filters.endDate ? this.formatDateForInput(filters.endDate) : ''
      });
    }
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters.update(show => !show);
  }

  applyFilters() {
    const formValue = this.filtersForm.value;
    const filters: AuditLogFilters = {};

    if (formValue.userId) filters.userId = Number(formValue.userId);
    if (formValue.action) filters.action = formValue.action;
    if (formValue.entityType) filters.entityType = formValue.entityType;
    if (formValue.entityId) filters.entityId = Number(formValue.entityId);
    if (formValue.startDate) filters.startDate = new Date(formValue.startDate);
    if (formValue.endDate) filters.endDate = new Date(formValue.endDate);

    this.filtersChange.emit(filters);
  }

  clearFilters() {
    this.filtersForm.reset();
    this.filtersChange.emit({});
    
    // Hide advanced filters when clearing
    this.showAdvancedFilters.set(false);
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
