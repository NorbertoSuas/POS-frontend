import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { StorageService } from '../../services/storage.service';
import { StorageTypeService } from '../../services/storage-type.service';
import { Storage, StorageCreateRequest, StorageUpdateRequest } from '../../models/storage';

@Component({
  selector: 'page-storage',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './storage-page.html',
  styleUrl: './storage-page.css'
})
export class StoragePage implements OnInit {
  showModal = false;
  editingStorage: Storage | null = null;
  storageForm: FormGroup;

  constructor(
    public storageService: StorageService,
    public storageTypeService: StorageTypeService,
    private fb: FormBuilder
  ) {
    this.storageForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      storageTypeId: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      isAvailable: [true]
    });
  }

  ngOnInit() {
    this.loadStorages();
    this.loadStorageTypes();
  }

  loadStorages() {
    this.storageService.loadStorages().subscribe();
  }

  loadStorageTypes() {
    this.storageTypeService.loadStorageTypes().subscribe();
  }

  openCreateModal() {
    this.editingStorage = null;
    this.storageForm.reset({ isAvailable: true });
    this.showModal = true;
  }

  openEditModal(storage: Storage) {
    this.editingStorage = storage;
    this.storageForm.patchValue({
      name: storage.name,
      description: storage.description,
      storageTypeId: storage.storageTypeId,
      capacity: storage.capacity,
      isAvailable: storage.isAvailable
    });
    this.showModal = true;
  }

  saveStorage() {
    if (this.storageForm.valid) {
      const storageData = this.storageForm.value;

      if (this.editingStorage) {
        // Update existing storage
        this.storageService.update(this.editingStorage.id!, storageData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error updating storage:', error)
        });
      } else {
        // Create new storage
        this.storageService.create(storageData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error creating storage:', error)
        });
      }
    }
  }

  deleteStorage(storage: Storage) {
    if (confirm(`Are you sure you want to delete ${storage.name}?`)) {
      this.storageService.delete(storage.id!).subscribe({
        error: (error) => console.error('Error deleting storage:', error)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingStorage = null;
    this.storageForm.reset({ isAvailable: true });
  }

  getTotalStorages(): number {
    return this.storageService.storages().length;
  }

  getAvailableStorages(): number {
    return this.storageService.storages().filter(s => s.isAvailable).length;
  }

  getStorageTypeName(typeId: string): string {
    const storageType = this.storageTypeService.storageTypes().find(t => t.id === typeId);
    return storageType ? storageType.name : 'Unknown';
  }
}
