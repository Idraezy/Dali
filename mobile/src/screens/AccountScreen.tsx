import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/useAuth";
import { formatNaira } from "../lib/format";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../navigation/types";
import type { Order, OrderItem, OrderStatus } from "../lib/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface OrderWithItems extends Order {
  items: OrderItem[];
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  paid: colors.accent,
  pending: "#FBBF24",
  failed: colors.danger,
};

function ProfileTab() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setAddress(profile.address ?? "");
    setSubscribed(profile.subscribed_to_updates);
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        subscribed_to_updates: subscribed,
      })
      .eq("id", user.id);
    setSaving(false);
    if (!error) {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Your name" placeholderTextColor="#6B7280" />

      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+234..." placeholderTextColor="#6B7280" />

      <Text style={styles.label}>Delivery Address</Text>
      <TextInput
        style={[styles.input, { minHeight: 60, textAlignVertical: "top" }]}
        value={address}
        onChangeText={setAddress}
        placeholder="Street, city, state"
        placeholderTextColor="#6B7280"
        multiline
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Subscribe to updates</Text>
        <Switch
          value={subscribed}
          onValueChange={setSubscribed}
          trackColor={{ true: colors.accent }}
        />
      </View>

      {saved && <Text style={styles.saved}>Profile updated.</Text>}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.saveButtonText}>Save Profile</Text>}
      </TouchableOpacity>
    </View>
  );
}

function OrdersTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data: orderRows } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const withItems: OrderWithItems[] = [];
      for (const order of (orderRows ?? []) as Order[]) {
        const { data: itemRows } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);
        withItems.push({ ...order, items: (itemRows ?? []) as OrderItem[] });
      }
      setOrders(withItems);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />;

  if (orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cube-outline" size={40} color="#4B5563" />
        <Text style={styles.empty}>You haven't placed any orders yet.</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {orders.map((order) => (
        <View key={order.id} style={styles.card}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderId}>Order #{order.id}</Text>
              <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString("en-NG")}</Text>
            </View>
            <Text style={[styles.statusBadge, { color: STATUS_COLORS[order.status] }]}>
              {order.status.toUpperCase()}
            </Text>
          </View>
          {order.items.map((item) => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={styles.summaryItem}>
                {item.product_name} x{item.quantity}
              </Text>
              <Text style={styles.summaryItem}>{formatNaira(item.product_price * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatNaira(order.total)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function AccountScreen() {
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<"profile" | "orders">("profile");

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.empty}>Log in to view your account.</Text>
        <TouchableOpacity style={styles.saveButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.saveButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.headerRow}>
        <Text style={styles.email}>{user.email}</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Text style={styles.logout}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(["profile", "orders"] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "profile" ? "Profile" : "Orders"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "profile" ? <ProfileTab /> : <OrdersTab />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: "center", alignItems: "center", gap: 12 },
  empty: { color: colors.textMuted, textAlign: "center" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  email: { color: colors.textMuted, fontSize: 13 },
  logout: { color: colors.danger, fontWeight: "600", fontSize: 13 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.surface },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  tabTextActive: { color: colors.background },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 16 },
  label: { color: colors.text, fontWeight: "600", fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  switchLabel: { color: colors.text, fontWeight: "600", fontSize: 13 },
  saved: { color: colors.accent, fontSize: 13, marginBottom: 10 },
  saveButton: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  saveButtonText: { color: colors.background, fontWeight: "700" },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  orderId: { color: colors.text, fontWeight: "700" },
  orderDate: { color: colors.textMuted, fontSize: 12 },
  statusBadge: { fontWeight: "800", fontSize: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  summaryItem: { color: "#D1D5DB", fontSize: 13 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    paddingTop: 8,
    marginTop: 6,
  },
  totalLabel: { color: colors.text, fontWeight: "700" },
  totalValue: { color: colors.accent, fontWeight: "800" },
});
