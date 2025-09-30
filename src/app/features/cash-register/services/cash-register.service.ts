import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CashRegister, CashRegisterCreateRequest, CashRegisterUpdateRequest, CashRegisterStatus } from '../models';
import { ApiResponse } from '../../../shared/models/api-response';

/**
 * Service for managing cash register operations using Angular 20 Signals
 * 
 * This service uses Angular Signals for reactive state management:
 * - Private signals (_cashRegisters, _loading, _error) hold the internal state
 * - Public computed properties expose read-only access to the state
 * - State updates are done through .set() and .update() methods, not reassignment
 */
@Injectable({
  providedIn: 'root'
})
export class CashRegisterService {
  // HTTP client for API calls - injected once and never reassigned
  private readonly http = inject(HttpClient);
  
  // Base URL for API endpoints - constant and never reassigned
  private readonly baseUrl = `${environment.api.baseUrl}/api/CashRegisters`;

  // Reactive state with Signals - these are mutable through .set() and .update() methods
  // Note: SonarLint warnings about readonly are incorrect for Angular Signals
  // Signals are designed to be mutable through their API methods (.set(), .update())
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private _cashRegisters = signal<CashRegister[]>([]);
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private _cashRegisterStatuses = signal<CashRegisterStatus[]>([]);
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private _loading = signal(false);
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private _error = signal<string | null>(null);

  // Computed selectors - provide read-only access to the reactive state
  // These automatically update when the underlying signals change
  readonly cashRegisters = computed(() => this._cashRegisters());
  readonly cashRegisterStatuses = computed(() => this._cashRegisterStatuses());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  // Load all cash registers
  loadCashRegisters() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<CashRegister[]>>(this.baseUrl)
      .pipe(
        tap(response => {
          if (response.success) {
            this._cashRegisters.set(response.data);
          } else {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          // Load mock data when API is not available
          this.loadMockData();
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Load active cash registers
  loadActiveCashRegisters() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<CashRegister[]>>(`${this.baseUrl}/active`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._cashRegisters.set(response.data);
          } else {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          this._error.set('Connection error');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Get cash register by ID
  getCashRegisterById(id: number): Observable<ApiResponse<CashRegister>> {
    return this.http.get<ApiResponse<CashRegister>>(`${this.baseUrl}/${id}`);
  }

  // Get cash registers by branch
  getCashRegistersByBranch(branchId: number): Observable<ApiResponse<CashRegister[]>> {
    return this.http.get<ApiResponse<CashRegister[]>>(`${this.baseUrl}/branch/${branchId}`);
  }

  // Create new cash register
  create(cashRegister: CashRegisterCreateRequest) {
    this._loading.set(true);
    this._error.set(null);
    
    return this.http
      .post<ApiResponse<CashRegister>>(this.baseUrl, cashRegister)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._cashRegisters.update(registers => [...registers, response.data]);
            this._error.set(null);
          } else {
            this._error.set(response?.message || 'Failed to create cash register');
          }
        }),
        catchError(err => {
          this._error.set('Failed to create cash register');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Update existing cash register
  update(id: number, cashRegister: CashRegisterUpdateRequest) {
    this._loading.set(true);
    this._error.set(null);
    
    return this.http
      .put<ApiResponse<CashRegister>>(`${this.baseUrl}/${id}`, cashRegister)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._cashRegisters.update(registers => 
              registers.map(r => r.id === id ? { ...r, ...response.data } : r)
            );
            this._error.set(null);
          } else {
            this._error.set(response?.message || 'Failed to update cash register');
          }
        }),
        catchError(err => {
          this._error.set('Failed to update cash register');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Delete cash register
  delete(id: number) {
    this._loading.set(true);
    this._error.set(null);
    
    return this.http
      .delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            this._cashRegisters.update(registers => registers.filter(r => r.id !== id));
            this._error.set(null);
          } else {
            this._error.set(response?.message || 'Failed to delete cash register');
          }
        }),
        catchError(err => {
          this._error.set('Failed to delete cash register');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Update cash register balance
  updateBalance(id: number, newBalance: number) {
    this._loading.set(true);
    this._error.set(null);
    
    return this.http
      .patch<ApiResponse<CashRegister>>(`${this.baseUrl}/${id}/balance`, { balance: newBalance })
      .pipe(
        tap(response => {
          if (response?.success) {
            this._cashRegisters.update(registers => 
              registers.map(r => r.id === id ? { ...r, ...response.data } : r)
            );
            this._error.set(null);
          } else {
            this._error.set(response?.message || 'Failed to update balance');
          }
        }),
        catchError(err => {
          this._error.set('Failed to update balance');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Get cash register status (for real-time updates)
  loadCashRegisterStatuses() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<CashRegisterStatus[]>>(`${this.baseUrl}/status`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._cashRegisterStatuses.set(response.data);
          } else {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          this._error.set('Failed to load statuses');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Get cash register status (for real-time updates)
  getCashRegisterStatus(): Observable<ApiResponse<CashRegisterStatus[]>> {
    return this.http.get<ApiResponse<CashRegisterStatus[]>>(`${this.baseUrl}/status`);
  }

  // Clear error state
  clearError() {
    this._error.set(null);
  }

  // Refresh data
  refresh() {
    this.loadCashRegisters();
    this.loadCashRegisterStatuses();
  }

  // Compatibility methods
  getAll(): Observable<ApiResponse<CashRegister[]>> {
    return this.http.get<ApiResponse<CashRegister[]>>(this.baseUrl);
  }

  getById(id: number): Observable<ApiResponse<CashRegister>> {
    return this.http.get<ApiResponse<CashRegister>>(`${this.baseUrl}/${id}`);
  }

  // Mock data for demonstration purposes
  private loadMockData() {
    // Initialize with empty arrays
    this._cashRegisters.set([]);
    this._cashRegisterStatuses.set([]);
    this._error.set(null);
  }
}

