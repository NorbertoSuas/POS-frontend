import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CashRegisterMovementService } from '../../services/cash-register-movement.service';
import { CashRegisterMovementType } from '../../models';

@Component({
  selector: 'app-cash-register-movement-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cash-register-movement-types.html',
  styleUrls: ['./cash-register-movement-types.css']
})
export class CashRegisterMovementTypesPage implements OnInit {
  private fb = inject(FormBuilder);
  
  // Make service public so it can be accessed in template
  public movementService = inject(CashRegisterMovementService);

  // Component state
  showModal = signal(false);
  editingType = signal<CashRegisterMovementType | null>(null);

  // Form
  typeForm: FormGroup;

  constructor() {
    this.typeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', Validators.maxLength(255)],
      category: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  // Load initial data
  loadData() {
    this.movementService.loadMovementTypes();
  }

  // Export data
  exportData() {
    const types = this.movementService.movementTypes();
    const csvContent = this.convertToCSV(types);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'movement-types.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(types: CashRegisterMovementType[]): string {
    const headers = ['Name', 'Description', 'Category', 'Status'];
    const rows = types.map(t => [
      t.name,
      t.description || '',
      this.getCategoryLabel(t.category),
      t.isActive ? 'Active' : 'Inactive'
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  // Modal methods
  openCreateModal() {
    this.editingType.set(null);
    this.typeForm.reset({ isActive: true });
    this.showModal.set(true);
  }

  openEditModal(type: CashRegisterMovementType) {
    this.editingType.set(type);
    this.typeForm.patchValue({
      name: type.name,
      description: type.description,
      category: type.category,
      isActive: type.isActive
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingType.set(null);
    this.typeForm.reset();
  }

  // Form submission
  saveType() {
    if (this.typeForm.valid) {
      const formValue = this.typeForm.value;
      
      if (this.editingType()) {
        // Update existing type
        const updateRequest = {
          name: formValue.name,
          description: formValue.description,
          category: formValue.category,
          isActive: formValue.isActive
        };
        
        // Note: This would require adding update method to the service
        // For now, we'll just close the modal
        console.log('Update type:', updateRequest);
        this.closeModal();
      } else {
        // Create new type
        const createRequest = {
          name: formValue.name,
          description: formValue.description,
          category: formValue.category,
          isActive: formValue.isActive
        };
        
        // Note: This would require adding create method to the service
        // For now, we'll just close the modal
        console.log('Create type:', createRequest);
        this.closeModal();
      }
    }
  }

  // Toggle type status
  toggleTypeStatus(type: CashRegisterMovementType) {
    const newStatus = !type.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (confirm(`Are you sure you want to ${action} "${type.name}"?`)) {
      // Note: This would require adding toggle method to the service
      console.log(`Toggle type ${type.id} to ${newStatus}`);
    }
  }

  // Delete type
  deleteType(type: CashRegisterMovementType) {
    if (confirm(`Are you sure you want to delete "${type.name}"? This action cannot be undone.`)) {
      // Note: This would require adding delete method to the service
      console.log('Delete type:', type.id);
    }
  }

  // Helper methods
  getActiveTypesCount(): number {
    return this.movementService.movementTypes().filter(type => type.isActive).length;
  }

  getUsageCount(typeId: number): number {
    // This would calculate how many movements use this type
    // For now, return a placeholder
    return Math.floor(Math.random() * 100);
  }

  getCategoryClass(category: string): string {
    switch (category) {
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

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'income':
        return 'Income';
      case 'expense':
        return 'Expense';
      case 'transfer':
        return 'Transfer';
      default:
        return 'Unknown';
    }
  }
}
