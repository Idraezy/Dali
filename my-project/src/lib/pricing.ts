import type { CartItem, Product } from "./types";

// Mirrors public.product_sale_price() in supabase/schema.sql, which is what
// orders are actually charged — keep the two in step.
export function hasActiveDiscount(product: Product): boolean {
  if (!product.discount_percent) return false;
  return !product.discount_ends_at || new Date(product.discount_ends_at) > new Date();
}

export function salePrice(product: Product): number {
  if (!hasActiveDiscount(product)) return Number(product.price);
  return Math.round((Number(product.price) * (100 - product.discount_percent!)) / 100);
}

export function productSizes(product: Product): string[] {
  return product.sizes ?? [];
}

// Every photo, cover first. Older rows (and old carts) may only have image_url.
export function productImages(product: Product): string[] {
  if (product.images?.length) return product.images;
  return product.image_url ? [product.image_url] : [];
}

// Stock shoppers see: "Out of stock" always, the exact count only when the
// admin has switched it on for this product.
export function stockLabel(product: Product): string | null {
  if (product.stock <= 0) return "Out of stock";
  if (product.show_stock) {
    return product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`;
  }
  return null;
}

export function cartKey(productId: number, size: string | null): string {
  return `${productId}:${size ?? ""}`;
}

// Carts saved before sizes existed have no key/size yet.
export function normalizeCart(saved: CartItem[]): CartItem[] {
  return saved.map((item) => ({
    ...item,
    size: item.size ?? null,
    key: item.key ?? cartKey(item.id, item.size ?? null),
  }));
}

// Adds to the matching product+size line, never past the stock on hand.
export function addItem(cart: CartItem[], product: Product, quantity = 1, size: string | null = null): CartItem[] {
  const key = cartKey(product.id, size);
  const cap = product.stock > 0 ? product.stock : quantity;
  const existing = cart.find((item) => item.key === key);
  if (existing) {
    return cart.map((item) =>
      item.key === key ? { ...item, product, quantity: Math.min(item.quantity + quantity, cap) } : item
    );
  }
  return [...cart, { key, id: product.id, size, product, quantity: Math.min(quantity, cap) }];
}
