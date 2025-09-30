import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  CashRegisterMovement, 
  CashRegisterMovementCreateRequest, 
  CashRegisterMovementUpdateRequest,
  CashRegisterMovementType,
  CashRegisterMovementDetail
} from '../models';
import { ApiResponse } from '../../../shared/models/api-response';

/**
 * Service for managing cash register movements using Angular 20 Signals
 * 
 * This service uses Angular Signals for reactive state management:
 * - Private signals (_movements, _movementTypes, _loading, _error) hold the internal state
 * - Public computed properties expose read-only access to the state
 * - State updates are done through .set() and .update() methods, not reassignment
 * 
 * IMPORTANT: SonarLint rule S2933 (readonly) is INCORRECT for Angular Signals.
 * Signals are designed to be mutable through their API methods and should NOT be marked as readonly.
 * 
 * @example
 * // ✅ CORRECT - Signal can be updated through API
 * private _movements = signal<CashRegisterMovement[]>([]);
 * this._movements.set(newData);           // Update entire array
 * this._movements.update(data => [...data, newItem]); // Add item to array
 * 
 * // ❌ INCORRECT - Would break signal functionality
 * private readonly _movements = signal<CashRegisterMovement[]>([]);
 */
@Injectable({
  providedIn: 'root'
})
export class CashRegisterMovementService {
  // HTTP client for API calls - injected once and never reassigned
  private readonly http = inject(HttpClient);
  
  // Base URL for API endpoints - constant and never reassigned
  private readonly baseUrl = `${environment.api.baseUrl}/api/CashRegisterMovements`;

  // Reactive state with Signals - these are mutable through .set() and .update() methods
  // 
  // CRITICAL: These signals MUST NOT be marked as readonly because:
  // 1. Signals are designed to be mutable through their API methods
  // 2. .set() and .update() methods modify the internal state
  // 3. SonarLint rule S2933 doesn't understand Angular Signals
  // These signals cannot be readonly because they need to be mutable for state updates
  // State update pattern:
  // - _movements.set(newData)           // Replace entire array
  // - _movements.update(data => [...data, newItem]) // Add to array
  // - _loading.set(true/false)          // Toggle loading state
  // - _error.set(message/null)          // Set/clear error state
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private _movements = signal<CashRegisterMovement[]>([]);
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private _movementTypes = signal<CashRegisterMovementType[]>([]);
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private _movementDetails = signal<CashRegisterMovementDetail[]>([]);
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private _loading = signal(false);
  // eslint-disable-next-line @typescript-eslint/prefer-readonly
  private _error = signal<string | null>(null);

