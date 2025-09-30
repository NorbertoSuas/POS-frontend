export interface Customer {
    id: string; // UUID
    name: string; // Customer's name
    email?: string; // Customer's email (optional)
    phone?: string; // Customer's phone number (optional)
}