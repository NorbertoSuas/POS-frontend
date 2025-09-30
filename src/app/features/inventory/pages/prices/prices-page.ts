import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { PriceService } from '../../services/price.service';
import { Price, PriceCreateRequest, PriceUpdateRequest } from '../../models/price';
import { ApiResponse } from '../../../../shared/models/api-response';

@Component({
  selector: 'page-prices',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './prices-page.html',
  styleUrl: './prices-page.css'
})
export class PricesPage implements OnInit {
  prices = signal<Price[]>([]);
  loading = signal(false);
  showModal = signal(false);
  editingPrice = signal<Price | null>(null);
  priceForm: FormGroup;

  constructor(
    private priceService: PriceService,
    private fb: FormBuilder
  ) {
    this.priceForm = this.fb.group({
      name: ['', Validators.required],
      costPrice: [0, [Validators.required, Validators.min(0)]],
      markupPct: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      taxPct: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      finalPrice: [0, [Validators.required, Validators.min(0)]]
    });

    // Calculate final price when cost price, markup, or tax changes
    this.priceForm.get('costPrice')?.valueChanges.subscribe(() => this.calculateFinalPrice());
    this.priceForm.get('markupPct')?.valueChanges.subscribe(() => this.calculateFinalPrice());
    this.priceForm.get('taxPct')?.valueChanges.subscribe(() => this.calculateFinalPrice());
  }

  ngOnInit() {
    this.loadPrices();
  }

  loadPrices() {
    this.loading.set(true);
    this.priceService.getAll().subscribe({
      next: (response: ApiResponse<Price[]>) => {
        this.prices.set(response.data || []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading prices:', error);
        this.loading.set(false);
      }
    });
  }

  openCreateModal() {
    this.editingPrice.set(null);
    this.priceForm.reset({
      costPrice: 0,
      markupPct: 0,
      taxPct: 0,
      finalPrice: 0
    });
    this.showModal.set(true);
  }

  openEditModal(price: Price) {
    this.editingPrice.set(price);
    this.priceForm.patchValue({
      name: price.name,
      costPrice: price.costPrice,
      markupPct: price.markupPct,
      taxPct: price.taxPct,
      finalPrice: price.finalPrice
    });
    this.showModal.set(true);
  }

  savePrice() {
    if (this.priceForm.valid) {
      const priceData = this.priceForm.value;

      if (this.editingPrice()) {
        // Update existing price
        this.priceService.update(this.editingPrice()!.id!, priceData).subscribe({
          next: () => {
            this.loadPrices();
            this.closeModal();
          },
          error: (error) => console.error('Error updating price:', error)
        });
      } else {
        // Create new price
        this.priceService.create(priceData).subscribe({
          next: () => {
            this.loadPrices();
            this.closeModal();
          },
          error: (error) => console.error('Error creating price:', error)
        });
      }
    }
  }

  deletePrice(price: Price) {
    if (confirm(`Are you sure you want to delete ${price.name}?`)) {
      this.priceService.delete(price.id!).subscribe({
        next: () => {
          this.loadPrices();
        },
        error: (error) => console.error('Error deleting price:', error)
      });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.editingPrice.set(null);
    this.priceForm.reset();
  }

  getTotalPrices(): number {
    return this.prices().length;
  }

  calculateFinalPrice() {
    const costPrice = this.priceForm.get('costPrice')?.value || 0;
    const markupPct = this.priceForm.get('markupPct')?.value || 0;
    const taxPct = this.priceForm.get('taxPct')?.value || 0;

    if (costPrice > 0) {
      const markupAmount = costPrice * (markupPct / 100);
      const subtotal = costPrice + markupAmount;
      const taxAmount = subtotal * (taxPct / 100);
      const finalPrice = subtotal + taxAmount;

      this.priceForm.patchValue({ finalPrice: Math.round(finalPrice * 100) / 100 }, { emitEvent: false });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatPercentage(percentage: number): string {
    return `${percentage}%`;
  }
}
