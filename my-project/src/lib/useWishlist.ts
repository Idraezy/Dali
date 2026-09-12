import { createContext, useContext } from "react";

export interface WishlistContextValue {
  productIds: Set<number>;
  loading: boolean;
  toggle: (productId: number) => Promise<void>;
  refresh: () => void;
}

export const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
