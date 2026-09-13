import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import ProductImage from "../components/ProductImage";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/useAuth";
import { useWishlist } from "../lib/useWishlist";
import { useCart } from "../lib/useCart";
import { useChat } from "../lib/useChat";
import { formatNaira } from "../lib/format";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../navigation/types";
import type { Product, Review } from "../lib/types";

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

export default function ProductDetailScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const { user } = useAuth();
  const { productIds: wishlistIds, toggle: toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { sendMessage } = useChat();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()
      .then(({ data }) => {
        setProduct((data as Product) ?? null);
        setLoading(false);
      });
  }, [productId]);

  useEffect(() => {
    setReviewsLoading(true);
    supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setReviews((data ?? []) as Review[]);
        setReviewsLoading(false);
      });
  }, [productId]);

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to attach an image to your review.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setReviewImage(result.assets[0]);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !comment.trim()) {
      Alert.alert("Missing comment", "Please write a comment.");
      return;
    }
    setSubmittingReview(true);
    try {
      let imageUrl: string | null = null;
      if (reviewImage) {
        const ext = reviewImage.uri.split(".").pop() || "jpg";
        const path = `${user.id}-${Date.now()}.${ext}`;
        const response = await fetch(reviewImage.uri);
        const blob = await response.blob();
        const { error: uploadError } = await supabase.storage
          .from("review-images")
          .upload(path, blob, { contentType: reviewImage.mimeType ?? "image/jpeg" });
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from("review-images").getPublicUrl(path).data.publicUrl;
      }

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          product_id: productId,
          user_id: user.id,
          name: user.email?.split("@")[0] ?? "Customer",
          rating,
          comment,
          image_url: imageUrl,
        })
        .select("*")
        .single();

      if (error) throw error;
      setReviews((prev) => [data as Review, ...prev]);
      setComment("");
      setReviewImage(null);
      setRating(5);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Could not submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleChatInquiry = async () => {
    if (!user || !product) {
      navigation.navigate("Login");
      return;
    }
    await sendMessage(`Hi, I'm interested in "${product.name}". Can you tell me more?`);
    navigation.navigate("Tabs", { screen: "Chat" } as never);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text style={styles.empty}>Product not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <ProductImage uri={product.image_url} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{product.name}</Text>
          {user && (
            <TouchableOpacity onPress={() => toggleWishlist(product.id)}>
              <Ionicons
                name={wishlistIds.has(product.id) ? "heart" : "heart-outline"}
                size={24}
                color={colors.accent}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons
              key={i}
              name={i <= Math.round(averageRating) ? "star" : "star-outline"}
              size={16}
              color="#FBBF24"
            />
          ))}
          <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
        </View>

        <Text style={styles.price}>{formatNaira(product.price)}</Text>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionLabel}>ABOUT THIS ITEM</Text>
          <Text style={styles.description}>
            {product.description ||
              "High-quality product with excellent craftsmanship. Ask us for more details, sizing, or styling suggestions."}
          </Text>
          <Text style={styles.category}>Category: {product.category}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.chatButton} onPress={handleChatInquiry}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
            <Text style={styles.chatButtonText}>Chat with us</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(product)}>
          <Ionicons name="cart-outline" size={18} color={colors.background} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Leave a Review</Text>

          {user ? (
            <View style={styles.reviewForm}>
              <View style={styles.starPicker}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity key={i} onPress={() => setRating(i)}>
                    <Ionicons
                      name={rating >= i ? "star" : "star-outline"}
                      size={22}
                      color="#FBBF24"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reviewInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Your comment"
                placeholderTextColor="#6B7280"
                multiline
              />
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Ionicons name="camera-outline" size={16} color={colors.accent} />
                <Text style={styles.photoButtonText}>
                  {reviewImage ? "Photo selected" : "Add a photo (optional)"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitReviewButton}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitReviewText}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginPrompt}>
                <Text style={{ color: colors.accent }}>Log in</Text> to leave a review.
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Reviews</Text>
          {reviewsLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : reviews.length === 0 ? (
            <Text style={styles.empty}>No reviews yet. Be the first!</Text>
          ) : (
            reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <View style={{ flexDirection: "row" }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Ionicons
                        key={i}
                        name={i <= r.rating ? "star" : "star-outline"}
                        size={12}
                        color="#FBBF24"
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
                {r.image_url && <ProductImage uri={r.image_url} style={styles.reviewImage} />}
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  image: { width: "100%", height: 320 },
  content: { padding: 16 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: colors.text, fontSize: 20, fontWeight: "700", flex: 1, marginRight: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 8 },
  reviewCount: { color: colors.textMuted, fontSize: 12, marginLeft: 6 },
  price: { color: "#22C55E", fontSize: 22, fontWeight: "800", marginTop: 10 },
  descriptionBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginTop: 16 },
  descriptionLabel: { color: colors.textMuted, fontSize: 11, fontWeight: "700", marginBottom: 6 },
  description: { color: "#E5E7EB", fontSize: 13, lineHeight: 19 },
  category: { color: colors.textMuted, fontSize: 11, marginTop: 10 },
  actionsRow: { marginTop: 16 },
  chatButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#22C55E",
    borderRadius: 10,
    paddingVertical: 12,
  },
  chatButtonText: { color: "#fff", fontWeight: "700" },
  addToCartButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  addToCartText: { color: colors.background, fontWeight: "700" },
  reviewsSection: { marginTop: 28 },
  sectionTitle: { color: "#FBBF24", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  reviewForm: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 16 },
  starPicker: { flexDirection: "row", gap: 6, marginBottom: 12 },
  reviewInput: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 8,
    padding: 10,
    minHeight: 70,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  photoButton: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  photoButtonText: { color: colors.textMuted, fontSize: 13 },
  submitReviewButton: {
    backgroundColor: "#22C55E",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  submitReviewText: { color: "#fff", fontWeight: "700" },
  loginPrompt: { color: colors.textMuted, marginBottom: 16 },
  reviewCard: { backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginBottom: 10 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  reviewName: { color: colors.text, fontWeight: "600", fontSize: 13 },
  reviewComment: { color: "#D1D5DB", fontSize: 12, marginBottom: 8 },
  reviewImage: { width: 80, height: 80, borderRadius: 8 },
  empty: { color: colors.textMuted, textAlign: "center" },
});
