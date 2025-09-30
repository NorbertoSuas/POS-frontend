import { Component, inject, signal, WritableSignal } from '@angular/core';
import { IconService } from '../../../../shared/services/icon';
import { RolesService } from '../../services/roles.service';
import { Role } from '../../models/Role';
import { ButtonExport } from '../../../../shared/components/button-export/button-export';
import { ButtonCreate } from '../../../../shared/components/button-create/button-create';
import { GenericModal } from '../../../../shared/components/generic-modal/generic-modal';
import { PermissionsService } from '../../services/permissions.service';
import { Permission } from '../../models/permissions';
import { RoleForm } from '../../components/role-form/role-form';
import { RolePermissions } from '../../models/RolePermissions';

export type ModalType =
  | 'create-role'
  | 'update-role'
  | 'create-permission'
  | 'show-permission'
  | null;

@Component({
  selector: 'page-role',
  standalone: true,
  templateUrl: './role-page.html',
  styleUrl: './role-page.css',
  imports: [ButtonExport, ButtonCreate, GenericModal, RoleForm],
})
export class RolePage {
  private readonly rolesService = inject(RolesService);
  private readonly permissionService = inject(PermissionsService);
  private readonly iconService = inject(IconService);
  roles = this.rolesService.roles as WritableSignal<Role[]>;
  permissions = this.permissionService.permission as WritableSignal<
    Permission[]
  >;

  getIconHref(name: string): string {
    return this.iconService.getIconHref(name);
  }
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

  //#region PERMISSIONS
  loadPermissions() {
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.permissions.set(permissions);
        console.log('Signal permissions:', this.permissions());
      },
      error: (err) => {
        // Optional error handling
        this.permissions.set([]);
        console.log('Permissions error:', err);
      },
    });
  }
  //#endregion PERMISSIONS

  //#region ROLES
  loadRoles() {
    this.rolesService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        console.log('Signal roles:', this.roles());
      },
      error: (err) => {
        // Optional error handling
        this.roles.set([]);
        console.log('Roles error:', err);
      },
    });
  }
  deleteRol(role: Role) {
    this.rolesService.deleteRole(role.id).subscribe({
      next: () => {
        // Update local roles list (signal already updates in service)
        console.log('Role deleted:', role.id);
      },
      error: (err) => {
        console.error('Error deleting role:', err);
      },
    });
  }
  onUpdateRole(role: Role) {
    this.rolesService.getRolePermissionsById(role.id).subscribe({
      next: (roleWithPermissions) => {
        this.openModal('update-role', roleWithPermissions);
      },
      error: (err) => {
        console.error('Error getting role:', err);
      },
    });
  }

  summitRol(rolePermissions: RolePermissions) {
    console.log('Role to create/update:', rolePermissions);
    this.rolesService.assignPermissions(rolePermissions).subscribe({
      next: (newRole) => {
        this.closeModal();
        console.log('Role created:', newRole);
      },
      error: (err) => {
        console.error('Error creating role:', err);
      },
    });
  }
  //#endregion ROLES

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }
}
