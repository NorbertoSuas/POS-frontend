export interface Warehouse {
  id?: string;
  name: string;
  shortname: string;
  parentWarehouseId?: string;
  branchId: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WarehouseCreateRequest {
  name: string;
  shortname: string;
  parentWarehouseId?: string;
  branchId: string;
}

export interface WarehouseUpdateRequest {
  name?: string;
  shortname?: string;
  parentWarehouseId?: string;
  branchId?: string;
} 