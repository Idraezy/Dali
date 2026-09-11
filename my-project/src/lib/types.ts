export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
  is_featured: boolean;
  created_at: string;
}

export interface CartItem {
  id: number; // product id
  product: Product;
  quantity: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export type OrderStatus = "pending" | "paid" | "failed";

export interface Order {
  id: number;
  user_id: string;
  status: OrderStatus;
  total: number;
  paystack_reference: string | null;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_price: number;
  quantity: number;
}

export interface Profile {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}
