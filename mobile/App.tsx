import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/lib/AuthContext";
import { useAuth } from "./src/lib/useAuth";
import { WishlistProvider } from "./src/lib/WishlistContext";
import { ChatProvider } from "./src/lib/ChatContext";
import { CartProvider } from "./src/lib/CartContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { colors } from "./src/lib/theme";

function Gate() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WishlistProvider>
          <ChatProvider>
            <CartProvider>
              <Gate />
              <StatusBar style="light" />
            </CartProvider>
          </ChatProvider>
        </WishlistProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
