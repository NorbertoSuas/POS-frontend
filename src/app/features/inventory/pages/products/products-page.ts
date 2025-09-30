import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { ProductService } from '../../services/product.service';
import { ProductTypeService } from '../../services/product-type.service';
import { SupplierService } from '../../services/supplier.service';
import { Product, ProductCreateRequest, ProductUpdateRequest } from '../../../../shared/models/product';

@Component({
  selector: 'page-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css'
})
export class ProductsPage implements OnInit {
  showModal = false;
  editingProduct: Product | null = null;
  productForm: FormGroup;

  constructor(
    public productService: ProductService,
    public productTypeService: ProductTypeService,
    public supplierService: SupplierService,
    private readonly fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      imageUri: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      tax: [0, [Validators.required, Validators.min(0)]],
      supplierId: ['', Validators.required],
      productTypeId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadProductTypes();
    this.loadSuppliers();
  }

  loadProducts() {
    this.productService.loadProducts().subscribe();
  }

  loadProductTypes() {
    this.productTypeService.loadProductTypes().subscribe();
  }

  loadSuppliers() {
    this.supplierService.loadSuppliers().subscribe();
  }

  openCreateModal() {
    this.editingProduct = null;
    this.productForm.reset();
    this.showModal = true;
  }

  openEditModal(product: Product) {
    this.editingProduct = product;
    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      imageUri: product.imageUri || '',
      price: product.price || 0,
      tax: product.tax || 0,
      supplierId: product.supplierId,
      productTypeId: product.productTypeId
    });
    this.showModal = true;
  }

  saveProduct() {
    if (this.productForm.valid) {
      const productData = this.productForm.value;

      if (this.editingProduct) {
        // Update existing product
        this.productService.update(this.editingProduct.id!, productData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error: any) => console.error('Error updating product:', error)
        });
      } else {
        // Create new product
        this.productService.create(productData).subscribe({
          next: () => {
            this.closeModal();
          },
          error: (error: any) => console.error('Error creating product:', error)
        });
      }
    }
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      this.productService.delete(product.id!).subscribe({
        error: (error: any) => console.error('Error deleting product:', error)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingProduct = null;
    this.productForm.reset();
  }

  getTotalProducts(): number {
    return this.productService.products().length;
  }

  getProductTypeName(typeId: string): string {
    const productType = this.productTypeService.productTypes().find(t => t.id === typeId);
    return productType ? productType.name : 'Unknown';
  }

  getSupplierName(supplierId: string): string {
    const supplier = this.supplierService.suppliers().find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown';
  }
} 