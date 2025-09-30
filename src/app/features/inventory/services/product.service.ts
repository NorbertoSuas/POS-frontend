import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product, ProductCreateRequest, ProductUpdateRequest } from '../../../shared/models/product';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.inventory.products.prefix}`;

  // Estado reactivo con Signals
  private _products = signal<Product[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectores computados
  products = computed(() => this._products());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadProducts() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<Product[]>>(`${this.baseUrl}${environment.api.inventory.products.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._products.set(response.data);
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
  create(product: ProductCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<Product>>(`${this.baseUrl}${environment.api.inventory.products.endpoints.create}`, product)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._products.update(products => [...products, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, product: ProductUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<Product>>(`${this.baseUrl}${environment.api.inventory.products.endpoints.update(id)}`, product)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._products.update(products => 
              products.map(p => p.id === id ? { ...p, ...response.data } : p)
            );
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  delete(id: string) {
    this._loading.set(true);
    
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.products.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._products.update(products => products.filter(p => p.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Métodos de compatibilidad
  getAll(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}${environment.api.inventory.products.endpoints.list}`);
  }

  getById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}${environment.api.inventory.products.endpoints.getById(id)}`);
  }

  getCategories(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}${environment.api.inventory.products.endpoints.categories}`);
  }
} 