export interface MovementType {
  id?: string;
  name: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MovementTypeCreateRequest {
  name: string;
}

export interface MovementTypeUpdateRequest {
  name?: string;
} 