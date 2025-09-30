import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuditLog, CreateAuditLogDto, UpdateAuditLogDto, AuditLogFilters, AuditLogResponse, AuditAction, EntityType } from '../types/audit.types';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private readonly http = inject(HttpClient);
  
  // State signals
  private readonly auditLogs = signal<AuditLog[]>([]);
  private readonly loading = signal(false);
  private readonly total = signal(0);
  private readonly currentPage = signal(1);
  private readonly pageSize = signal(20);
  private readonly currentFilters = signal<AuditLogFilters>({});

  // Computed signals for derived state
  readonly hasAuditLogs = computed(() => this.auditLogs().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.auditLogs().length === 0);
  readonly canExport = computed(() => !this.loading() && this.total() > 0);
  readonly paginationInfo = computed(() => ({
    currentPage: this.currentPage(),
    totalPages: Math.ceil(this.total() / this.pageSize()),
    hasNextPage: this.currentPage() < Math.ceil(this.total() / this.pageSize()),
    hasPrevPage: this.currentPage() > 1
  }));

  // Readonly signals for external access
  readonly getAuditLogs = this.auditLogs.asReadonly();
  readonly getLoading = this.loading.asReadonly();
  readonly getTotal = this.total.asReadonly();
  readonly getCurrentPage = this.currentPage.asReadonly();
  readonly getPageSize = this.pageSize.asReadonly();
  readonly getCurrentFilters = this.currentFilters.asReadonly();

  private readonly baseUrl = `${environment.api.baseUrl}${environment.api.audit.prefix}`;

  constructor() {
    // Effect to automatically refresh data when filters change
    effect(() => {
      const filters = this.currentFilters();
      // Only refresh if filters are actually set and not empty
      if (filters && Object.keys(filters).length > 0 && 
          (filters.userId || filters.action || filters.entityType || filters.entityId || filters.startDate || filters.endDate)) {
        this.refreshAuditLogs();
      }
    });
  }

  // Main CRUD methods
  getAllAuditLogs(filters?: AuditLogFilters, page: number = 1, pageSize: number = 20): Observable<AuditLogResponse> {
    console.log('🚀 getAllAuditLogs called with:', { filters, page, pageSize });
    this.loading.set(true);
    this.currentFilters.set(filters || {});
    
    // In development, if there's no backend, we use mock data
    if (environment.production === false) {
      console.log('🔧 Using mock data for development');
      return this.getMockAuditLogs(filters, page, pageSize);
    }
    
    console.log('🌐 Using backend data');
    return this.getBackendAuditLogs(filters, page, pageSize);
  }

  private getMockAuditLogs(filters: AuditLogFilters | undefined, page: number, pageSize: number): Observable<AuditLogResponse> {
    let mockLogs = this.generateMockAuditLogs(100);
    
    // Apply filters if they exist
    if (filters) {
      mockLogs = this.applyFiltersToMockData(mockLogs, filters);
    }
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLogs = mockLogs.slice(startIndex, endIndex);
    
    const response: AuditLogResponse = {
      data: paginatedLogs,
      total: mockLogs.length,
      page: page,
      pageSize: pageSize
    };
    
    this.updateState(response, page, pageSize);
    console.log('🔧 Using mock data for development with filters:', filters, 'Total logs:', mockLogs.length, 'Paginated:', paginatedLogs.length);
    return of(response);
  }

  private getBackendAuditLogs(filters: AuditLogFilters | undefined, page: number, pageSize: number): Observable<AuditLogResponse> {
    const params = this.buildHttpParams(filters, page, pageSize);

    return this.http.get<AuditLog[]>(this.baseUrl, { params }).pipe(
      map(logs => {
        const response: AuditLogResponse = {
          data: logs,
          total: logs.length,
          page: page,
          pageSize: pageSize
        };
        
        this.updateState(response, page, pageSize);
        return response;
      }),
      catchError(error => {
        console.error('Error fetching audit logs:', error);
        this.loading.set(false);
        return of({ data: [], total: 0, page: 1, pageSize: 20 });
      })
    );
  }

  private buildHttpParams(filters: AuditLogFilters | undefined, page: number, pageSize: number): HttpParams {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters) {
      if (filters.userId) params = params.set('userId', filters.userId.toString());
      if (filters.action) params = params.set('action', filters.action);
      if (filters.entityType) params = params.set('entityType', filters.entityType);
      if (filters.entityId) params = params.set('entityId', filters.entityId.toString());
      if (filters.startDate) params = params.set('startDate', filters.startDate.toISOString());
      if (filters.endDate) params = params.set('endDate', filters.endDate.toISOString());
    }

    return params;
  }

  getAuditLogById(id: number): Observable<AuditLog | null> {
    return this.http.get<AuditLog>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching audit log ${id}:`, error);
        return of(null);
      })
    );
  }

  createAuditLog(auditLog: CreateAuditLogDto): Observable<AuditLog | null> {
    // In development, if there's no backend, we create a mock log
    if (environment.production === false) {
      const mockLog: AuditLog = {
        id: Date.now(), // Use timestamp as ID for mock
        userId: auditLog.userId,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        oldValues: auditLog.oldValues,
        newValues: auditLog.newValues,
        userAgent: auditLog.userAgent || navigator.userAgent,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.auditLogs.update(logs => [mockLog, ...logs]);
      this.total.update(total => total + 1);
      console.log('🔧 Created mock audit log:', mockLog);
      return of(mockLog);
    }
    
    return this.http.post<AuditLog>(this.baseUrl, auditLog).pipe(
      tap(newLog => {
        if (newLog) {
          this.auditLogs.update(logs => [newLog, ...logs]);
          this.total.update(total => total + 1);
        }
      }),
      catchError(error => {
        console.error('Error creating audit log:', error);
        return of(null);
      })
    );
  }

  updateAuditLog(id: number, auditLog: UpdateAuditLogDto): Observable<AuditLog | null> {
    // In development, if there's no backend, we update the mock log
    if (environment.production === false) {
      const updatedLog: AuditLog = {
        id: id,
        userId: auditLog.userId!,
        action: auditLog.action!,
        entityType: auditLog.entityType!,
        entityId: auditLog.entityId!,
        oldValues: auditLog.oldValues,
        newValues: auditLog.newValues,
        userAgent: auditLog.userAgent || navigator.userAgent,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.auditLogs.update(logs => 
        logs.map(log => log.id === id ? updatedLog : log)
      );
      console.log('🔧 Updated mock audit log:', updatedLog);
      return of(updatedLog);
    }
    
    return this.http.put<AuditLog>(`${this.baseUrl}/${id}`, auditLog).pipe(
      tap(updatedLog => {
        if (updatedLog) {
          this.auditLogs.update(logs => 
            logs.map(log => log.id === id ? updatedLog : log)
          );
        }
      }),
      catchError(error => {
        console.error(`Error updating audit log ${id}:`, error);
        return of(null);
      })
    );
  }

  deleteAuditLog(id: number): Observable<boolean> {
    // In development, if there's no backend, we delete the mock log
    if (environment.production === false) {
      this.auditLogs.update(logs => logs.filter(log => log.id !== id));
      this.total.update(total => total - 1);
      console.log('🔧 Deleted mock audit log with ID:', id);
      return of(true);
    }
    
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.auditLogs.update(logs => logs.filter(log => log.id !== id));
        this.total.update(total => total - 1);
      }),
      map(() => true),
      catchError(error => {
        console.error(`Error deleting audit log ${id}:`, error);
        return of(false);
      })
    );
  }

  // Filtering and search methods
  searchAuditLogs(query: string): Observable<AuditLog[]> {
    if (!query.trim()) {
      return this.getAllAuditLogs().pipe(map(response => response.data));
    }

    const params = new HttpParams().set('search', query);
    return this.http.get<AuditLog[]>(`${this.baseUrl}/search`, { params }).pipe(
      catchError(error => {
        console.error('Error searching audit logs:', error);
        return of([]);
      })
    );
  }

  getAuditLogsByUser(userId: number): Observable<AuditLog[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<AuditLog[]>(`${this.baseUrl}/user`, { params }).pipe(
      catchError(error => {
        console.error(`Error fetching audit logs for user ${userId}:`, error);
        return of([]);
      })
    );
  }

  getAuditLogsByEntity(entityType: string, entityId?: number): Observable<AuditLog[]> {
    let params = new HttpParams().set('entityType', entityType);
    if (entityId) {
      params = params.set('entityId', entityId.toString());
    }
    
    return this.http.get<AuditLog[]>(`${this.baseUrl}/entity`, { params }).pipe(
      catchError(error => {
        console.error(`Error fetching audit logs for entity ${entityType}:`, error);
        return of([]);
      })
    );
  }

  getAuditLogsByDateRange(startDate: Date, endDate: Date): Observable<AuditLog[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    
    return this.http.get<AuditLog[]>(`${this.baseUrl}/daterange`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching audit logs by date range:', error);
        return of([]);
      })
    );
  }

  // Export methods
  exportAuditLogs(filters?: AuditLogFilters, format: 'csv' | 'excel' = 'csv'): Observable<Blob | null> {
    // In development, if there's no backend, we create a mock export
    if (environment.production === false) {
      const mockData = this.generateMockExportData(filters, format);
      const blob = new Blob([mockData], { type: this.getMimeType(format) });
      console.log('🔧 Created mock export with format:', format);
      return of(blob);
    }
    
    let params = new HttpParams().set('format', format);
    
    if (filters) {
      if (filters.userId) params = params.set('userId', filters.userId.toString());
      if (filters.action) params = params.set('action', filters.action);
      if (filters.entityType) params = params.set('entityType', filters.entityType);
      if (filters.entityId) params = params.set('entityId', filters.entityId.toString());
      if (filters.startDate) params = params.set('startDate', filters.startDate.toISOString());
      if (filters.endDate) params = params.set('endDate', filters.endDate.toISOString());
    }

    return this.http.get(`${this.baseUrl}/export`, { 
      params, 
      responseType: 'blob' 
    }).pipe(
      catchError(error => {
        console.error('Error exporting audit logs:', error);
        return of(null);
      })
    );
  }

  // Utility methods
  refreshAuditLogs(): void {
    this.getAllAuditLogs(this.currentFilters(), this.currentPage(), this.pageSize()).subscribe();
  }

  setPageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.refreshAuditLogs();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.refreshAuditLogs();
  }

  resetToFirstPage(): void {
    this.currentPage.set(1);
  }

  updateFilters(filters: AuditLogFilters): void {
    this.currentFilters.set(filters);
    this.resetToFirstPage();
  }

  // Method to create logs automatically (for internal use)
  logAction(action: AuditAction, entityType: EntityType, entityId: number, oldValues?: string, newValues?: string): void {
    const auditLog: CreateAuditLogDto = {
      userId: this.getCurrentUserId(),
      action,
      entityType,
      entityId,
      oldValues: oldValues || undefined,
      newValues: newValues || undefined,
      userAgent: navigator.userAgent
    };

    this.createAuditLog(auditLog).subscribe();
  }

  // Private helper methods
  private updateState(response: AuditLogResponse, page: number, pageSize: number): void {
    console.log('🔄 Updating state with:', { 
      dataLength: response.data.length, 
      total: response.total, 
      page, 
      pageSize 
    });
    
    this.auditLogs.set(response.data);
    this.total.set(response.total);
    this.currentPage.set(page);
    this.pageSize.set(pageSize);
    this.loading.set(false);
    
    console.log('✅ State updated. Current auditLogs length:', this.auditLogs().length);
  }

  private getCurrentUserId(): number {
    // Get current user ID from localStorage or use default
    // In a real application, this would come from an AuthService
    const storedUserId = localStorage.getItem('current-user-id');
    
    if (storedUserId) {
      const userId = parseInt(storedUserId, 10);
      if (!isNaN(userId) && userId > 0) {
        return userId;
      }
    }
    
    // Fallback to default user ID for development
    // This ensures audit logs can still be created during development
    const defaultUserId = 1;
    console.log('🔧 Using default user ID for audit logging:', defaultUserId);
    return defaultUserId;
  }

  private generateMockAuditLogs(pageSize: number): AuditLog[] {
    const mockLogs: AuditLog[] = [];
    const actions: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];
    const entityTypes: EntityType[] = ['User', 'Product', 'Order', 'Inventory', 'Customer'];
    
    for (let i = 0; i < pageSize; i++) {
      const now = new Date();
      mockLogs.push({
        id: i + 1,
        userId: Math.floor(Math.random() * 10) + 1,
        action: actions[Math.floor(Math.random() * actions.length)],
        entityType: entityTypes[Math.floor(Math.random() * entityTypes.length)],
        entityId: Math.floor(Math.random() * 100) + 1,
        oldValues: undefined,
        newValues: undefined,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now
      });
    }
    return mockLogs;
  }

  private applyFiltersToMockData(logs: AuditLog[], filters: AuditLogFilters): AuditLog[] {
    return logs.filter(log => {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.entityType && log.entityType !== filters.entityType) return false;
      if (filters.entityId && log.entityId !== filters.entityId) return false;
      if (filters.startDate && log.timestamp < filters.startDate) return false;
      if (filters.endDate && log.timestamp > filters.endDate) return false;
      return true;
    });
  }

  private generateMockExportData(filters: AuditLogFilters | undefined, format: 'csv' | 'excel'): string {
    let logs = this.generateMockAuditLogs(100);
    
    if (filters) {
      logs = this.applyFiltersToMockData(logs, filters);
    }
    
    if (format === 'csv') {
      const headers = ['ID', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'Timestamp', 'Old Values', 'New Values'];
      const rows = logs.map(log => [
        log.id,
        log.userId,
        log.action,
        log.entityType,
        log.entityId,
        log.timestamp.toISOString(),
        log.oldValues || '',
        log.newValues || ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      // Excel-like format (simple tab-separated)
      const headers = ['ID', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'Timestamp', 'Old Values', 'New Values'];
      const rows = logs.map(log => [
        log.id,
        log.userId,
        log.action,
        log.entityType,
        log.entityId,
        log.timestamp.toISOString(),
        log.oldValues || '',
        log.newValues || ''
      ]);
      
      return [headers, ...rows].map(row => row.join('\t')).join('\n');
    }
  }

  private getMimeType(format: 'csv' | 'excel'): string {
    return format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel';
  }
}
