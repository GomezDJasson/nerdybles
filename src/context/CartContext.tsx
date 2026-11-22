import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useCatalog } from "./useCatalog";
import type { Product } from "../types/product";
import { CartContext } from "./cart-context";

import type {
  StoredCartItem,
  CartItem,
  AddItemResult,
} from "./cart-context";

const STORAGE_KEY = "nerdybles-cart-v1";

function readStoredCart(): StoredCartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is StoredCartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof item.productId === "string" &&
        typeof item.quantity === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { catalog } = useCatalog();
  const [storedItems, setStoredItems] = useState<StoredCartItem[]>(readStoredCart);

  const items = useMemo<CartItem[]>(
    () =>
      storedItems.map((item) => ({
        ...item,
        product:
          catalog?.products.find((product) => product.id === item.productId) ?? null,
      })),
    [catalog, storedItems]
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedItems));
    } catch {
      // El carrito seguirá funcionando durante la sesión aunque el navegador
      // no permita guardar datos localmente.
    }
  }, [storedItems]);

  const addItem = (product: Product): AddItemResult => {
    if (product.availability !== "Disponible" || product.stock <= 0) {
      return "unavailable";
    }

    const existing = storedItems.find((item) => item.productId === product.id);
    if (existing && existing.quantity >= product.stock) {
      return "limit";
    }

    setStoredItems((current) => {
      const currentItem = current.find((item) => item.productId === product.id);

      if (currentItem) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }

      return [...current, { productId: product.id, quantity: 1 }];
    });

    return "added";
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const product = catalog?.products.find((item) => item.id === productId);
    if (!product || product.stock <= 0 || !Number.isFinite(quantity)) return;

    const nextQuantity = Math.max(1, Math.min(Math.floor(quantity), product.stock));

    setStoredItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: nextQuantity }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setStoredItems((current) =>
      current.filter((item) => item.productId !== productId)
    );
  };

  const clearCart = () => setStoredItems([]);

  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) =>
      total + (item.product ? item.product.price * item.quantity : 0),
    0
  );

  return (
    <CartContext.Provider
      value={{ items, totalQuantity, subtotal, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
