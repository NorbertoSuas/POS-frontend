export interface ProductPrice {
  id?: string;
  productId: string;
  priceId: string;
  validFrom: Date;
  validTo?: Date;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductPriceCreateRequest {
  productId: string;
  priceId: string;
  validFrom: Date;
  validTo?: Date;
}

export interface ProductPriceUpdateRequest {
  productId?: string;
  priceId?: string;
  validFrom?: Date;
  validTo?: Date;
}

export interface AssignPriceRequest {
  productId: string;
  priceId: string;
  assignedPrice: number;
} 