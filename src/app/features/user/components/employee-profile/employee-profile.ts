import { Component, input, Signal } from '@angular/core';
import { Employee } from '../../models/employee';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [],
  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.css'
})
export class EmployeeProfile {
  employee =input.required<Employee>();
}
