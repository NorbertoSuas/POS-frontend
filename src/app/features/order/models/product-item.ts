import { ProductExtra } from "./product-extra";

export interface ProductItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productTypeId: string;
  tax: number;
  price: number;
  availableExtras?: ProductExtra[]; // Extras disponibles para este producto
}
export interface SelectedProductItem extends ProductItem {
  cartItemId?: string;   // unique id for each item in the cart
  extrasKey?: string;    // composite key of extra ids (sorted)
  quantity: number;
  selectedExtras?: ProductExtra[]; // Extras selected by the user
  totalPrice: number; // Total price considering quantity and extras

}
