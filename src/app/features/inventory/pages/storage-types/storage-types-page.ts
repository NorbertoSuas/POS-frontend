import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { StorageTypeService } from '../../services/storage-type.service';
import { StorageType, StorageTypeCreateRequest, StorageTypeUpdateRequest } from '../../models/storage-type';

@Component({
  selector: 'page-storage-types',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './storage-types-page.html',
  styleUrl: './storage-types-page.css'
})
export class StorageTypesPage implements OnInit {
  showModal = false;
  editingStorageType: StorageType | null = null;
  storageTypeForm: FormGroup;

  constructor(
    public storageTypeService: StorageTypeService,
    private fb: FormBuilder
  ) {
    this.storageTypeForm = this.fb.group({
      name: ['', Validators.required],
      maximumWeight: ['', Validators.required],
      allowNewProduct: [false]
    });
  }

  ngOnInit() {
    this.loadStorageTypes();
  }

  loadStorageTypes() {
    this.storageTypeService.loadStorageTypes().subscribe();
  }

  openCreateModal() {
    this.editingStorageType = null;
    this.storageTypeForm.reset({ allowNewProduct: false });
    this.showModal = true;
  }

  openEditModal(storageType: StorageType) {
    this.editingStorageType = storageType;
    this.storageTypeForm.patchValue({
      name: storageType.name,
      maximumWeight: storageType.maximumWeight,
      allowNewProduct: storageType.allowNewProduct
    });
    this.showModal = true;
  }

  saveStorageType() {
    if (this.storageTypeForm.valid) {
      const storageTypeData = this.storageTypeForm.value;

      if (this.editingStorageType) {
        // Update existing storage type
        this.storageTypeService.update(this.editingStorageType.id!, storageTypeData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error updating storage type:', error)
        });
      } else {
        // Create new storage type
        this.storageTypeService.create(storageTypeData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error creating storage type:', error)
        });
      }
    }
  }

  deleteStorageType(storageType: StorageType) {
    if (confirm(`Are you sure you want to delete ${storageType.name}?`)) {
      this.storageTypeService.delete(storageType.id!).subscribe({
        error: (error) => console.error('Error deleting storage type:', error)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingStorageType = null;
    this.storageTypeForm.reset({ allowNewProduct: false });
  }

  getTotalStorageTypes(): number {
    return this.storageTypeService.storageTypes().length;
  }

  getActiveStorageTypes(): number {
    return this.storageTypeService.storageTypes().filter(st => !st.isDeleted).length;
  }
}
