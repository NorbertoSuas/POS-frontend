import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { UsersService } from '../../services/users.service';
import { IconService } from '../../../../shared/services/icon';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee';
import { RolesService } from '../../services/roles.service';
import { Role } from '../../models/Role';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { UserForm } from '../../components/user-form/user-form';
import { UserProfile } from '../../components/user-profile/user-profile';
import { User } from '../../models/user';

export type ModalType = 'create-user' | 'update-user' | 'show-user' | null;

@Component({
  selector: 'page-user',
  standalone: true,
  templateUrl: './user-page.html',
  styleUrl: './user-page.css',
  imports: [
    ButtonExport,
    ButtonCreate,
    CommonModule,
    GenericModal,
    UserForm,
    UserProfile,
  ],
})
export class UserPage {
  private readonly _rolesService = inject(RolesService);
  private readonly _employeesService = inject(EmployeeService);
  private readonly _usersService = inject(UsersService);
  private readonly iconService = inject(IconService);
  _usersTableRow = this._usersService.usersTableRow as WritableSignal<
    UserTableRow[]
  >;
  _employees = this._employeesService.employees as WritableSignal<Employee[]>;
  _roles = this._rolesService.roles as WritableSignal<Role[]>;

  //#region MODALS
  modalType = signal<ModalType>(null);
  modalData = signal<any>(null);
  openModal(type: ModalType, data?: any) {
    this.modalType.set(type);
    this.modalData.set(data ?? null);
  }
  closeModal() {
    this.modalType.set(null);
    this.modalData.set(null);
  }

  //#endregion MODALS

  //#region TABLE DESIGN
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
  //#endregion TABLE DESIGN

  loadUsersTableRow() {
    this._usersService.getAllUsersTableRow().subscribe({
      next: (usersTableRow) => {
        this._usersTableRow.set(usersTableRow);
      },
      error: (err) => {
        // Manejo de error opcional
        this._usersTableRow.set([]);
      },
    });
  }

  loadEmployees() {
    this._employeesService.getAllEmployees().subscribe({
      next: (employees) => {
        this._employees.set(employees);
      },
      error: (err) => {
        // Manejo de error opcional
        this._employees.set([]);
      },
    });
  }
  loadRoles() {
    this._rolesService.getAllRoles().subscribe({
      next: (roles) => {
        this._roles.set(roles);
      },
      error: (err) => {
        // Manejo de error opcional
        this._roles.set([]);
      },
    });
  }

  openCreateUserModal() {
    this.loadEmployees();
    this.loadRoles();
    this.openModal('create-user');
  }
  openUpdateUserModal(userId: string) {
    this.loadEmployees();
    this.loadRoles();
    this._usersService.getUserById(userId).subscribe({
      next: (user) => {
        this.openModal('update-user', user);
      },
      error: (err) => {
        console.error('Error getting user:', err);
      },
    });
  }
  openShowUserModal(userId: string) {
    this._usersService.getUserDtoById(userId).subscribe({
      next: (userDto) => {
        this.openModal('show-user', userDto);
      },
      error: (err) => {
        console.error('Error al obtener UserDto:', err);
      },
    });
  }
  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this._usersService.deleteUser(userId).subscribe({
        next: (success) => {
          if (success) {
          }
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        },
      });
    }
  }
  submitUser(userDto: User) {
   
    this._usersService.saveUser(userDto).subscribe({
      next: (savedUser) => {
         this.closeModal();
      },
      error: (err) => {
        console.error('Error saving user:', err);
      },
    });   
  }

  ngOnInit() {
    this.loadUsersTableRow();
  }
}
