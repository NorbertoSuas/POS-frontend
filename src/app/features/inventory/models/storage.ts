export interface Storage {
  id?: string;
  name: string;
  description: string;
  warehouseId: string;
  storageTypeId: string;
  capacity: number;
  isAvailable: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StorageCreateRequest {
  name: string;
  description: string;
  warehouseId: string;
  storageTypeId: string;
  capacity: number;
  isAvailable: boolean;
}

export interface StorageUpdateRequest {
  name?: string;
  description?: string;
  warehouseId?: string;
  storageTypeId?: string;
  capacity?: number;
  isAvailable?: boolean;
} 