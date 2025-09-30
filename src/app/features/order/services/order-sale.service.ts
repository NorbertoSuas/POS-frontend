import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { catchError, of, tap } from 'rxjs';
import { OrderSaleDto } from '../models/order-sale-dto';

@Injectable({ providedIn: 'root' })
export class OrderSaleService {
  // Here you can add the order service logic
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}${environment.api.orders.prefix}${environment.api.orders.orderSale.prefix}`;
  private readonly endpoints = environment.api.orders.orderSale.endpoints;

  loadOrderSale() {
    // TODO: Implement order sale loading logic
  }
  create(ordeSale: OrderSaleDto) {
    return this.http
      .post<ApiResponse<string>>(
        `${this.baseUrl}${this.endpoints.create}`,
        ordeSale
      )
      .pipe(
        tap((response) => {
          if (response.success) {
            console.log('Order sale created successfully');
          } else {
            console.error('Error creating order sale:', response.message);
          }
        }),
        catchError((err) => {
          console.error('Connection error:', err);
          return of(null);
        })
      );

  }

}