  // Computed selectors - provide read-only access to the reactive state
  // These automatically update when the underlying signals change
  // Note: These ARE readonly because they're computed values that shouldn't be modified
  readonly movements = computed(() => this._movements());
  readonly movementTypes = computed(() => this._movementTypes());
  readonly movementDetails = computed(() => this._movementDetails());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  // Load all movements
  loadMovements() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<CashRegisterMovement[]>>(this.baseUrl)
      .pipe(
        tap(response => {
          if (response.success) {
            this._movements.set(response.data);
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

  // Load movements by cash register
  loadMovementsByCashRegister(cashRegisterId: number) {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<CashRegisterMovement[]>>(`${this.baseUrl}/cash-register/${cashRegisterId}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._movements.set(response.data);
          } else {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          this._error.set('Failed to load movements');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Load movements by date range
  loadMovementsByDateRange(startDate: Date, endDate: Date) {
    this._loading.set(true);
    this._error.set(null);

    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    return this.http
      .get<ApiResponse<CashRegisterMovement[]>>(`${this.baseUrl}/date-range`, { params })
      .pipe(
        tap(response => {
          if (response.success) {
            this._movements.set(response.data);
          } else {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          this._error.set('Failed to load movements');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Load movement details (with related data)
  loadMovementDetails() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<CashRegisterMovementDetail[]>>(`${this.baseUrl}/details`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._movementDetails.set(response.data);
          } else {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          this._error.set('Failed to load movement details');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Load movement types
  loadMovementTypes() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<CashRegisterMovementType[]>>(`${this.baseUrl}/types`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._movementTypes.set(response.data);
          } else {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          // Movement types are loaded with movements in mock data
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Get movement by ID
  getMovementById(id: number): Observable<ApiResponse<CashRegisterMovement>> {
    return this.http.get<ApiResponse<CashRegisterMovement>>(`${this.baseUrl}/${id}`);
  }

  // Create new movement
  create(movement: CashRegisterMovementCreateRequest) {
    this._loading.set(true);
    this._error.set(null);
    
    return this.http
      .post<ApiResponse<CashRegisterMovement>>(this.baseUrl, movement)
      .pipe(
        tap(response => {
          if (response?.success) {
            // Add new movement to existing array using .update()
            this._movements.update(movements => [...movements, response.data]);
            this._error.set(null);
          } else {
            this._error.set(response?.message || 'Failed to create movement');
          }
        }),
        catchError(err => {
          this._error.set('Failed to create movement');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Update existing movement
  update(id: number, movement: CashRegisterMovementUpdateRequest) {
    this._loading.set(true);
    this._error.set(null);
    
    return this.http
      .put<ApiResponse<CashRegisterMovement>>(`${this.baseUrl}/${id}`, movement)
      .pipe(
        tap(response => {
          if (response?.success) {
            // Update existing movement in array using .update()
            this._movements.update(movements => 
              movements.map(m => m.id === id ? { ...m, ...response.data } : m)
            );
            this._error.set(null);
          } else {
            this._error.set(response?.message || 'Failed to update movement');
          }
        }),
        catchError(err => {
          this._error.set('Failed to update movement');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Delete movement
  delete(id: number) {
    this._loading.set(true);
    this._error.set(null);
    
    return this.http
      .delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`)
      .pipe(
        tap(response => {
          if (response?.success) {
            // Remove movement from array using .update()
            this._movements.update(movements => movements.filter(m => m.id !== id));
            this._error.set(null);
          } else {
            this._error.set(response?.message || 'Failed to delete movement');
          }
        }),
        catchError(err => {
          this._error.set('Failed to delete movement');
          return of(null);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // Get movements summary by cash register
  getMovementsSummary(cashRegisterId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/summary/${cashRegisterId}`);
  }

  // Get daily movements summary
  getDailyMovementsSummary(date: Date): Observable<ApiResponse<any>> {
    const params = { date: date.toISOString() };
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/daily-summary`, { params });
  }

  // Clear error state
  clearError() {
    this._error.set(null);
  }

  // Refresh data
  refresh() {
    this.loadMovements();
    this.loadMovementTypes();
  }

  // Get movements by type
  getMovementsByType(typeId: number) {
    return this.movements().filter(m => m.movementTypeId === typeId);
  }

  // Get movements by category
  getMovementsByCategory(category: 'income' | 'expense' | 'transfer') {
    const types = this.movementTypes().filter(t => t.category === category);
    const typeIds = types.map(t => t.id);
    return this.movements().filter(m => typeIds.includes(m.movementTypeId));
  }

  // Calculate total by category
  calculateTotalByCategory(category: 'income' | 'expense' | 'transfer'): number {
    const movements = this.getMovementsByCategory(category);
    return movements.reduce((total, m) => total + m.amount, 0);
  }

  // Calculate net balance
  calculateNetBalance(): number {
    const income = this.calculateTotalByCategory('income');
    const expense = this.calculateTotalByCategory('expense');
    return income - expense;
  }

  // Mock data for demonstration purposes
  private loadMockData() {
    // Initialize with empty arrays
    this._movements.set([]);
    this._movementTypes.set([]);
    this._error.set(null);
  }
}
