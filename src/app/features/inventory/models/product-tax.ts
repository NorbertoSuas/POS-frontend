export interface ProductTax {
  id?: string;
  productId: string;
  taxId: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductTaxCreateRequest {
  productId: string;
  taxId: string;
}

export interface ProductTaxUpdateRequest {
  productId?: string;
  taxId?: string;
} 