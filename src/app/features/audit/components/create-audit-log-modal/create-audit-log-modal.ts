import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { CreateAuditLogDto } from '../../types/audit.types';

@Component({
  selector: 'app-create-audit-log-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GenericModal],
  templateUrl: './create-audit-log-modal.html',
  styleUrls: ['./create-audit-log-modal.css']
})
export class CreateAuditLogModal {
  isOpen = input.required<boolean>();
  
  createAuditLog = output<CreateAuditLogDto>();
  close = output<void>();

  createForm: FormGroup;
  loading = signal(false);

  // Predefined options for fields
  readonly actionOptions = [
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'APPROVE', 'REJECT'
  ] as const;

  readonly entityTypeOptions = [
    'User', 'Product', 'Inventory', 'Order', 'Customer', 'Supplier', 'Warehouse', 'Tax', 'Price',
    'CashRegister', 'Employee', 'Role', 'Permission', 'Branch', 'Shift', 'Menu', 'Table', 'Reservation'
  ] as const;

  // Computed signals for form validation
  readonly isFormValid = computed(() => this.createForm.valid);
  readonly isFormDirty = computed(() => this.createForm.dirty);
  readonly canSubmit = computed(() => this.isFormValid() && !this.loading());

  constructor(private readonly fb: FormBuilder) {
    this.createForm = this.fb.group({
      userId: ['', [Validators.required, Validators.min(1)]],
      action: ['', [Validators.required]],
      entityType: ['', [Validators.required]],
      entityId: ['', [Validators.required, Validators.min(1)]],
      oldValues: [''],
      newValues: [''],
      userAgent: ['']
    });
  }

  onSubmit() {
    if (this.canSubmit()) {
      this.loading.set(true);
      
      const formData = this.createForm.value;
      const auditLogData: CreateAuditLogDto = {
        userId: Number(formData.userId),
        action: formData.action,
        entityType: formData.entityType,
        entityId: Number(formData.entityId),
        oldValues: formData.oldValues || undefined,
        newValues: formData.newValues || undefined,
        userAgent: formData.userAgent || undefined
      };

      this.createAuditLog.emit(auditLogData);
      this.loading.set(false);
    }
  }

  onClose() {
    this.createForm.reset();
    this.close.emit();
  }

  // Utility methods for validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return field?.invalid && (field.dirty || field.touched) || false;
  }

  getFieldError(fieldName: string): string {
    const field = this.createForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    }
    return '';
  }

  // Computed signals for field states
  readonly userIdError = computed(() => this.getFieldError('userId'));
  readonly actionError = computed(() => this.getFieldError('action'));
  readonly entityTypeError = computed(() => this.getFieldError('entityType'));
  readonly entityIdError = computed(() => this.getFieldError('entityId'));
}
