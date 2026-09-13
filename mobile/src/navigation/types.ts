export type RootStackParamList = {
  Tabs: undefined;
  ProductDetail: { productId: number };
  Login: { redirect?: "Checkout" | "Wishlist" | "Notifications" } | undefined;
  Signup: undefined;
  Checkout: undefined;
  Wishlist: undefined;
  Notifications: undefined;
  Faq: undefined;
};

export type TabParamList = {
  Home: undefined;
  Shop: { category?: string } | undefined;
  Cart: undefined;
  Chat: undefined;
  Account: undefined;
};
