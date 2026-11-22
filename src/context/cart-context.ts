import { createContext } from "react";
import type { Product } from "../types/product";

export interface StoredCartItem {
  productId: string;
  quantity: number;
}

export interface CartItem extends StoredCartItem {
  product: Product | null;
}

export type AddItemResult = "added" | "limit" | "unavailable";

interface CartContextValue {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  addItem: (product: Product) => AddItemResult;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);