export interface InventoryMovement {
  id?: string;
  inventoryId: string;
  movementDate: Date;
  movementTypeId: string;
  quantity: number;
  description: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InventoryMovementCreateRequest {
  inventoryId: string;
  movementDate: Date;
  movementTypeId: string;
  quantity: number;
  description: string;
}

export interface InventoryMovementUpdateRequest {
  inventoryId?: string;
  movementDate?: Date;
  movementTypeId?: string;
  quantity?: number;
  description?: string;
} 