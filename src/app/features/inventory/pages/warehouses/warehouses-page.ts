import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse, WarehouseCreateRequest, WarehouseUpdateRequest } from '../../models/warehouse';

@Component({
  selector: 'page-warehouses',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './warehouses-page.html',
  styleUrl: './warehouses-page.css'
})
export class WarehousesPage implements OnInit {
  showModal = false;
  editingWarehouse: Warehouse | null = null;
  warehouseForm: FormGroup;

  constructor(
    public warehouseService: WarehouseService,
    private fb: FormBuilder
  ) {
    this.warehouseForm = this.fb.group({
      name: ['', Validators.required],
      shortname: ['', Validators.required],
      branchId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.warehouseService.loadWarehouses().subscribe();
  }

  openCreateModal() {
    this.editingWarehouse = null;
    this.warehouseForm.reset();
    this.showModal = true;
  }

  openEditModal(warehouse: Warehouse) {
    this.editingWarehouse = warehouse;
    this.warehouseForm.patchValue({
      name: warehouse.name,
      shortname: warehouse.shortname,
      branchId: warehouse.branchId
    });
    this.showModal = true;
  }

  saveWarehouse() {
    if (this.warehouseForm.valid) {
      const warehouseData = this.warehouseForm.value;

      if (this.editingWarehouse) {
        // Update existing warehouse
        this.warehouseService.update(this.editingWarehouse.id!, warehouseData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error updating warehouse:', error)
        });
      } else {
        // Create new warehouse
        this.warehouseService.create(warehouseData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error creating warehouse:', error)
        });
      }
    }
  }

  deleteWarehouse(warehouse: Warehouse) {
    if (confirm(`Are you sure you want to delete ${warehouse.name}?`)) {
      this.warehouseService.delete(warehouse.id!).subscribe({
        error: (error) => console.error('Error deleting warehouse:', error)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingWarehouse = null;
    this.warehouseForm.reset();
  }

  getTotalWarehouses(): number {
    return this.warehouseService.warehouses().length;
  }

  getActiveWarehouses(): number {
    return this.warehouseService.warehouses().filter(w => !w.isDeleted).length;
  }
} 