import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProductType, ProductTypeCreateRequest, ProductTypeUpdateRequest } from '../../../shared/models/product-type';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({ providedIn: 'root' })
export class ProductTypeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.inventory.productTypes.prefix}`;
  private endpoints = environment.api.inventory.productTypes.endpoints;

  // Estado reactivo con Signals
  private _productTypes = signal<ProductType[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectores computados
  productTypes = computed(() => this._productTypes());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadProductTypes() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<ProductType[]>>(`${this.baseUrl}${this.endpoints.getAll}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._productTypes.set(response.data);
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
  create(productType: ProductTypeCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<ProductType>>(`${this.baseUrl}${this.endpoints.create}`, productType)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._productTypes.update(types => [...types, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, update: ProductTypeUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<ProductType>>(`${this.baseUrl}${this.endpoints.update(id)}`, update)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._productTypes.update(types => 
              types.map(t => t.id === id ? { ...t, ...response.data } : t)
            );
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  delete(id: string) {
    this._loading.set(true);
    
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}${this.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._productTypes.update(types => types.filter(t => t.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }
}
