import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StorageType, StorageTypeCreateRequest, StorageTypeUpdateRequest } from '../models/storage-type';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class StorageTypeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.inventory.storageTypes.prefix}`;

  // Estado reactivo con Signals
  private _storageTypes = signal<StorageType[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectores computados
  storageTypes = computed(() => this._storageTypes());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadStorageTypes() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<StorageType[]>>(`${this.baseUrl}${environment.api.inventory.storageTypes.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._storageTypes.set(response.data);
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
  create(storageType: StorageTypeCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<StorageType>>(`${this.baseUrl}${environment.api.inventory.storageTypes.endpoints.create}`, storageType)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._storageTypes.update(types => [...types, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, storageType: StorageTypeUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<StorageType>>(`${this.baseUrl}${environment.api.inventory.storageTypes.endpoints.update(id)}`, storageType)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._storageTypes.update(types => 
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
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.storageTypes.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._storageTypes.update(types => types.filter(t => t.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Métodos de compatibilidad
  getAll(): Observable<ApiResponse<StorageType[]>> {
    return this.http.get<ApiResponse<StorageType[]>>(`${this.baseUrl}${environment.api.inventory.storageTypes.endpoints.list}`);
  }

  getById(id: string): Observable<ApiResponse<StorageType>> {
    return this.http.get<ApiResponse<StorageType>>(`${this.baseUrl}${environment.api.inventory.storageTypes.endpoints.getById(id)}`);
  }
} 