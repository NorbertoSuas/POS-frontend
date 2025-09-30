import { Component, computed, effect, EventEmitter, input, Input, output, Output, signal } from '@angular/core';
import { ProductExtra } from '../../models/product-extra';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-extras-select',
  imports: [CommonModule],
  templateUrl: './extras-select.html',
  styleUrl: './extras-select.css'
})
export class ExtrasSelect {
   productExtras = input<ProductExtra[]>([]);
  selectedProductExtras = output<ProductExtra[]>();
  
  // Signal for selected IDs
  selectedIds = signal<string[]>([]);

    constructor() {
    // Efecto para resetear selecciones cuando cambian los extras
    effect(() => {
      this.productExtras(); // Escuchar cambios
      this.selectedIds.set([]);  // Resetear selecciones
    });
    console.log('ExtrasSelect initialized with extras:', this.productExtras());
  }
  // Computed for selected extras (updates automatically)
  selectedExtras = computed(() => 
    this.productExtras().filter(e => this.selectedIds().includes(e.id))
  );



  // Toggle selection
  toggleSelection(extra: ProductExtra) {
    this.selectedIds.update(ids => 
      ids.includes(extra.id)
        ? ids.filter(id => id !== extra.id)
        : [...ids, extra.id]
    );
    
    // Emitir al padre
    
  }
  saveSelection() {
    this.selectedProductExtras.emit(this.selectedExtras());
  }
  
}
