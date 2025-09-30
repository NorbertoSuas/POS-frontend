import { Component, computed, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { Employee } from '../../models/employee';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconService } from '../../../../shared/services/icon';

@Component({
  selector: 'app-employee-select',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './employee-select.html',
  styleUrl: './employee-select.css'
})
export class EmployeeSelect {
  private readonly iconService = inject(IconService);

  // Required inputs using signals
  employees = input.required<Employee[]>();
  initialEmployeeSelected = input<string | null>(null); // Allow null to reset
  employeeSelected = output<Employee | null>();
  
  // Internal state with signals
  searchText = signal('');
  isDropdownOpen = signal(false);
  selectedEmployee = signal<Employee | null>(null);
  
  // Computed values
  filteredEmployees = computed(() => {
    const term = this.searchText().toLowerCase().trim();
    const employees = this.employees();
    
    return term 
      ? employees.filter(e => 
          e.firstName?.toLowerCase().includes(term)
        )
      : employees;
  });
  
  hasResults = computed(() => this.filteredEmployees().length > 0);
  
  // Container reference with viewChild signal
  inputContainer = viewChild<ElementRef>('inputContainer');

  constructor() {
     // Synchronize external value with internal signal
    effect(() => {
      const initEmployeeSelected = this.initialEmployeeSelected();
      if (initEmployeeSelected !== this.selectedEmployee()?.id) {
        const employee = this.employees().find(e => e.id === initEmployeeSelected) || null;
        this.selectedEmployee.set(employee);
      }
    });
    // Effect to close dropdown when selecting
    effect(() => {
      if (this.selectedEmployee()) {
        this.isDropdownOpen.set(false);
        this.searchText.set('');
      }
    });

    // Effect to handle clicks outside the component
    effect((onCleanup) => {
      if (!this.isDropdownOpen()) return;
      
      const handler = (event: Event) => {
        const container = this.inputContainer()?.nativeElement;
        const target = event.target as Node;
        
        if (container && !container.contains(target)) {
          this.isDropdownOpen.set(false);
        }
      };

      // We use the 'pointerdown' event which is faster than 'click'
      document.addEventListener('pointerdown', handler);
      
      // Automatic cleanup function
      onCleanup(() => {
        document.removeEventListener('pointerdown', handler);
      });
    });
  }
  //icono
    getIconHref(name: string): string {
    return this.iconService.getIconHref(name);
  }

  // Handle selection
  selectEmployee(employee: Employee) {
    this.selectedEmployee.set(employee);
    this.employeeSelected.emit(employee);
  }

  // Update search text
  updateSearchText(value: string) {
    this.searchText.set(value);
    this.isDropdownOpen.set(true);
  }

  // Method to clear selection
  clearSelection(): void {
    this.selectedEmployee.set(null);
    this.employeeSelected.emit(null); // 👈 Emit null
  }
}
