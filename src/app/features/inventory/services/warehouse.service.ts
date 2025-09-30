import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Warehouse, WarehouseCreateRequest, WarehouseUpdateRequest } from '../models/warehouse';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.inventory.warehouses.prefix}`;

  // Estado reactivo con Signals
  private _warehouses = signal<Warehouse[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectores computados
  warehouses = computed(() => this._warehouses());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadWarehouses() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<Warehouse[]>>(`${this.baseUrl}${environment.api.inventory.warehouses.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._warehouses.set(response.data);
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
  create(warehouse: WarehouseCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<Warehouse>>(`${this.baseUrl}${environment.api.inventory.warehouses.endpoints.create}`, warehouse)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._warehouses.update(warehouses => [...warehouses, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, warehouse: WarehouseUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<Warehouse>>(`${this.baseUrl}${environment.api.inventory.warehouses.endpoints.update(id)}`, warehouse)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._warehouses.update(warehouses => 
              warehouses.map(w => w.id === id ? { ...w, ...response.data } : w)
            );
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  delete(id: string) {
    this._loading.set(true);
    
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.warehouses.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._warehouses.update(warehouses => warehouses.filter(w => w.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Métodos de compatibilidad
  getAll(): Observable<ApiResponse<Warehouse[]>> {
    return this.http.get<ApiResponse<Warehouse[]>>(`${this.baseUrl}${environment.api.inventory.warehouses.endpoints.list}`);
  }

  getById(id: string): Observable<ApiResponse<Warehouse>> {
    return this.http.get<ApiResponse<Warehouse>>(`${this.baseUrl}${environment.api.inventory.warehouses.endpoints.getById(id)}`);
  }
} 