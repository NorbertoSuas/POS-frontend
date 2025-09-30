import { ProductItem} from './product-item';

export interface OrderCreate {
  id?: string;
  listSelectedProductItems: ProductItem[];
  orderTypeId: string; // UUID
  tableId: string; // UUID MESA
  employeeId: string; // UUID (Replaces waiter_id)
  customerId?: string; // UUID (optional)
  total: number; // decimal as string
  text?: string; // Additional text or notes
  orderStatusId: string; // UUID
}
