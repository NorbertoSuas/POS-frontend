export interface Supplier {
  id?: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupplierCreateRequest {
  name: string;
  contact: string;
  email: string;
  address: string;
}

export interface SupplierUpdateRequest {
  name?: string;
  contact?: string;
  email?: string;
  address?: string;
} 