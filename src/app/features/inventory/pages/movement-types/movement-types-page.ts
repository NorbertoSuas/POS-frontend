import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { MovementTypeService } from '../../services/movement-type.service';
import { MovementType, MovementTypeCreateRequest, MovementTypeUpdateRequest } from '../../models/movement-type';

@Component({
  selector: 'page-movement-types',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './movement-types-page.html',
  styleUrl: './movement-types-page.css'
})
export class MovementTypesPage implements OnInit {
  showModal = false;
  editingMovementType: MovementType | null = null;
  movementTypeForm: FormGroup;

  constructor(
    public movementTypeService: MovementTypeService,
    private fb: FormBuilder
  ) {
    this.movementTypeForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadMovementTypes();
  }

  loadMovementTypes() {
    this.movementTypeService.loadMovementTypes().subscribe();
  }

  openCreateModal() {
    this.editingMovementType = null;
    this.movementTypeForm.reset();
    this.showModal = true;
  }

  openEditModal(movementType: MovementType) {
    this.editingMovementType = movementType;
    this.movementTypeForm.patchValue({
      name: movementType.name
    });
    this.showModal = true;
  }

  saveMovementType() {
    if (this.movementTypeForm.valid) {
      const movementTypeData = this.movementTypeForm.value;

      if (this.editingMovementType) {
        // Update existing movement type
        this.movementTypeService.update(this.editingMovementType.id!, movementTypeData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error updating movement type:', error)
        });
      } else {
        // Create new movement type
        this.movementTypeService.create(movementTypeData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error creating movement type:', error)
        });
      }
    }
  }

  deleteMovementType(movementType: MovementType) {
    if (confirm(`Are you sure you want to delete ${movementType.name}?`)) {
      this.movementTypeService.delete(movementType.id!).subscribe({
        error: (error) => console.error('Error deleting movement type:', error)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingMovementType = null;
    this.movementTypeForm.reset();
  }

  getTotalMovementTypes(): number {
    return this.movementTypeService.movementTypes().length;
  }

  getActiveMovementTypes(): number {
    return this.movementTypeService.movementTypes().filter(mt => !mt.isDeleted).length;
  }
}
