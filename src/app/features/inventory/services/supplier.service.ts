import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap, finalize, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Supplier, SupplierCreateRequest, SupplierUpdateRequest } from '../models/supplier';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.inventory.suppliers.prefix}`;

  // Estado reactivo con Signals
  private _suppliers = signal<Supplier[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectores computados
  suppliers = computed(() => this._suppliers());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadSuppliers() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<Supplier[]>>(`${this.baseUrl}${environment.api.inventory.suppliers.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._suppliers.set(response.data);
          } else {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          this._error.set('Error de conexión');
          return of(null);
        }),
        tap(() => this._loading.set(false))
      );
  }

  // Operaciones CRUD con actualización reactiva
  create(supplier: SupplierCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<Supplier>>(`${this.baseUrl}${environment.api.inventory.suppliers.endpoints.create}`, supplier)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._suppliers.update(suppliers => [...suppliers, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, supplier: SupplierUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<Supplier>>(`${this.baseUrl}${environment.api.inventory.suppliers.endpoints.update(id)}`, supplier)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._suppliers.update(suppliers => 
              suppliers.map(s => s.id === id ? { ...s, ...response.data } : s)
            );
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  delete(id: string) {
    this._loading.set(true);
    
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.suppliers.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._suppliers.update(suppliers => suppliers.filter(s => s.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Métodos de compatibilidad
  getAll(): Observable<Supplier[]> {
    return this.http.get<ApiResponse<Supplier[]>>(`${this.baseUrl}${environment.api.inventory.suppliers.endpoints.list}`).pipe(
      map(res => {
        if (!res.success) {
          throw new Error(`(${res.code}) ${res.message}`);
        }
        this._suppliers.set(res.data);
        return res.data;
      }),
      catchError(err => {
        console.error('Error API:', err.message);
        return throwError(() => err);
      })
    );
  }

  getById(id: string): Observable<ApiResponse<Supplier>> {
    return this.http.get<ApiResponse<Supplier>>(`${this.baseUrl}${environment.api.inventory.suppliers.endpoints.getById(id)}`);
  }
} 