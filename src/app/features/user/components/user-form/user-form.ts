import { Component, inject, input, output, signal } from '@angular/core';
import { Role } from '../../models/Role';
import { Employee } from '../../models/employee';
import { UserDto } from '../../models/userDto';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EmployeeSelect } from '../employee-select/employee-select';
import { User } from '../../models/user';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, EmployeeSelect],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm {
  roles = input.required<Role[]>();
  employees = input.required<Employee[]>();
  initialUser = input<User | null>(null); // New input for update mode
  saveUser = output<User>();

  submitting = signal(false);

  private fb = inject(FormBuilder);
  userForm!: FormGroup;
  // Getter to easily access controls in the template
  get f() {
    return this.userForm.controls;
  }
  onEmployeeSelected(employee: Employee | null) {
    // 👈 Allow null
    this.userForm.patchValue({
      employeeId: employee ? employee.id : '', // 👈 Reset to empty if null
    });
  }

  submit() {
    if (this.userForm.valid) {
      const user = this.userForm.value;
      this.saveUser.emit(user);
      console.log('User sent:', user);
      // here you could call your service to save the user
    } else {
      this.userForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    const user = this.initialUser();

    // Always initialize the form
    this.userForm = this.fb.group({
      id: [''],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      roleId: ['', Validators.required],
      employeeId: ['', Validators.required],
    });

    // Then apply values if it's edit mode
    if (user != null) {
      this.userForm.patchValue({
        id: user.id?.toString() || '',
        username: user.username,
        password: user.password,
        roleId: user.roleId.toString(),
        employeeId: user.employeeId.toString(),
      });
    }
  }
}
