export interface Product {
  id?: string;
  name: string;
  description?: string;
  imageUri?: string;
  price: number;
  tax: number;
  supplierId: string;
  productTypeId: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductCreateRequest {
  name: string;
  description?: string;
  imageUri?: string;
  price: number;
  tax: number;
  supplierId: string;
  productTypeId: string;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  imageUri?: string;
  price?: number;
  tax?: number;
  supplierId?: string;
  productTypeId?: string;
}
