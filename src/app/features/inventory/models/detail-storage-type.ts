export interface DetailStorageType {
  id?: string;
  warehouseCategoryId: string;
  productId: string;
  quantity: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DetailStorageTypeCreateRequest {
  warehouseCategoryId: string;
  productId: string;
  quantity: number;
}

export interface DetailStorageTypeUpdateRequest {
  warehouseCategoryId?: string;
  productId?: string;
  quantity?: number;
} 