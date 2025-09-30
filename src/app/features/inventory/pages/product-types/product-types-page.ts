import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { ProductTypeService } from '../../services/product-type.service';
import { ProductType, ProductTypeCreateRequest, ProductTypeUpdateRequest } from '../../../../shared/models/product-type';

@Component({
  selector: 'page-product-types',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './product-types-page.html',
  styleUrl: './product-types-page.css'
})
export class ProductTypesPage implements OnInit {
  showModal = false;
  editingProductType: ProductType | null = null;
  productTypeForm: FormGroup;

  constructor(
    public productTypeService: ProductTypeService,
    private fb: FormBuilder
  ) {
    this.productTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProductTypes();
  }

  loadProductTypes() {
    this.productTypeService.loadProductTypes().subscribe();
  }

  openCreateModal() {
    this.editingProductType = null;
    this.productTypeForm.reset();
    this.showModal = true;
  }

  openEditModal(productType: ProductType) {
    this.editingProductType = productType;
    this.productTypeForm.patchValue({
      name: productType.name,
      description: productType.description
    });
    this.showModal = true;
  }

  saveProductType() {
    if (this.productTypeForm.valid) {
      const productTypeData = this.productTypeForm.value;

      if (this.editingProductType) {
        // Update existing product type
        this.productTypeService.update(this.editingProductType.id!, productTypeData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error updating product type:', error)
        });
      } else {
        // Create new product type
        this.productTypeService.create(productTypeData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error) => console.error('Error creating product type:', error)
        });
      }
    }
  }

  deleteProductType(productType: ProductType) {
    if (confirm(`Are you sure you want to delete ${productType.name}?`)) {
      this.productTypeService.delete(productType.id!).subscribe({
        error: (error) => console.error('Error deleting product type:', error)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingProductType = null;
    this.productTypeForm.reset();
  }

  getTotalProductTypes(): number {
    return this.productTypeService.productTypes().length;
  }

  getActiveProductTypes(): number {
    return this.productTypeService.productTypes().filter(pt => !pt.isDeleted).length;
  }
}
