export interface ProductType {
  id?: string;
  name: string;
  description: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductTypeCreateRequest {
  name: string;
  description: string;
}

export interface ProductTypeUpdateRequest {
  name?: string;
  description?: string;
}
