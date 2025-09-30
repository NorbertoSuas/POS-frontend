import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Tax, TaxCreateRequest, TaxUpdateRequest } from '../models/tax';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class TaxService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}${environment.api.inventory.taxes.prefix}`;

  // Estado reactivo con Signals
  private readonly _taxes = signal<Tax[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Selectores computados
  taxes = computed(() => this._taxes());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadTaxes() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<Tax[]>>(`${this.baseUrl}${environment.api.inventory.taxes.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._taxes.set(response.data);
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
  create(tax: TaxCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<Tax>>(`${this.baseUrl}${environment.api.inventory.taxes.endpoints.create}`, tax)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._taxes.update(taxes => [...taxes, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  upsert(tax: TaxCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .patch<ApiResponse<Tax>>(`${this.baseUrl}${environment.api.inventory.taxes.endpoints.upsert}`, tax)
      .pipe(
        tap(response => {
          if (response?.success) {
            // Check if tax already exists (by name) and update, otherwise add new
            this._taxes.update(taxes => {
              const existingIndex = taxes.findIndex(t => t.name === response.data.name);
              if (existingIndex >= 0) {
                // Update existing tax
                const updatedTaxes = [...taxes];
                updatedTaxes[existingIndex] = response.data;
                return updatedTaxes;
              } else {
                // Add new tax
                return [...taxes, response.data];
              }
            });
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, tax: TaxUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<Tax>>(`${this.baseUrl}${environment.api.inventory.taxes.endpoints.update(id)}`, tax)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._taxes.update(taxes => 
              taxes.map(t => t.id === id ? { ...t, ...response.data } : t)
            );
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  delete(id: string) {
    this._loading.set(true);
    
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.taxes.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._taxes.update(taxes => taxes.filter(t => t.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Métodos de compatibilidad
  getAll(): Observable<ApiResponse<Tax[]>> {
    return this.http.get<ApiResponse<Tax[]>>(`${this.baseUrl}${environment.api.inventory.taxes.endpoints.list}`);
  }

  getById(id: string): Observable<ApiResponse<Tax>> {
    return this.http.get<ApiResponse<Tax>>(`${this.baseUrl}${environment.api.inventory.taxes.endpoints.getById(id)}`);
  }
} 