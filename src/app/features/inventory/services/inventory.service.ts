import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Inventory, InventoryCreateRequest, InventoryUpdateRequest } from '../models/inventory';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.inventory.inventories.prefix}`;

  // Estado reactivo con Signals
  private _inventories = signal<Inventory[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectores computados
  inventories = computed(() => this._inventories());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadInventories() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<Inventory[]>>(`${this.baseUrl}${environment.api.inventory.inventories.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._inventories.set(response.data);
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
  create(inventory: InventoryCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<Inventory>>(`${this.baseUrl}${environment.api.inventory.inventories.endpoints.create}`, inventory)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._inventories.update(inventories => [...inventories, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, inventory: InventoryUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<Inventory>>(`${this.baseUrl}${environment.api.inventory.inventories.endpoints.update(id)}`, inventory)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._inventories.update(inventories => 
              inventories.map(i => i.id === id ? { ...i, ...response.data } : i)
            );
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  delete(id: string) {
    this._loading.set(true);
    
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.inventories.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._inventories.update(inventories => inventories.filter(i => i.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Métodos de compatibilidad
  getAll(): Observable<ApiResponse<Inventory[]>> {
    return this.http.get<ApiResponse<Inventory[]>>(`${this.baseUrl}${environment.api.inventory.inventories.endpoints.list}`);
  }

  getById(id: string): Observable<ApiResponse<Inventory>> {
    return this.http.get<ApiResponse<Inventory>>(`${this.baseUrl}${environment.api.inventory.inventories.endpoints.getById(id)}`);
  }
}
