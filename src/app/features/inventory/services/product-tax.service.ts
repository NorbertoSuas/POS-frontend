import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProductTax, ProductTaxCreateRequest, ProductTaxUpdateRequest } from '../models/product-tax';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class ProductTaxService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.inventory.productTaxes.prefix}`;

  // Estado reactivo con Signals
  private _productTaxes = signal<ProductTax[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectores computados
  productTaxes = computed(() => this._productTaxes());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadProductTaxes() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<ProductTax[]>>(`${this.baseUrl}${environment.api.inventory.productTaxes.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._productTaxes.set(response.data);
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
  create(productTax: ProductTaxCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<ProductTax>>(`${this.baseUrl}${environment.api.inventory.productTaxes.endpoints.create}`, productTax)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._productTaxes.update(taxes => [...taxes, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, productTax: ProductTaxUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<ProductTax>>(`${this.baseUrl}${environment.api.inventory.productTaxes.endpoints.update(id)}`, productTax)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._productTaxes.update(taxes => 
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
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.productTaxes.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._productTaxes.update(taxes => taxes.filter(t => t.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Métodos de compatibilidad
  getAll(): Observable<ApiResponse<ProductTax[]>> {
    return this.http.get<ApiResponse<ProductTax[]>>(`${this.baseUrl}${environment.api.inventory.productTaxes.endpoints.list}`);
  }

  getById(id: string): Observable<ApiResponse<ProductTax>> {
    return this.http.get<ApiResponse<ProductTax>>(`${this.baseUrl}${environment.api.inventory.productTaxes.endpoints.getById(id)}`);
  }
} 