import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { InventoryService } from '../../services/inventory.service';
import { Inventory, InventoryCreateRequest, InventoryUpdateRequest } from '../../models/inventory';

@Component({
  selector: 'page-inventories',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './inventories-page.html',
  styleUrl: './inventories-page.css'
})
export class InventoriesPage implements OnInit {
  showModal = false;
  editingInventory: Inventory | null = null;
  inventoryForm: FormGroup;

  constructor(
    public inventoryService: InventoryService,
    private fb: FormBuilder
  ) {
    this.inventoryForm = this.fb.group({
      barCode: ['', Validators.required],
      productId: ['', Validators.required],
      warehouseId: ['', Validators.required],
      minStock: [0, [Validators.required, Validators.min(0)]],
      maxStock: [0, [Validators.required, Validators.min(0)]],
      currentStock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadInventories();
  }

  loadInventories() {
    this.inventoryService.loadInventories().subscribe();
  }

  openCreateModal() {
    this.editingInventory = null;
    this.inventoryForm.reset();
    this.showModal = true;
  }

  openEditModal(inventory: Inventory) {
    this.editingInventory = inventory;
    this.inventoryForm.patchValue({
      barCode: inventory.barCode,
      productId: inventory.productId,
      warehouseId: inventory.warehouseId,
      minStock: inventory.minStock,
      maxStock: inventory.maxStock,
      currentStock: inventory.currentStock
    });
    this.showModal = true;
  }

  saveInventory() {
    if (this.inventoryForm.valid) {
      const inventoryData = this.inventoryForm.value;

      if (this.editingInventory) {
        // Update existing inventory
        this.inventoryService.update(this.editingInventory.id!, inventoryData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error updating inventory:', error)
        });
      } else {
        // Create new inventory
        this.inventoryService.create(inventoryData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error creating inventory:', error)
        });
      }
    }
  }

  deleteInventory(inventory: Inventory) {
    if (confirm(`Are you sure you want to delete inventory ${inventory.barCode}?`)) {
      this.inventoryService.delete(inventory.id!).subscribe({
        error: (error) => console.error('Error deleting inventory:', error)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingInventory = null;
    this.inventoryForm.reset();
  }

  getTotalInventories(): number {
    return this.inventoryService.inventories().length;
  }

  getActiveInventories(): number {
    return this.inventoryService.inventories().filter(inv => !inv.isDeleted).length;
  }
}
