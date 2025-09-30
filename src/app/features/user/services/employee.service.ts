import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Employee } from '../models/employee';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl =
    environment.api.baseUrl +
    environment.api.users.prefix +
    environment.api.users.employee.prefix;
  private readonly endpoints = environment.api.users.employee.endpoints;
  employees = signal<Employee[]>([]);

  getAllEmployees(): Observable<Employee[]> {
    return this.http
      .get<ApiResponse<Employee[]>>(this.baseUrl + this.endpoints.getAll)
      .pipe(
        map((res) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }
          this.employees.set(res.data);
          return res.data;
        }),
        catchError((err) => {
          console.error('Error API:', err.message);
          return throwError(() => err);
        })
      );
  }

  // createEmployee(employee: Employee): Observable<Employee> {
  // return this.http.post<ApiResponse<Employee>>(this.baseUrl + this.endpoints.create, employee).pipe(
  //   map(res => {
  //     debugger;
  //     console.log('Respuesta API createEmployee:', res);
  //     if (!res.success) {
  //       throw new Error(`(${res.code}) ${res.message}`);
  //     }

  //     //Insert the new employee into the signal (without reloading everything)
  //     this.employees.update(list => {
  //       const updated = [...list, res.data];
  //       console.log('Array employees actualizado:', updated);
  //       return updated;
  //     });
  //     return res.data;
  //   }),
  //   catchError(err => {
  //     console.error('Error API:', err.message);
  //     return throwError(() => err);
  //   })
  // );
  // }

  /**
   * Deletes an employee by their id and updates the employees signal
   */
  deleteEmployee(id: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<null>>(
        this.baseUrl + this.endpoints.delete(String(id))
      )
      .pipe(
        map((res: ApiResponse<null>) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }
          this.employees.update((list) => list.filter((e) => e.id !== id));
          return true;
        }),
        catchError((err) => {
          console.error('Error API:', err.message);
          return throwError(() => err);
        })
      );
  }

  /**
   * Updates an employee and synchronizes the employees signal
   */
  updateEmployee(employee: Employee): Observable<Employee> {
    return this.http
      .put<ApiResponse<Employee>>(
        this.baseUrl + this.endpoints.update(employee.id),
        employee
      )
      .pipe(
        map((res: ApiResponse<Employee>) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }
          this.employees.update((list) =>
            list.map((e) => (e.id === employee.id ? res.data : e))
          );
          return res.data;
        }),
        catchError((err) => {
          console.error('Error API:', err.message);
          return throwError(() => err);
        })
      );
  }

  /**
   * Creates or updates an employee (upsert) depending on whether the id is empty or not
   */
  saveEmployee(employee: Employee): Observable<Employee> {
    console.log('Saving employee:', employee);
    return this.http
      .post<ApiResponse<Employee>>(
        this.baseUrl + this.endpoints.upsert,
        employee
      )
      .pipe(
        map((res: ApiResponse<Employee>) => {
          if (!res.success) {
            throw new Error(`(${res.code}) ${res.message}`);
          }
          if (employee.id) {
            // Update existing employee
            this.employees.update((list) =>
              list.map((e) => (e.id === employee.id ? employee : e))
            );
          } else {
            // Add new employee
            this.employees.update((list) => [...list, res.data]);
          }
          return res.data;
        }),
        catchError((err) => {
          console.error('Error API:', err.message);
          return throwError(() => err);
        })
      );
  }
}
