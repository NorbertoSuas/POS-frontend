import { Employee } from '../../user/models/employee';
import { OrderStatus } from './order-status';
import { OrderType } from './order-type';
import { SelectedProductItem} from './product-item';
import { Table } from './table';

export interface OrderDto {
  id?: string;
  listSelectedProductItems: SelectedProductItem[];
  orderType: OrderType; 
  table?: Table
  employee: Employee
  customer?: Employee
  total: number; // decimal as string
  tax: number; // decimal 
  text?: string; // Additional text or notes
  orderStatus: OrderStatus;
}
export function createEmptyOrder(): OrderDto {
  return {
    id: '',
    listSelectedProductItems: [],
    orderType: { id: '', name: '', description: '' },
    table: { id: '', number: '', capacity: 0 },
    employee: {
      id: '',
      firstName: null,
      lastName: null,
      phone: null,
      photo: null,
      email: null,
      startDate: null,
      endDate: null,
      birthDate: null,
      status: null,
    },
    total: 0,
    orderStatus: { id: '', name: '' },
    tax: 0
  };
}
