import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { InventoryMovementService } from '../../services/inventory-movement.service';
import { InventoryService } from '../../services/inventory.service';
import { MovementTypeService } from '../../services/movement-type.service';
import { InventoryMovement, InventoryMovementCreateRequest, InventoryMovementUpdateRequest } from '../../models/inventory-movement';
import { Inventory } from '../../models/inventory';
import { MovementType } from '../../models/movement-type';
import { ApiResponse } from '../../../../shared/models/api-response';

@Component({
  selector: 'page-inventory-movements',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './inventory-movements-page.html',
  styleUrl: './inventory-movements-page.css'
})
export class InventoryMovementsPage implements OnInit {
  inventoryMovements = signal<InventoryMovement[]>([]);
  inventories = signal<Inventory[]>([]);
  movementTypes = signal<MovementType[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingMovement = signal<InventoryMovement | null>(null);
  movementForm: FormGroup;

  constructor(
    private inventoryMovementService: InventoryMovementService,
    private inventoryService: InventoryService,
    private movementTypeService: MovementTypeService,
    private fb: FormBuilder
  ) {
    this.movementForm = this.fb.group({
      inventoryId: ['', Validators.required],
      movementDate: ['', Validators.required],
      movementTypeId: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadInventoryMovements();
    this.loadInventories();
    this.loadMovementTypes();
  }

  loadInventoryMovements() {
    this.loading.set(true);
    this.inventoryMovementService.getAll().subscribe({
      next: (response: ApiResponse<InventoryMovement[]>) => {
        this.inventoryMovements.set(response.data || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading inventory movements:', error);
        this.loading.set(false);
      }
    });
  }

  loadInventories() {
    this.inventoryService.getAll().subscribe({
      next: (response: ApiResponse<Inventory[]>) => {
        this.inventories.set(response.data || []);
      },
      error: (error) => {
        console.error('Error loading inventories:', error);
      }
    });
  }

  loadMovementTypes() {
    this.movementTypeService.getAll().subscribe({
      next: (response: ApiResponse<MovementType[]>) => {
        this.movementTypes.set(response.data || []);
      },
      error: (error) => {
        console.error('Error loading movement types:', error);
      }
    });
  }

  openCreateModal() {
    this.editingMovement.set(null);
    this.movementForm.reset({
      movementDate: new Date().toISOString().split('T')[0]
    });
    this.showModal.set(true);
  }

  openEditModal(movement: InventoryMovement) {
    this.editingMovement.set(movement);
    this.movementForm.patchValue({
      inventoryId: movement.inventoryId,
      movementDate: new Date(movement.movementDate).toISOString().split('T')[0],
      movementTypeId: movement.movementTypeId,
      quantity: movement.quantity,
      description: movement.description
    });
    this.showModal.set(true);
  }

  saveMovement() {
    if (this.movementForm.valid) {
      const movementData = {
        ...this.movementForm.value,
        movementDate: new Date(this.movementForm.value.movementDate)
      };

      if (this.editingMovement()) {
        // Update existing movement
        this.inventoryMovementService.update(this.editingMovement()!.id!, movementData).subscribe({
          next: () => {
            this.loadInventoryMovements();
            this.closeModal();
          },
          error: (error) => console.error('Error updating inventory movement:', error)
        });
      } else {
        // Create new movement
        this.inventoryMovementService.create(movementData).subscribe({
          next: () => {
            this.loadInventoryMovements();
            this.closeModal();
          },
          error: (error) => console.error('Error creating inventory movement:', error)
        });
      }
    }
  }

  deleteMovement(movement: InventoryMovement) {
    if (confirm(`Are you sure you want to delete this inventory movement record?`)) {
      this.inventoryMovementService.delete(movement.id!).subscribe({
        next: () => {
          this.loadInventoryMovements();
        },
        error: (error) => console.error('Error deleting inventory movement:', error)
      });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.editingMovement.set(null);
    this.movementForm.reset();
  }

  getTotalMovements(): number {
    return this.inventoryMovements().length;
  }

  getInventoryBarcode(inventoryId: string): string {
    const inventory = this.inventories().find(i => i.id === inventoryId);
    return inventory ? inventory.barCode : 'Unknown';
  }

  getMovementTypeName(movementTypeId: string): string {
    const movementType = this.movementTypes().find(mt => mt.id === movementTypeId);
    return movementType ? movementType.name : 'Unknown';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getMovementTypeClass(movementTypeId: string): string {
    const movementType = this.movementTypes().find(mt => mt.id === movementTypeId);
    if (!movementType) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    
    // Assuming movement types like "IN" and "OUT" exist
    if (movementType.name.toLowerCase().includes('in')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    } else if (movementType.name.toLowerCase().includes('out')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    }
    
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
  }
}
