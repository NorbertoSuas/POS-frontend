import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InventoryMovement, InventoryMovementCreateRequest, InventoryMovementUpdateRequest } from '../models/inventory-movement';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class InventoryMovementService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.inventory.inventoryMovements.prefix}`;

  // Estado reactivo con Signals
  private _inventoryMovements = signal<InventoryMovement[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectores computados
  inventoryMovements = computed(() => this._inventoryMovements());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadInventoryMovements() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<InventoryMovement[]>>(`${this.baseUrl}${environment.api.inventory.inventoryMovements.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._inventoryMovements.set(response.data);
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
  create(inventoryMovement: InventoryMovementCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<InventoryMovement>>(`${this.baseUrl}${environment.api.inventory.inventoryMovements.endpoints.create}`, inventoryMovement)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._inventoryMovements.update(movements => [...movements, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, inventoryMovement: InventoryMovementUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<InventoryMovement>>(`${this.baseUrl}${environment.api.inventory.inventoryMovements.endpoints.update(id)}`, inventoryMovement)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._inventoryMovements.update(movements => 
              movements.map(m => m.id === id ? { ...m, ...response.data } : m)
            );
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  delete(id: string) {
    this._loading.set(true);
    
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.inventoryMovements.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._inventoryMovements.update(movements => movements.filter(m => m.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Métodos de compatibilidad
  getAll(): Observable<ApiResponse<InventoryMovement[]>> {
    return this.http.get<ApiResponse<InventoryMovement[]>>(`${this.baseUrl}${environment.api.inventory.inventoryMovements.endpoints.list}`);
  }

  getById(id: string): Observable<ApiResponse<InventoryMovement>> {
    return this.http.get<ApiResponse<InventoryMovement>>(`${this.baseUrl}${environment.api.inventory.inventoryMovements.endpoints.getById(id)}`);
  }
} 