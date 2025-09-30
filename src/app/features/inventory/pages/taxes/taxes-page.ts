import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { TaxService } from '../../services/tax.service';
import { Tax } from '../../models/tax';

@Component({
  selector: 'page-taxes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonCreate, ButtonExport, GenericModal],
  templateUrl: './taxes-page.html',
  styleUrl: './taxes-page.css'
})
export class TaxesPage implements OnInit {
  showModal = false;
  editingTax: Tax | null = null;
  taxForm: FormGroup;

  constructor(
    public taxService: TaxService,
    private readonly fb: FormBuilder
  ) {
    this.taxForm = this.fb.group({
      name: ['', Validators.required],
      rate: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit() {
    this.loadTaxes();
  }

  loadTaxes() {
    this.taxService.loadTaxes().subscribe();
  }

  openCreateModal() {
    this.editingTax = null;
    this.taxForm.reset();
    this.showModal = true;
  }

  openEditModal(tax: Tax) {
    this.editingTax = tax;
    this.taxForm.patchValue({
      name: tax.name,
      rate: tax.rate
    });
    this.showModal = true;
  }

  saveTax() {
    if (this.taxForm.valid) {
      const taxData = this.taxForm.value;

      // Use upsert for both create and update operations
      this.taxService.upsert(taxData).subscribe({
        next: () => {
          this.closeModal();
        },
        error: (error) => console.error('Error saving tax:', error)
      });
    }
  }

  deleteTax(tax: Tax) {
    if (confirm(`Are you sure you want to delete ${tax.name}?`)) {
      this.taxService.delete(tax.id!).subscribe({
        error: (error) => console.error('Error deleting tax:', error)
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingTax = null;
    this.taxForm.reset();
  }

  getTotalTaxes(): number {
    return this.taxService.taxes().length;
  }

  getActiveTaxes(): number {
    return this.taxService.taxes().length;
  }
}
