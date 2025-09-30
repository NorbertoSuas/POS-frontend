import { Component, input, output, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { AuditLog, UpdateAuditLogDto } from '../../types/audit.types';

@Component({
  selector: 'app-edit-audit-log-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GenericModal],
  templateUrl: './edit-audit-log-modal.component.html',
  styleUrls: ['./edit-audit-log-modal.component.css']
})
export class EditAuditLogModal implements OnInit, OnDestroy {
  isOpen = input.required<boolean>();
  auditLog = input.required<AuditLog>();
  
  updateAuditLog = output<UpdateAuditLogDto>();
  close = output<void>();

  editForm: FormGroup;
  loading = signal(false);

  // Predefined options for fields
  readonly actionOptions = [
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'APPROVE', 'REJECT'
  ] as const;

  readonly entityTypeOptions = [
    'User', 'Product', 'Inventory', 'Order', 'Customer', 'Supplier', 'Warehouse', 'Tax', 'Price',
    'CashRegister', 'Employee', 'Role', 'Permission', 'Branch', 'Shift', 'Menu', 'Table', 'Reservation'
  ] as const;

  // Computed signals for form validation and state
  readonly isFormValid = computed(() => this.editForm.valid);
  readonly isFormDirty = computed(() => this.editForm.dirty);
  readonly canSubmit = computed(() => this.isFormValid() && !this.loading());
  readonly currentLogInfo = computed(() => {
    const log = this.auditLog();
    return `Editing log #${log.id} - ${log.action} in ${log.entityType}`;
  });

  constructor(private readonly fb: FormBuilder) {
    this.editForm = this.fb.group({
      userId: ['', [Validators.required, Validators.min(1)]],
      action: ['', [Validators.required]],
      entityType: ['', [Validators.required]],
      entityId: ['', [Validators.required, Validators.min(1)]],
      oldValues: [''],
      newValues: [''],
      userAgent: ['']
    });
  }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnDestroy() {
    this.editForm.reset();
  }

  initializeForm() {
    const log = this.auditLog();
    if (log) {
      this.editForm.patchValue({
        userId: log.userId,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        oldValues: log.oldValues || '',
        newValues: log.newValues || '',
        userAgent: log.userAgent || ''
      });
    }
  }

  onSubmit() {
    if (this.canSubmit()) {
      this.loading.set(true);
      
      const formData = this.editForm.value;
      const updateData: UpdateAuditLogDto = {
        id: this.auditLog().id!,
        userId: Number(formData.userId),
        action: formData.action,
        entityType: formData.entityType,
        entityId: Number(formData.entityId),
        oldValues: formData.oldValues || undefined,
        newValues: formData.newValues || undefined,
        userAgent: formData.userAgent || undefined
      };

      this.updateAuditLog.emit(updateData);
      this.loading.set(false);
    }
  }

  onClose() {
    this.editForm.reset();
    this.close.emit();
  }

  // Utility methods for validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return field?.invalid && (field.dirty || field.touched) || false;
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
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
