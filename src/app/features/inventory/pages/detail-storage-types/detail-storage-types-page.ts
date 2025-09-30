import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { DetailStorageTypeService } from '../../services/detail-storage-type.service';
import { StorageTypeService } from '../../services/storage-type.service';
import { ProductService } from '../../services/product.service';
import { DetailStorageType, DetailStorageTypeCreateRequest, DetailStorageTypeUpdateRequest } from '../../models/detail-storage-type';
import { StorageType } from '../../models/storage-type';
import { Product } from '../../../../shared/models/product';
import { ApiResponse } from '../../../../shared/models/api-response';

@Component({
  selector: 'page-detail-storage-types',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './detail-storage-types-page.html',
  styleUrl: './detail-storage-types-page.css'
})
export class DetailStorageTypesPage implements OnInit {
  detailStorageTypes = signal<DetailStorageType[]>([]);
  storageTypes = signal<StorageType[]>([]);
  products = signal<Product[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingDetailStorageType = signal<DetailStorageType | null>(null);
  detailStorageTypeForm: FormGroup;

  constructor(
    private detailStorageTypeService: DetailStorageTypeService,
    private storageTypeService: StorageTypeService,
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.detailStorageTypeForm = this.fb.group({
      warehouseCategoryId: ['', Validators.required],
      productId: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadDetailStorageTypes();
    this.loadStorageTypes();
    this.loadProducts();
  }

  loadDetailStorageTypes() {
    this.loading.set(true);
    this.detailStorageTypeService.getAll().subscribe({
      next: (response: ApiResponse<DetailStorageType[]>) => {
        this.detailStorageTypes.set(response.data || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading detail storage types:', error);
        this.loading.set(false);
      }
    });
  }

  loadStorageTypes() {
    this.storageTypeService.getAll().subscribe({
      next: (response: ApiResponse<StorageType[]>) => {
        this.storageTypes.set(response.data || []);
      },
      error: (error) => {
        console.error('Error loading storage types:', error);
      }
    });
  }

  loadProducts() {
    this.productService.getAll().subscribe({
      next: (response: ApiResponse<Product[]>) => {
        this.products.set(response.data || []);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  openCreateModal() {
    this.editingDetailStorageType.set(null);
    this.detailStorageTypeForm.reset();
    this.showModal.set(true);
  }

  openEditModal(detailStorageType: DetailStorageType) {
    this.editingDetailStorageType.set(detailStorageType);
    this.detailStorageTypeForm.patchValue({
      warehouseCategoryId: detailStorageType.warehouseCategoryId,
      productId: detailStorageType.productId,
      quantity: detailStorageType.quantity
    });
    this.showModal.set(true);
  }

  saveDetailStorageType() {
    if (this.detailStorageTypeForm.valid) {
      const detailStorageTypeData = this.detailStorageTypeForm.value;

      if (this.editingDetailStorageType()) {
        // Update existing detail storage type
        this.detailStorageTypeService.update(this.editingDetailStorageType()!.id!, detailStorageTypeData).subscribe({
          next: () => {
            this.loadDetailStorageTypes();
            this.closeModal();
          },
          error: (error) => console.error('Error updating detail storage type:', error)
        });
      } else {
        // Create new detail storage type
        this.detailStorageTypeService.create(detailStorageTypeData).subscribe({
          next: () => {
            this.loadDetailStorageTypes();
            this.closeModal();
          },
          error: (error) => console.error('Error creating detail storage type:', error)
        });
      }
    }
  }

  deleteDetailStorageType(detailStorageType: DetailStorageType) {
    if (confirm(`Are you sure you want to delete this detail storage type record?`)) {
      this.detailStorageTypeService.delete(detailStorageType.id!).subscribe({
        next: () => {
          this.loadDetailStorageTypes();
        },
        error: (error) => console.error('Error deleting detail storage type:', error)
      });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.editingDetailStorageType.set(null);
    this.detailStorageTypeForm.reset();
  }

  getTotalDetailStorageTypes(): number {
    return this.detailStorageTypes().length;
  }

  getStorageTypeName(storageTypeId: string): string {
    const storageType = this.storageTypes().find(st => st.id === storageTypeId);
    return storageType ? storageType.name : 'Unknown';
  }

  getProductName(productId: string): string {
    const product = this.products().find(p => p.id === productId);
    return product ? product.name : 'Unknown';
  }
}
