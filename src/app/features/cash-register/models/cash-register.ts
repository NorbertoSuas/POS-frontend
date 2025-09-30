export interface CashRegister {
  id?: number;
  name: string;
  description?: string;
  branchId: number;
  initialBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CashRegisterCreateRequest {
  name: string;
  description?: string;
  branchId: number;
  initialBalance: number;
}

export interface CashRegisterUpdateRequest {
  name?: string;
  description?: string;
  branchId?: number;
  isActive?: boolean;
}

export interface CashRegisterStatus {
  id: number;
  name: string;
  status: 'available' | 'in_use' | 'suspended' | 'maintenance';
  currentBalance: number;
  lastActivity?: Date;
  employeeName?: string;
  sessionId?: number;
}

