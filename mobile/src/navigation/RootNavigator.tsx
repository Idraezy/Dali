import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import WishlistScreen from "../screens/WishlistScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import FaqScreen from "../screens/FaqScreen";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.accent,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Product" }}
      />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Log In" }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Sign Up" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: "My Wishlist" }} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
      <Stack.Screen name="Faq" component={FaqScreen} options={{ title: "FAQ", headerShown: false }} />
    </Stack.Navigator>
  );
}
