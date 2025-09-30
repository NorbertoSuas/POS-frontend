import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { ProductTaxService } from '../../services/product-tax.service';
import { ProductService } from '../../services/product.service';
import { TaxService } from '../../services/tax.service';
import { ProductTax, ProductTaxCreateRequest, ProductTaxUpdateRequest } from '../../models/product-tax';
import { Product } from '../../../../shared/models/product';
import { Tax } from '../../models/tax';
import { ApiResponse } from '../../../../shared/models/api-response';

@Component({
  selector: 'page-product-taxes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './product-taxes-page.html',
  styleUrl: './product-taxes-page.css'
})
export class ProductTaxesPage implements OnInit {
  productTaxes = signal<ProductTax[]>([]);
  products = signal<Product[]>([]);
  taxes = signal<Tax[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingProductTax = signal<ProductTax | null>(null);
  productTaxForm: FormGroup;

  constructor(
    private productTaxService: ProductTaxService,
    private productService: ProductService,
    private taxService: TaxService,
    private fb: FormBuilder
  ) {
    this.productTaxForm = this.fb.group({
      productId: ['', Validators.required],
      taxId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProductTaxes();
    this.loadProducts();
    this.loadTaxes();
  }

  loadProductTaxes() {
    this.loading.set(true);
    this.productTaxService.getAll().subscribe({
      next: (response: ApiResponse<ProductTax[]>) => {
        this.productTaxes.set(response.data || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading product taxes:', error);
        this.loading.set(false);
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

  loadTaxes() {
    this.taxService.getAll().subscribe({
      next: (response: ApiResponse<Tax[]>) => {
        this.taxes.set(response.data || []);
      },
      error: (error) => {
        console.error('Error loading taxes:', error);
      }
    });
  }

  openCreateModal() {
    this.editingProductTax.set(null);
    this.productTaxForm.reset();
    this.showModal.set(true);
  }

  openEditModal(productTax: ProductTax) {
    this.editingProductTax.set(productTax);
    this.productTaxForm.patchValue({
      productId: productTax.productId,
      taxId: productTax.taxId
    });
    this.showModal.set(true);
  }

  saveProductTax() {
    if (this.productTaxForm.valid) {
      const productTaxData = this.productTaxForm.value;

      if (this.editingProductTax()) {
        // Update existing product tax
        this.productTaxService.update(this.editingProductTax()!.id!, productTaxData).subscribe({
          next: () => {
            this.loadProductTaxes();
            this.closeModal();
          },
          error: (error) => console.error('Error updating product tax:', error)
        });
      } else {
        // Create new product tax
        this.productTaxService.create(productTaxData).subscribe({
          next: () => {
            this.loadProductTaxes();
            this.closeModal();
          },
          error: (error) => console.error('Error creating product tax:', error)
        });
      }
    }
  }

  deleteProductTax(productTax: ProductTax) {
    if (confirm(`Are you sure you want to delete this product tax assignment?`)) {
      this.productTaxService.delete(productTax.id!).subscribe({
        next: () => {
          this.loadProductTaxes();
        },
        error: (error) => console.error('Error deleting product tax:', error)
      });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProductTax.set(null);
    this.productTaxForm.reset();
  }

  getTotalProductTaxes(): number {
    return this.productTaxes().length;
  }

  getProductName(productId: string): string {
    const product = this.products().find(p => p.id === productId);
    return product ? product.name : 'Unknown';
  }

  getTaxName(taxId: string): string {
    const tax = this.taxes().find(t => t.id === taxId);
    return tax ? tax.name : 'Unknown';
  }

  getTaxRate(taxId: string): number {
    const tax = this.taxes().find(t => t.id === taxId);
    return tax ? tax.rate : 0;
  }

  formatTaxRate(rate: number): string {
    return `${rate}%`;
  }

  getTaxRateClass(rate: number): string {
    if (rate >= 15) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    } else if (rate >= 10) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
  }
}
