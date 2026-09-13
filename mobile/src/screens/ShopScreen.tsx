import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ProductImage from "../components/ProductImage";
import { useProducts } from "../lib/useProducts";
import { useWishlist } from "../lib/useWishlist";
import { useCart } from "../lib/useCart";
import { useAuth } from "../lib/useAuth";
import { formatNaira } from "../lib/format";
import { colors } from "../lib/theme";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import type { Product } from "../lib/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ShopScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<TabParamList, "Shop">>();
  const { products, loading, error } = useProducts();
  const { productIds: wishlistIds, toggle: toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(route.params?.category ?? "All");

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category))).sort();
    return ["All", ...unique];
  }, [products]);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
    >
      <View>
        <ProductImage uri={item.image_url} style={styles.cardImage} />
        {user && (
          <TouchableOpacity style={styles.heartButton} onPress={() => toggleWishlist(item.id)}>
            <Ionicons
              name={wishlistIds.has(item.id) ? "heart" : "heart-outline"}
              size={16}
              color={wishlistIds.has(item.id) ? colors.accent : "#fff"}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardPrice}>{formatNaira(item.price)}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
          <Ionicons name="cart-outline" size={14} color={colors.background} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          placeholderTextColor="#6B7280"
        />
      </View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c}
        style={{ flexGrow: 0, marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, activeCategory === item && styles.chipActive]}
            onPress={() => setActiveCategory(item)}
          >
            <Text style={[styles.chipText, activeCategory === item && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.empty}>Couldn't load products: {error}</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>
          {products.length === 0
            ? "No products yet — check back soon."
            : "No products found. Try a different search."}
        </Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: { flex: 1, color: colors.text },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.text, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: colors.background },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 24 },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, overflow: "hidden" },
  cardImage: { width: "100%", height: 150 },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 999,
    padding: 6,
  },
  cardBody: { padding: 10 },
  cardName: { color: colors.text, fontWeight: "600", marginBottom: 4, fontSize: 13 },
  cardPrice: { color: colors.accent, fontWeight: "700", fontSize: 13, marginBottom: 8 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 6,
  },
  addButtonText: { color: colors.background, fontWeight: "700", fontSize: 12 },
});
