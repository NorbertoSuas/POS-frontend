import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Price, PriceCreateRequest, PriceUpdateRequest } from '../models/price';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class PriceService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.inventory.prices.prefix}`;

  // Estado reactivo con Signals
  private _prices = signal<Price[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectores computados
  prices = computed(() => this._prices());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadPrices() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<Price[]>>(`${this.baseUrl}${environment.api.inventory.prices.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._prices.set(response.data);
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
  create(price: PriceCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<Price>>(`${this.baseUrl}${environment.api.inventory.prices.endpoints.create}`, price)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._prices.update(prices => [...prices, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, price: PriceUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<Price>>(`${this.baseUrl}${environment.api.inventory.prices.endpoints.update(id)}`, price)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._prices.update(prices => 
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
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.prices.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._prices.update(prices => prices.filter(p => p.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Métodos de compatibilidad
  getAll(): Observable<ApiResponse<Price[]>> {
    return this.http.get<ApiResponse<Price[]>>(`${this.baseUrl}${environment.api.inventory.prices.endpoints.list}`);
  }

  getById(id: string): Observable<ApiResponse<Price>> {
    return this.http.get<ApiResponse<Price>>(`${this.baseUrl}${environment.api.inventory.prices.endpoints.getById(id)}`);
  }
} 