import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MovementType, MovementTypeCreateRequest, MovementTypeUpdateRequest } from '../models/movement-type';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class MovementTypeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.inventory.movementTypes.prefix}`;

  // Estado reactivo con Signals
  private _movementTypes = signal<MovementType[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectores computados
  movementTypes = computed(() => this._movementTypes());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadMovementTypes() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<MovementType[]>>(`${this.baseUrl}${environment.api.inventory.movementTypes.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._movementTypes.set(response.data);
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
  create(movementType: MovementTypeCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<MovementType>>(`${this.baseUrl}${environment.api.inventory.movementTypes.endpoints.create}`, movementType)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._movementTypes.update(types => [...types, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, movementType: MovementTypeUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<MovementType>>(`${this.baseUrl}${environment.api.inventory.movementTypes.endpoints.update(id)}`, movementType)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._movementTypes.update(types => 
              types.map(t => t.id === id ? { ...t, ...response.data } : t)
            );
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  delete(id: string) {
    this._loading.set(true);
    
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.movementTypes.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._movementTypes.update(types => types.filter(t => t.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Métodos de compatibilidad
  getAll(): Observable<ApiResponse<MovementType[]>> {
    return this.http.get<ApiResponse<MovementType[]>>(`${this.baseUrl}${environment.api.inventory.movementTypes.endpoints.list}`);
  }

  getById(id: string): Observable<ApiResponse<MovementType>> {
    return this.http.get<ApiResponse<MovementType>>(`${this.baseUrl}${environment.api.inventory.movementTypes.endpoints.getById(id)}`);
  }
} 