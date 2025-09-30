import { Employee } from "../../user/models/employee";
import { OrderDto } from "./order-dto";

export interface OrderSaleDto{
    id?: string; // UUID
    order: OrderDto; // UUID
    receiptType: string; // UUID MESA
    paymentMethod: string; // UUID
    employee: Employee; // UUID (Replaces waiter_id)
    totalAmount: number; // decimal as string
    pos: string; // UUID (Point of Sale)
    saleCondition: string; // UUID
    customer?: string; // UUID (optional)
    text?: string; // Additional text or notes
    discount: number; // decimal as string
    creditTerm: number; // integer (days)
    saleChannel: string; // UUID
    tax: number; // decimal as string
}