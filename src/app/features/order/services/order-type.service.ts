import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ProductItem } from '../models/product-item';
import { ApiResponse } from '../../../shared/models/api-response';
import { catchError, of, tap } from 'rxjs';
import { OrderType } from '../models/order-type';

@Injectable({ providedIn: 'root' })
export class OrderTypeService {
  // Here you can add the order service logic
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.orders.prefix}${environment.api.orders.ordersTypes.prefix}`;
  private endpoints = environment.api.orders.ordersTypes.endpoints;

  // Reactive state with Signals
  private _orderTypes = signal([
    { id: '', name: 'Loading...', description: '' },
    { id: '', name: 'Loading...', description: '' },
  ]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  // Computed selectors
  orderTypes = computed(() => this._orderTypes());

  loadOrderTypes() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<OrderType[]>>(`${this.baseUrl}${this.endpoints.getAll}`)
      .pipe(
        tap((response) => {
          if (response.success) {
            this._orderTypes.set(response.data);
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
