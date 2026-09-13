import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ProductImage from "../components/ProductImage";
import { supabase } from "../lib/supabaseClient";
import { useWishlist } from "../lib/useWishlist";
import { useCart } from "../lib/useCart";
import { formatNaira } from "../lib/format";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../navigation/types";
import type { Product } from "../lib/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WishlistScreen() {
  const navigation = useNavigation<Nav>();
  const { productIds, loading: idsLoading, toggle } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (idsLoading) return;
    if (productIds.size === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .in("id", Array.from(productIds))
      .then(({ data }) => {
        setProducts((data ?? []) as Product[]);
        setLoading(false);
      });
  }, [productIds, idsLoading]);

  if (loading || idsLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="heart-outline" size={40} color="#4B5563" />
        <Text style={styles.empty}>Nothing saved yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={products}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
        >
          <View>
            <ProductImage uri={item.image_url} style={styles.image} />
            <TouchableOpacity style={styles.removeButton} onPress={() => toggle(item.id)}>
              <Ionicons name="trash-outline" size={14} color={colors.danger} />
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.price}>{formatNaira(item.price)}</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: "center", alignItems: "center" },
  empty: { color: colors.textMuted, marginTop: 12 },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, overflow: "hidden" },
  image: { width: "100%", height: 130 },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 999,
    padding: 6,
  },
  cardBody: { padding: 10 },
  name: { color: colors.text, fontWeight: "600", marginBottom: 4, fontSize: 13 },
  price: { color: colors.accent, fontWeight: "700", marginBottom: 8, fontSize: 13 },
  addButton: { backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 6, alignItems: "center" },
  addButtonText: { color: colors.background, fontWeight: "700", fontSize: 12 },
});
