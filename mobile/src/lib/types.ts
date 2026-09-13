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
  image_url: string | null;
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
  full_name: string | null;
  phone: string | null;
  address: string | null;
  subscribed_to_updates: boolean;
  notifications_last_seen_at: string;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  user_id: string;
  product_id: number;
  created_at: string;
}

export interface Announcement {
  id: number;
  message: string;
  created_at: string;
}

export type ChatSender = "user" | "admin";

export interface ChatMessage {
  id: number;
  user_id: string;
  sender: ChatSender;
  body: string;
  read: boolean;
  created_at: string;
}

export interface StoreSettings {
  id: number;
  whatsapp_number: string;
  contact_email: string;
  contact_phone: string;
  updated_at: string;
}
