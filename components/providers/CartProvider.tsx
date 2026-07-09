"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "yapinci-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setItems(JSON.parse(stored) as CartItem[]);
      } catch {
        setItems([]);
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((current) => {
        const existing = current.find(
          (cartItem) => cartItem.variantId === item.variantId
        );

        if (existing) {
          return current.map((cartItem) =>
            cartItem.variantId === item.variantId
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          );
        }

        return [...current, { ...item, quantity }];
      });
    },
    []
  );

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.variantId !== variantId)
        : current.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item
          )
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((current) =>
      current.filter((item) => item.variantId !== variantId)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return {
      items,
      count,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [items, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
