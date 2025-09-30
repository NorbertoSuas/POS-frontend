import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ProductItem } from '../models/product-item';
import { ApiResponse } from '../../../shared/models/api-response';
import { catchError, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  // Here you can add the order service logic
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.orders.prefix}${environment.api.orders.orders.prefix}`;
  private endpoints = environment.api.orders.orders.endpoints;

  // Reactive state with Signals
  private _productItems = signal<ProductItem[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  // Computed selectors
  productItems = computed(() => this._productItems());

  loadProductItems() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<ProductItem[]>>(
        `${this.baseUrl}${this.endpoints.getAllProductItem}`
      )
      .pipe(
        tap((response) => {
          if (response.success) {
            this._productItems.set(response.data);
          } else {
            this._error.set(response.message);
          }
        }),
        catchError((err) => {
          this._error.set('Connection error');
          return of(null);
        }),
        tap(() => this._loading.set(false))
      );
  }
}
