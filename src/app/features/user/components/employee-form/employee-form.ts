import { Component, signal, inject, input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css',
})
export class EmployeeForm implements OnChanges {
  private employeeService = inject(EmployeeService);
  employee = input<Employee>();
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  // Reactive form creado con Formgroup
  form: FormGroup = new FormGroup({
    id:         new FormControl(''),
    firstName: new FormControl('', [Validators.required]),
    lastName:  new FormControl('', [Validators.required]),
    phone:      new FormControl('', [Validators.required]),
    photo:      new FormControl(''),
    status:     new FormControl(1),
    email:      new FormControl('', [Validators.required, Validators.email]),
    startDate: new FormControl('', [Validators.required]),
    birthDate: new FormControl('', [Validators.required]),
    endDate:   new FormControl(''),
  });


  ngOnInit() {
    console.log('EmployeeForm initialized with employee:', this.employee());
    this.patchFormFromInput();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['employee']) {
      this.patchFormFromInput();
    }
  }

  private patchFormFromInput() {
    const emp = this.employee();
    if (emp) {
      this.form.patchValue(emp);
      // If there's a photo (base64 or url) and no image is selected, show the photo
      if (emp.photo && !this.selectedFile()) {
        this.imagePreview.set(emp.photo);
      }
    } else {
      this.form.reset();
      this.imagePreview.set(null);
    }
  }

  // Signals for UI states
  submitting = signal(false);
  success   = signal(false);
  error     = signal<string | null>(null);
  lastOperationWasUpdate = signal<boolean>(false);

  // When the user selects a file
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const maxSizeMB = 2;
    if (file.size > maxSizeMB * 1024 * 1024) {
      this.error.set(`The photo cannot exceed ${maxSizeMB}MB`);
      return;
    }
    this.selectedFile.set(file);
    this.error.set(null);

    // Generar preview
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }



  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const employee = this.form.value;
    // Determine status dynamically based on end_date
    const today = new Date();
    let status = 1; // active by default
    if (employee.end_date) {
      const endDate = new Date(employee.end_date);
      if (!isNaN(endDate.getTime()) && endDate < today) {
        status = 0; // inactive
      }
    }
    employee.status = status;
    // Save if it's update or create before resetting the form
    this.lastOperationWasUpdate.set(!!employee.id);
    this.employeeService.saveEmployee(employee).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        this.form.reset();
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.message || 'Error saving employee');
      }
    });
  }
}
