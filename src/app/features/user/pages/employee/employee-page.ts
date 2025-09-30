
import { Component, signal, inject, WritableSignal } from '@angular/core';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { CommonModule } from '@angular/common';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';
import { IconService } from '../../../../shared/services/icon';
import { EmployeeForm } from '../../components/employee-form/employee-form';
import { GenericModal } from "../../../../shared/components/generic-modal/generic-modal";
import { EmployeeProfile } from '../../components/employee-profile/employee-profile';
import { ButtonExport } from "../../../../shared/components/button-export/button-export";

export type ModalType = 'create' | 'show' | 'delete-confirm'| 'update' | null;

@Component({
  selector: 'page-employee',
  standalone: true,
  templateUrl: './employee-page.html',
  styleUrl: './employee-page.css',
  imports: [
    CommonModule,
    ButtonCreate,
    EmployeeForm,
    GenericModal,
    EmployeeProfile,
    ButtonExport
],
})
export class EmployeePage {
  private readonly employeeService = inject(EmployeeService);
  private readonly iconService = inject(IconService);
  employees = this.employeeService.employees as WritableSignal<Employee[]>;

  //para los modales
  modalType = signal<ModalType>(null);
  modalData = signal<any>(null);

  constructor() {
    this.loadEmployees();
  }
  

  openModal(type: ModalType, data?: any) {
    if (type === 'update') {
      console.debug('Employee for update:', data);
    }
    this.modalType.set(type);
    this.modalData.set(data ?? null);
  }

  closeModal() {
    this.modalType.set(null);
    this.modalData.set(null);
  }

  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
      },
      error: (err) => {
        // Optional error handling
        this.employees.set([]);
      },
    });
  }

  /**
   * Deletes an employee by id using the service and updates the signal
   */
  deleteEmployee(id: string) {
    this.employeeService.deleteEmployee(id).subscribe({
      next: () => {
        // The employees signal already updates in the service
        this.closeModal();
      },
      error: (err) => {
        // Optional error handling
        console.error('Error deleting employee:', err);
      },
    });
  }

  // Returns the employee's initials
  getInitials(first: string, last: string): string {
    return (first?.charAt(0) + last?.charAt(0)).toUpperCase();
  }

  // Devuelve un color de fondo basado en el nombre completo
  getBackgroundColor(name: string): string {
    const colors = [
      '#6366F1', // indigo
      '#EF4444', // red
      '#10B981', // green
      '#F59E0B', // amber
      '#3B82F6', // blue
      '#8B5CF6', // violet
      '#EC4899', // pink
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }
  getIconHref(name: string): string {
    return this.iconService.getIconHref(name);
  }

}
