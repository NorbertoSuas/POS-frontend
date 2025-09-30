export interface CashRegisterSession {
  id?: number;
  cashRegisterId: number;
  employeeId: number;
  openDate: Date;
  closeDate?: Date;
  openingBalance: number;
  closingBalance?: number;
  status: 'Open' | 'Closed' | 'Suspended';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CashRegisterSessionCreateRequest {
  cashRegisterId: number;
  employeeId: number;
  openingBalance: number;
  notes?: string;
}

export interface CashRegisterSessionCloseRequest {
  closingBalance: number;
  notes?: string;
}

export interface CashRegisterSessionStatus {
  id: number;
  cashRegisterId: number;
  cashRegisterName: string;
  employeeId: number;
  employeeName: string;
  openDate: Date;
  openingBalance: number;
  currentBalance: number;
  status: 'Open' | 'Closed' | 'Suspended';
  duration?: string; // Calculated field for open sessions
  totalMovements: number;
  totalSales: number;
  totalExpenses: number;
}

