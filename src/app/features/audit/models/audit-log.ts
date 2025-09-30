export interface AuditLog {
  id?: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  oldValues?: string;
  newValues?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAuditLogDto {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  oldValues?: string;
  newValues?: string;
  userAgent?: string;
}

export interface UpdateAuditLogDto extends Partial<CreateAuditLogDto> {
  id: number;
}

export interface AuditLogFilters {
  userId?: number;
  action?: string;
  entityType?: string;
  entityId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface AuditLogResponse {
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}
