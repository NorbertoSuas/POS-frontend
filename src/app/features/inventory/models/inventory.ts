export interface Inventory {
  id?: string;
  barCode: string;
  productId: string;
  warehouseId: string;
  minStock: number;
  maxStock: number;
  currentStock: number;
  alertHighStock: number;
  alertLowStock: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InventoryCreateRequest {
  barCode: string;
  productId: string;
  warehouseId: string;
  minStock: number;
  maxStock: number;
  currentStock: number;
  alertHighStock: number;
  alertLowStock: number;
}

export interface InventoryUpdateRequest {
  barCode?: string;
  productId?: string;
  warehouseId?: string;
  minStock?: number;
  maxStock?: number;
  currentStock?: number;
  alertHighStock?: number;
  alertLowStock?: number;
}
