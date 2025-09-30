export interface Order {
  id: string; // UUID
  table_id: string; // UUID
  employee_id: string; // UUID (Replaces waiter_id)
  customer_id?: string; // UUID (opcional)
  order_date: string; // datetime en formato string
  total: string; // decimal como string
  order_type_id: string; // UUID
  order_status: string; // pending, in preparation, served, cancelled
  is_deleted: string; // boolean como string ("true"/"false")
}