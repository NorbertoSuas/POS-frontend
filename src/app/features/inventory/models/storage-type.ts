export interface StorageType {
  id?: string;
  name: string;
  maximumWeight: string;
  allowNewProduct: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StorageTypeCreateRequest {
  name: string;
  maximumWeight: string;
  allowNewProduct: boolean;
}

export interface StorageTypeUpdateRequest {
  name?: string;
  maximumWeight?: string;
  allowNewProduct?: boolean;
} 