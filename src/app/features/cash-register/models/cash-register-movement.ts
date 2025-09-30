export interface CashRegisterMovement {
  id?: number;
  cashRegisterId: number;
  movementTypeId: number;
  amount: number;
  description?: string;
  reference?: string;
  movementDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CashRegisterMovementCreateRequest {
  cashRegisterId: number;
  movementTypeId: number;
  amount: number;
  description?: string;
  reference?: string;
}

export interface CashRegisterMovementUpdateRequest {
  amount?: number;
  description?: string;
  reference?: string;
}

export interface CashRegisterMovementType {
  id: number;
  name: string;
  description?: string;
  category: 'income' | 'expense' | 'transfer';
  isActive: boolean;
}

export interface CashRegisterMovementDetail extends CashRegisterMovement {
  movementTypeName: string;
  movementTypeCategory: 'income' | 'expense' | 'transfer';
  cashRegisterName: string;
  employeeName: string;
  formattedAmount: string;
  formattedDate: string;
}

