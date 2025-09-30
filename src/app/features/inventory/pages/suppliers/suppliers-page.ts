import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { SupplierService } from '../../services/supplier.service';
import { Supplier, SupplierCreateRequest, SupplierUpdateRequest } from '../../models/supplier';

@Component({
  selector: 'page-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './suppliers-page.html',
  styleUrl: './suppliers-page.css'
})
export class SuppliersPage implements OnInit {
  showModal = false;
  editingSupplier: Supplier | null = null;
  supplierForm: FormGroup;

  constructor(
    public supplierService: SupplierService,
    private fb: FormBuilder
  ) {
    this.supplierForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.supplierService.loadSuppliers().subscribe();
  }

  openCreateModal() {
    this.editingSupplier = null;
    this.supplierForm.reset();
    this.showModal = true;
  }

  openEditModal(supplier: Supplier) {
    this.editingSupplier = supplier;
    this.supplierForm.patchValue({
      name: supplier.name,
      email: supplier.email,
      address: supplier.address
    });
    this.showModal = true;
  }

  saveSupplier() {
    if (this.supplierForm.valid) {
      const supplierData = this.supplierForm.value;

      if (this.editingSupplier) {
        // Update existing supplier
        this.supplierService.update(this.editingSupplier.id!, supplierData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error: any) => console.error('Error updating supplier:', error)
        });
      } else {
        // Create new supplier
        this.supplierService.create(supplierData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error: any) => console.error('Error creating supplier:', error)
        });
      }
    }
  }

  deleteSupplier(supplier: Supplier) {
    if (confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      this.supplierService.delete(supplier.id!).subscribe({
        error: (error: any) => console.error('Error deleting supplier:', error)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingSupplier = null;
    this.supplierForm.reset();
  }

  getTotalSuppliers(): number {
    return this.supplierService.suppliers().length;
  }

  getActiveSuppliers(): number {
    return this.supplierService.suppliers().filter(s => !s.isDeleted).length;
  }
} 