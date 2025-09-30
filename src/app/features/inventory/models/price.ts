export interface Price {
  id?: string;
  name: string;
  costPrice: number;
  markupPct: number;
  taxPct: number;
  finalPrice: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PriceCreateRequest {
  name: string;
  costPrice: number;
  markupPct: number;
  taxPct: number;
  finalPrice: number;
}

export interface PriceUpdateRequest {
  name?: string;
  costPrice?: number;
  markupPct?: number;
  taxPct?: number;
  finalPrice?: number;
} 