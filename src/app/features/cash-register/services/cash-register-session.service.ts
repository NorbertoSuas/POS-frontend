import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, finalize, map, filter } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CashRegisterSession, CashRegisterSessionCreateRequest, CashRegisterSessionCloseRequest, CashRegisterSessionStatus } from '../models';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class CashRegisterSessionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/api/CashRegisterSessions`;

  // Reactive state with Signals
  private readonly _sessions = signal<CashRegisterSession[]>([]);
  private readonly _sessionStatuses = signal<CashRegisterSessionStatus[]>([]);
  private readonly _activeSessions = signal<CashRegisterSession[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Computed selectors
  sessions = computed(() => this._sessions());
  sessionStatuses = computed(() => this._sessionStatuses());
  activeSessions = computed(() => this._activeSessions());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Load all sessions
  loadSessions() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<CashRegisterSession[]>>(this.baseUrl)
      .pipe(
        tap(response => {
          if (response.success) {
            this._sessions.set(response.data);
            this._activeSessions.set(response.data.filter(s => s.status === 'Open'));
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

  // Load active sessions
  loadActiveSessions() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<CashRegisterSession[]>>(`${this.baseUrl}/active`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._activeSessions.set(response.data);
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

  // Load session statuses
  loadSessionStatuses() {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<ApiResponse<CashRegisterSessionStatus[]>>(`${this.baseUrl}/status`)
      .pipe(
        tap(response => {
          if (response.success) {
            this._sessionStatuses.set(response.data);
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

  // Open a new session
  openSession(sessionData: CashRegisterSessionCreateRequest): Observable<CashRegisterSession | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<ApiResponse<CashRegisterSession>>(`${this.baseUrl}/open`, sessionData)
      .pipe(
        tap(response => {
          if (response.success) {
            const newSession = response.data;
            this._sessions.update(sessions => [newSession, ...sessions]);
            this._activeSessions.update(active => [newSession, ...active]);
          } else {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          this._error.set('Failed to open session');
          return of(null);
        }),
        finalize(() => this._loading.set(false)),
        filter((response): response is ApiResponse<CashRegisterSession> => response !== null),
        map(response => response.success ? response.data : null)
      );
  }

  // Close a session
  closeSession(sessionId: number, closeData: CashRegisterSessionCloseRequest): Observable<CashRegisterSession | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .put<ApiResponse<CashRegisterSession>>(`${this.baseUrl}/${sessionId}/close`, closeData)
      .pipe(
        tap(response => {
          if (response.success) {
            const updatedSession = response.data;
            this._sessions.update(sessions => 
              sessions.map(s => s.id === sessionId ? updatedSession : s)
            );
            this._activeSessions.update(active => 
              active.filter(s => s.id !== sessionId)
            );
          } else {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          this._error.set('Failed to close session');
          return of(null);
        }),
        finalize(() => this._loading.set(false)),
        filter((response): response is ApiResponse<CashRegisterSession> => response !== null),
        map(response => response.success ? response.data : null)
      );
  }

  // Get session by ID
  getSessionById(sessionId: number): Observable<CashRegisterSession | null> {
    return this.http
      .get<ApiResponse<CashRegisterSession>>(`${this.baseUrl}/${sessionId}`)
      .pipe(
        tap(response => {
          if (!response.success) {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          this._error.set('Failed to load session');
          return of(null);
        }),
        filter((response): response is ApiResponse<CashRegisterSession> => response !== null),
        map(response => response.success ? response.data : null)
      );
  }

  // Get sessions by cash register ID
  getSessionsByCashRegister(cashRegisterId: number): Observable<CashRegisterSession[]> {
    return this.http
      .get<ApiResponse<CashRegisterSession[]>>(`${this.baseUrl}/cash-register/${cashRegisterId}`)
      .pipe(
        tap(response => {
          if (!response.success) {
            this._error.set(response.message);
          }
        }),
        catchError(err => {
          this._error.set('Failed to load sessions');
          return of(null);
        }),
        filter((response): response is ApiResponse<CashRegisterSession[]> => response !== null),
        map(response => response.success ? response.data : [])
      );
  }

  // Check if cash register has active session
  hasActiveSession(cashRegisterId: number): boolean {
    return this._activeSessions().some(session => session.cashRegisterId === cashRegisterId);
  }

  // Get active session for cash register
  getActiveSession(cashRegisterId: number): CashRegisterSession | undefined {
    return this._activeSessions().find(session => session.cashRegisterId === cashRegisterId);
  }

  // Clear error
  clearError() {
    this._error.set(null);
  }

  // Refresh data
  refresh() {
    this.loadSessions();
    this.loadSessionStatuses();
  }

  // Mock data for demonstration purposes
  private loadMockData() {
    // Initialize with empty arrays
    this._sessions.set([]);
    this._sessionStatuses.set([]);
    this._activeSessions.set([]);
    this._error.set(null);
  }
}
