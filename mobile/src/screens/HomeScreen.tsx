import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import ProductImage from "../components/ProductImage";
import { useProducts } from "../lib/useProducts";
import { formatNaira } from "../lib/format";
import { colors } from "../lib/theme";
import type { RootStackParamList, TabParamList } from "../navigation/types";
import type { Product } from "../lib/types";

type Nav = NativeStackNavigationProp<RootStackParamList> & BottomTabNavigationProp<TabParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { products, loading } = useProducts();
  const featured = products.filter((p) => p.is_featured).slice(0, 10);

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
    >
      <ProductImage uri={item.image_url} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardPrice}>{formatNaira(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.brand}>DALI WEARS</Text>
        <Text style={styles.tagline}>Fashion that speaks for you</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate("Shop")}>
          <Text style={styles.shopButtonText}>Shop Now</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Featured Products</Text>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : featured.length === 0 ? (
        <Text style={styles.empty}>
          Featured products will show up here once the admin marks some as featured.
        </Text>
      ) : (
        <FlatList
          data={featured}
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
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  brand: { fontSize: 32, fontWeight: "900", color: colors.accent, letterSpacing: 1 },
  tagline: { color: colors.textMuted, marginTop: 6, marginBottom: 16 },
  shopButton: {
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  shopButtonText: { color: colors.accent, fontWeight: "700" },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 24 },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, overflow: "hidden" },
  cardImage: { width: "100%", height: 130 },
  cardBody: { padding: 10 },
  cardName: { color: colors.text, fontWeight: "600", marginBottom: 4, fontSize: 13 },
  cardPrice: { color: colors.accent, fontWeight: "700", fontSize: 13 },
});
