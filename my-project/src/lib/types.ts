export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
  show_stock: boolean;
  images: string[];
  videos: string[];
  sizes: string[];
  discount_percent: number | null;
  discount_ends_at: string | null;
  preorder: boolean;
  preorder_note: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface CartItem {
  key: string; // product id + size, see cartKey()
  id: number; // product id
  size: string | null;
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

export type DeliveryStatus =
  | "processing"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface Order {
  id: number;
  user_id: string;
  status: OrderStatus;
  total: number;
  paystack_reference: string | null;
  delivery_status: DeliveryStatus;
  courier: string | null;
  tracking_number: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface TrackingEvent {
  id: number;
  order_id: number;
  stage: DeliveryStatus | null;
  message: string;
  location: string | null;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_price: number;
  quantity: number;
  size: string | null;
  preorder: boolean;
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
  android_app_url: string | null;
  ios_app_url: string | null;
  updated_at: string;
}

export interface CoinSettings {
  id: number;
  checkin_coins: number;
  streak_bonus_coins: number;
  order_coins_per_1000: number;
  referral_coins: number;
  naira_per_coin: number | null;
  min_redeem_coins: number | null;
  payout_schedule: string | null;
  updated_at: string;
}
