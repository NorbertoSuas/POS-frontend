import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Storage, StorageCreateRequest, StorageUpdateRequest } from '../models/storage';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private http = inject(HttpClient);
  private baseUrl = environment.api.baseUrl;

  // Estado reactivo con Signals
  private _storages = signal<Storage[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectores computados
  storages = computed(() => this._storages());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Carga inicial de datos
  loadStorages() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<Storage[]>>(`${this.baseUrl}${environment.api.inventory.storage.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._storages.set(response.data);
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
  create(storage: StorageCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<Storage>>(`${this.baseUrl}${environment.api.inventory.storage.endpoints.create}`, storage)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._storages.update(storages => [...storages, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, storage: StorageUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<Storage>>(`${this.baseUrl}${environment.api.inventory.storage.endpoints.update}/${id}`, storage)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._storages.update(storages => 
              storages.map(s => s.id === id ? { ...s, ...response.data } : s)
            );
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  delete(id: string) {
    this._loading.set(true);
    
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.storage.endpoints.delete}/${id}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._storages.update(storages => storages.filter(s => s.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Métodos de compatibilidad
  getAll(): Observable<ApiResponse<Storage[]>> {
    return this.http.get<ApiResponse<Storage[]>>(`${this.baseUrl}${environment.api.inventory.storage.endpoints.list}`);
  }

  getById(id: string): Observable<ApiResponse<Storage>> {
    return this.http.get<ApiResponse<Storage>>(`${this.baseUrl}${environment.api.inventory.storage.endpoints.getById}/${id}`);
  }
} 