// Core audit log types
export interface AuditLog {
  id?: number;
  userId: number;
  action: AuditAction;
  entityType: EntityType;
  entityId: number;
  oldValues?: string;
  newValues?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Strict action types
export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'EXPORT' 
  | 'IMPORT' 
  | 'APPROVE' 
  | 'REJECT';

// Strict entity type types
export type EntityType = 
  | 'User' 
  | 'Product' 
  | 'Inventory' 
  | 'Order' 
  | 'Customer' 
  | 'Supplier' 
  | 'Warehouse' 
  | 'Tax' 
  | 'Price'
  | 'CashRegister' 
  | 'Employee' 
  | 'Role' 
  | 'Permission' 
  | 'Branch' 
  | 'Shift' 
  | 'Menu' 
  | 'Table' 
  | 'Reservation';

// DTOs for API operations
export interface CreateAuditLogDto {
  userId: number;
  action: AuditAction;
  entityType: EntityType;
  entityId: number;
  oldValues?: string;
  newValues?: string;
  userAgent?: string;
}

export interface UpdateAuditLogDto extends Partial<CreateAuditLogDto> {
  id: number;
}

// Filter types
export interface AuditLogFilters {
  userId?: number;
  action?: AuditAction;
  entityType?: EntityType;
  entityId?: number;
  startDate?: Date;
  endDate?: Date;
}

// API response types
export interface AuditLogResponse {
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

// Pagination types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Export format types
export type ExportFormat = 'csv' | 'excel';

// Component input/output types
export interface AuditLogTableInputs {
  auditLogs: AuditLog[];
  loading: boolean;
}

export interface AuditLogTableOutputs {
  editAuditLog: AuditLog;
  deleteAuditLog: number;
}

export interface AuditLogFiltersInputs {
  currentFilters: AuditLogFilters;
}

export interface AuditLogFiltersOutputs {
  filtersChange: AuditLogFilters;
}

// Modal types
export interface CreateModalInputs {
  isOpen: boolean;
}

export interface CreateModalOutputs {
  createAuditLog: CreateAuditLogDto;
  close: void;
}

export interface EditModalInputs {
  isOpen: boolean;
  auditLog: AuditLog;
}

export interface EditModalOutputs {
  updateAuditLog: UpdateAuditLogDto;
  close: void;
}
