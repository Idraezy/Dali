import { useCallback, useEffect, useState } from "react";
import { addItem, normalizeCart } from "./pricing";
import type { CartItem, Product } from "./types";

const STORAGE_KEY = "daliWearsCart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeCart(JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage failures (private browsing, quota, etc.)
    }
  }, [cart]);

  const addToCart = useCallback((product: Product, quantity = 1, size: string | null = null) => {
    setCart((prev) => addItem(prev, product, quantity, size));
  }, []);

  return { cart, setCart, addToCart };
}
