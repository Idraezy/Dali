import { TouchableOpacity, View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import ShopScreen from "../screens/ShopScreen";
import CartScreen from "../screens/CartScreen";
import ChatScreen from "../screens/ChatScreen";
import AccountScreen from "../screens/AccountScreen";
import { useCart } from "../lib/useCart";
import { useChat } from "../lib/useChat";
import { useAnnouncements } from "../lib/useAnnouncements";
import { colors } from "../lib/theme";
import type { RootStackParamList, TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

function HeaderRight() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { unreadCount } = useAnnouncements();

  return (
    <View style={{ flexDirection: "row", gap: 16, marginRight: 16 }}>
      <TouchableOpacity onPress={() => navigation.navigate("Wishlist")}>
        <Ionicons name="heart-outline" size={22} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
        <View>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          {unreadCount > 0 && <View style={styles.dot} />}
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function TabNavigator() {
  const { cart } = useCart();
  const { unreadFromAdmin } = useChat();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: "#1F2937" },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Dali Wears",
          headerRight: () => <HeaderRight />,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />,
          tabBarBadge: cart.length > 0 ? cart.length : undefined,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
          tabBarBadge: unreadFromAdmin > 0 ? unreadFromAdmin : undefined,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
});
