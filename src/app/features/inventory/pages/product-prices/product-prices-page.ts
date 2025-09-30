import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { ProductPriceService } from '../../services/product-price.service';
import { ProductService } from '../../services/product.service';
import { PriceService } from '../../services/price.service';
import { ProductPrice, ProductPriceCreateRequest, ProductPriceUpdateRequest } from '../../models/product-price';
import { Product } from '../../../../shared/models/product';
import { Price } from '../../models/price';
import { ApiResponse } from '../../../../shared/models/api-response';

@Component({
  selector: 'page-product-prices',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './product-prices-page.html',
  styleUrl: './product-prices-page.css'
})
export class ProductPricesPage implements OnInit {
  productPrices = signal<ProductPrice[]>([]);
  products = signal<Product[]>([]);
  prices = signal<Price[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingProductPrice = signal<ProductPrice | null>(null);
  productPriceForm: FormGroup;

  constructor(
    private productPriceService: ProductPriceService,
    private productService: ProductService,
    private priceService: PriceService,
    private fb: FormBuilder
  ) {
    this.productPriceForm = this.fb.group({
      productId: ['', Validators.required],
      priceId: ['', Validators.required],
      validFrom: ['', Validators.required],
      validTo: ['']
    });
  }

  ngOnInit() {
    this.loadProductPrices();
    this.loadProducts();
    this.loadPrices();
  }

  loadProductPrices() {
    this.loading.set(true);
    this.productPriceService.getAll().subscribe({
      next: (response: ApiResponse<ProductPrice[]>) => {
        this.productPrices.set(response.data || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading product prices:', error);
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

  loadPrices() {
    this.priceService.getAll().subscribe({
      next: (response: ApiResponse<Price[]>) => {
        this.prices.set(response.data || []);
      },
      error: (error) => {
        console.error('Error loading prices:', error);
      }
    });
  }

  openCreateModal() {
    this.editingProductPrice.set(null);
    this.productPriceForm.reset({
      validFrom: new Date().toISOString().split('T')[0]
    });
    this.showModal.set(true);
  }

  openEditModal(productPrice: ProductPrice) {
    this.editingProductPrice.set(productPrice);
    this.productPriceForm.patchValue({
      productId: productPrice.productId,
      priceId: productPrice.priceId,
      validFrom: new Date(productPrice.validFrom).toISOString().split('T')[0],
      validTo: productPrice.validTo ? new Date(productPrice.validTo).toISOString().split('T')[0] : ''
    });
    this.showModal.set(true);
  }

  saveProductPrice() {
    if (this.productPriceForm.valid) {
      const productPriceData = {
        ...this.productPriceForm.value,
        validFrom: new Date(this.productPriceForm.value.validFrom),
        validTo: this.productPriceForm.value.validTo ? new Date(this.productPriceForm.value.validTo) : null
      };

      if (this.editingProductPrice()) {
        // Update existing product price
        this.productPriceService.update(this.editingProductPrice()!.id!, productPriceData).subscribe({
          next: () => {
            this.loadProductPrices();
            this.closeModal();
          },
          error: (error) => console.error('Error updating product price:', error)
        });
      } else {
        // Create new product price
        this.productPriceService.create(productPriceData).subscribe({
          next: () => {
            this.loadProductPrices();
            this.closeModal();
          },
          error: (error) => console.error('Error creating product price:', error)
        });
      }
    }
  }

  deleteProductPrice(productPrice: ProductPrice) {
    if (confirm(`Are you sure you want to delete this product price assignment?`)) {
      this.productPriceService.delete(productPrice.id!).subscribe({
        next: () => {
          this.loadProductPrices();
        },
        error: (error) => console.error('Error deleting product price:', error)
      });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProductPrice.set(null);
    this.productPriceForm.reset();
  }

  getTotalProductPrices(): number {
    return this.productPrices().length;
  }

  getProductName(productId: string): string {
    const product = this.products().find(p => p.id === productId);
    return product ? product.name : 'Unknown';
  }

  getPriceName(priceId: string): string {
    const price = this.prices().find(p => p.id === priceId);
    return price ? price.name : 'Unknown';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  isCurrentlyValid(validFrom: Date, validTo?: Date): boolean {
    const now = new Date();
    const from = new Date(validFrom);
    const to = validTo ? new Date(validTo) : null;
    
    return now >= from && (!to || now <= to);
  }

  getValidityStatusClass(validFrom: Date, validTo?: Date): string {
    if (this.isCurrentlyValid(validFrom, validTo)) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    }
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  }

  getValidityStatus(validFrom: Date, validTo?: Date): string {
    if (this.isCurrentlyValid(validFrom, validTo)) {
      return 'Active';
    }
    return 'Expired';
  }
}
