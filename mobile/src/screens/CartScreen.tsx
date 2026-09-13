import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ProductImage from "../components/ProductImage";
import { useCart } from "../lib/useCart";
import { useAuth } from "../lib/useAuth";
import { formatNaira } from "../lib/format";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../navigation/types";
import type { CartItem } from "../lib/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CartScreen() {
  const navigation = useNavigation<Nav>();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      navigation.navigate("Login", { redirect: "Checkout" });
      return;
    }
    navigation.navigate("Checkout");
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.row}>
      <ProductImage uri={item.product.image_url} style={styles.image} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={styles.price}>{formatNaira(item.product.price)}</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: "auto" }} onPress={() => removeFromCart(item.id)}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.empty}>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
      />

      <View style={styles.summary}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatNaira(total)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
          <Text style={styles.clearButtonText}>Clear Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  centered: { justifyContent: "center", alignItems: "center" },
  empty: { color: colors.textMuted, fontSize: 16 },
  row: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  image: { width: 72, height: 72, borderRadius: 10 },
  name: { color: colors.text, fontWeight: "600", marginBottom: 4 },
  price: { color: colors.accent, fontWeight: "700", marginBottom: 8 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyButton: { backgroundColor: colors.background, borderRadius: 6, padding: 4 },
  qtyText: { color: colors.text, fontWeight: "700", minWidth: 20, textAlign: "center" },
  summary: { paddingTop: 12, borderTopWidth: 1, borderTopColor: "#1F2937" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  totalLabel: { color: colors.text, fontSize: 16, fontWeight: "700" },
  totalValue: { color: colors.accent, fontSize: 18, fontWeight: "800" },
  checkoutButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  checkoutButtonText: { color: colors.background, fontWeight: "700" },
  clearButton: { alignItems: "center", paddingVertical: 8 },
  clearButtonText: { color: colors.danger, fontWeight: "600", fontSize: 13 },
});
