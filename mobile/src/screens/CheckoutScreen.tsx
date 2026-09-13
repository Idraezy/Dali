import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/useAuth";
import { useCart } from "../lib/useCart";
import { useChat } from "../lib/useChat";
import { payWithPaystack } from "../lib/paystack";
import { formatNaira } from "../lib/format";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const { sendMessage } = useChat();
  const [paying, setPaying] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.empty}>Your cart is empty.</Text>
      </View>
    );
  }

  const handlePay = async () => {
    if (!user) return;
    setError(null);
    setPaying(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({ user_id: user.id, status: "pending", total })
        .select("id")
        .single();
      if (orderError || !order) throw new Error(orderError?.message || "Could not create order.");

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw new Error(itemsError.message);

      const result = await payWithPaystack({
        email: user.email ?? "",
        amountNaira: total,
        orderId: order.id,
      });

      if (result.status === "paid") {
        clearCart();
        Alert.alert("Payment successful", "Your order has been placed.");
        navigation.navigate("Tabs", { screen: "Account" } as never);
      } else {
        setError(result.error || "Payment could not be verified. Please try again or message us.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPaying(false);
    }
  };

  const handleMessageUs = async () => {
    setMessaging(true);
    const summary = cart.map((item) => `${item.product.name} x${item.quantity}`).join("\n");
    await sendMessage(`Hi, I'd like to arrange payment for:\n${summary}\n\nTotal: ${formatNaira(total)}`);
    setMessaging(false);
    navigation.navigate("Tabs", { screen: "Chat" } as never);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Checkout</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        {cart.map((item) => (
          <View key={item.id} style={styles.summaryRow}>
            <Text style={styles.summaryItem}>
              {item.product.name} x{item.quantity}
            </Text>
            <Text style={styles.summaryItem}>{formatNaira(item.product.price * item.quantity)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatNaira(total)}</Text>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.payButton} onPress={handlePay} disabled={paying}>
        {paying ? <ActivityIndicator color={colors.background} /> : <Text style={styles.payButtonText}>Pay with Paystack</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.messageButton} onPress={handleMessageUs} disabled={messaging}>
        {messaging ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.messageButtonText}>Message Us to Arrange Payment</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: "center", alignItems: "center" },
  empty: { color: colors.textMuted },
  title: { color: colors.text, fontSize: 22, fontWeight: "800", marginBottom: 16, textAlign: "center" },
  summaryCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 },
  summaryTitle: { color: colors.text, fontWeight: "700", marginBottom: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryItem: { color: "#D1D5DB", fontSize: 13 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: { color: colors.text, fontWeight: "700", fontSize: 16 },
  totalValue: { color: colors.accent, fontWeight: "800", fontSize: 18 },
  error: { color: colors.danger, marginBottom: 12, textAlign: "center", fontSize: 13 },
  payButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  payButtonText: { color: colors.background, fontWeight: "700" },
  messageButton: {
    backgroundColor: "#22C55E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  messageButtonText: { color: "#fff", fontWeight: "700" },
});
