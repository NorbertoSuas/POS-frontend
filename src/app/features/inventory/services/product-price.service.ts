import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProductPrice, ProductPriceCreateRequest, ProductPriceUpdateRequest } from '../models/product-price';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class ProductPriceService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.inventory.productPrices.prefix}`;

  // Estado reactivo con Signals
  private _productPrices = signal<ProductPrice[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectores computados
  productPrices = computed(() => this._productPrices());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadProductPrices() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<ProductPrice[]>>(`${this.baseUrl}${environment.api.inventory.productPrices.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._productPrices.set(response.data);
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
  create(productPrice: ProductPriceCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<ProductPrice>>(`${this.baseUrl}${environment.api.inventory.productPrices.endpoints.create}`, productPrice)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._productPrices.update(prices => [...prices, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, productPrice: ProductPriceUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<ProductPrice>>(`${this.baseUrl}${environment.api.inventory.productPrices.endpoints.update(id)}`, productPrice)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._productPrices.update(prices => 
              prices.map(p => p.id === id ? { ...p, ...response.data } : p)
            );
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  delete(id: string) {
    this._loading.set(true);
    
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.productPrices.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._productPrices.update(prices => prices.filter(p => p.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Métodos de compatibilidad
  getAll(): Observable<ApiResponse<ProductPrice[]>> {
    return this.http.get<ApiResponse<ProductPrice[]>>(`${this.baseUrl}${environment.api.inventory.productPrices.endpoints.list}`);
  }

  getById(id: string): Observable<ApiResponse<ProductPrice>> {
    return this.http.get<ApiResponse<ProductPrice>>(`${this.baseUrl}${environment.api.inventory.productPrices.endpoints.getById(id)}`);
  }
} 