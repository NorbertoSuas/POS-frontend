// role-form.component.ts
import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Permission } from '../../models/permissions';
import { RolePermissions } from '../../models/RolePermissions';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './role-form.html',
  styleUrl: './role-form.css',
})
export class RoleForm {
  permissions = input.required<Permission[]>();
  initialRolePermissions = input<RolePermissions | null>(null); // New input for update mode
  newrolePermissions = output<RolePermissions>();

  private fb = inject(FormBuilder);
  permissionList = signal<Permission[]>([]); // Signal for permissions list

  // Simplified reactive form
  form = this.fb.group({
    id: [''],
    name: ['', [Validators.required]],
    description: [''],
    status: [1],
    permissions: this.fb.array<FormControl<boolean>>(
      [],
      [this.permissionsValidator]
    ),
  });

  // Signals for UI states
  submitting = signal(false);
  error = signal<string | null>(null);

  constructor() {
    effect(
      () => {
        const perms = this.permissions();
        const initial = this.initialRolePermissions();

        this.permissionList.set(perms);

        // Build permission controls with explicit type
        const permissionControls = perms.map((permission) => {
          const isSelected =
            initial?.permissions_id?.includes(permission.id) ?? false;

          // Create control with explicit type and nonNullable
          return this.fb.control<boolean>(isSelected, { nonNullable: true });
        });

        // Create the FormArray with type casting
        const permissionsArray = this.fb.array(permissionControls) as FormArray<
          FormControl<boolean>
        >;

        this.form.setControl('permissions', permissionsArray);

        if (initial) {
          this.form.patchValue({
            id: initial.id,
            name: initial.name,
            description: initial.description,
            status: initial.status,
          });
        }
      },
      { allowSignalWrites: true }
    );
  }

  get permissionsArray(): FormArray<FormControl<boolean>> {
    return this.form.get('permissions') as FormArray<FormControl<boolean>>;
  }

  private permissionsValidator(control: AbstractControl) {
    const permissionsArray = control as FormArray;
    if (!permissionsArray.length) return { noPermissionsAvailable: true };
    return permissionsArray.controls.some((c) => c.value)
      ? null
      : { noPermissionsSelected: true };
  }

  submit() {
    this.permissionsArray.markAsTouched();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const selectedPermissions = this.permissionList()
      .filter((_, i) => this.permissionsArray.at(i).value)
      .map((p) => p.id);

    const rolePermissions: RolePermissions = {
      id: formValue.id || '',
      name: formValue.name || '',
      description: formValue.description || '',
      status: formValue.status || 1,
      permissions_id: selectedPermissions,
    };

    this.newrolePermissions.emit(rolePermissions);
    this.submitting.set(false);
  }
}
