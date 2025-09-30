export interface Tax {
  id?: string;
  name: string;
  rate: number;
  created_at?: string;
  updated_at?: string;
}

export interface TaxCreateRequest {
  name: string;
  rate: number;
}

export interface TaxUpdateRequest {
  name?: string;
  rate?: number;
} 