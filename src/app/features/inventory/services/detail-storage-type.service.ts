import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DetailStorageType, DetailStorageTypeCreateRequest, DetailStorageTypeUpdateRequest } from '../models/detail-storage-type';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class DetailStorageTypeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.api.baseUrl}${environment.api.inventory.detailStorageTypes.prefix}`;

  // Reactive state with Signals
  private _detailStorageTypes = signal<DetailStorageType[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Computed selectors
  detailStorageTypes = computed(() => this._detailStorageTypes());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Initial data load
  loadDetailStorageTypes() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<DetailStorageType[]>>(`${this.baseUrl}${environment.api.inventory.detailStorageTypes.endpoints.list}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._detailStorageTypes.set(response.data);
          } else {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          this._error.set('Connection error');
          return of(null);
        }),
        tap(() => this._loading.set(false))
      );
  }

  // CRUD operations with reactive updates
  create(detailStorageType: DetailStorageTypeCreateRequest) {
    this._loading.set(true);
    
    return this.http
      .post<ApiResponse<DetailStorageType>>(`${this.baseUrl}${environment.api.inventory.detailStorageTypes.endpoints.create}`, detailStorageType)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._detailStorageTypes.update(types => [...types, response.data]);
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  update(id: string, detailStorageType: DetailStorageTypeUpdateRequest) {
    this._loading.set(true);
    
    return this.http
      .put<ApiResponse<DetailStorageType>>(`${this.baseUrl}${environment.api.inventory.detailStorageTypes.endpoints.update(id)}`, detailStorageType)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._detailStorageTypes.update(types => 
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
      .delete<ApiResponse<void>>(`${this.baseUrl}${environment.api.inventory.detailStorageTypes.endpoints.delete(id)}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._detailStorageTypes.update(types => types.filter(t => t.id !== id));
          }
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Compatibility methods
  getAll(): Observable<ApiResponse<DetailStorageType[]>> {
    return this.http.get<ApiResponse<DetailStorageType[]>>(`${this.baseUrl}${environment.api.inventory.detailStorageTypes.endpoints.list}`);
  }

  getById(id: string): Observable<ApiResponse<DetailStorageType>> {
    return this.http.get<ApiResponse<DetailStorageType>>(`${this.baseUrl}${environment.api.inventory.detailStorageTypes.endpoints.getById(id)}`);
  }
} 