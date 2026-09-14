import { useEffect, useMemo, useState } from "react";
import { Search, X, Star, ShoppingCart, CircleCheckBig, Loader2, Heart, MessageCircle, Camera } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ProductImage from "../components/ProductImage";
import { useProducts } from "../lib/useProducts";
import { useAuth } from "../lib/useAuth";
import { useWishlist } from "../lib/useWishlist";
import { useChat } from "../lib/useChat";
import { supabase } from "../lib/supabaseClient";
import { formatNaira } from "../lib/format";
import type { CartItem, Product, Review } from "../lib/types";

interface LatestProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
}

function Latest({ cart, setCart }: LatestProps) {
  const { products, loading, error } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { productIds: wishlistIds, toggle: toggleWishlist } = useWishlist();
  const { setOpen: setChatOpen, sendMessage } = useChat();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(searchParams.get("category") || "All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category))).sort();
    return ["All", ...unique];
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || product.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: filter });
    }
  };

  useEffect(() => {
    if (!selectedProduct) return;
    let active = true;
    setReviewsLoading(true);
    supabase
      .from("reviews")
      .select("*")
      .eq("product_id", selectedProduct.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setReviews((data ?? []) as Review[]);
        setReviewsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedProduct]);

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { id: product.id, product, quantity: 1 }]);
    }

    setNotification(product.name);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReviewSubmit = async () => {
    if (!user || !selectedProduct) return;
    if (!reviewForm.comment.trim()) {
      alert("Please write a comment.");
      return;
    }

    setSubmittingReview(true);

    let imageUrl: string | null = null;
    if (reviewImage) {
      const ext = reviewImage.name.split(".").pop() || "jpg";
      const path = `${user.id}-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("review-images")
        .upload(path, reviewImage);
      if (uploadError) {
        setSubmittingReview(false);
        alert(uploadError.message);
        return;
      }
      imageUrl = supabase.storage.from("review-images").getPublicUrl(path).data.publicUrl;
    }

    const { data, error: insertError } = await supabase
      .from("reviews")
      .insert({
        product_id: selectedProduct.id,
        user_id: user.id,
        name: user.email?.split("@")[0] ?? "Customer",
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        image_url: imageUrl,
      })
      .select("*")
      .single();
    setSubmittingReview(false);

    if (insertError) {
      alert(insertError.message);
      return;
    }

    setReviews([data as Review, ...reviews]);
    setReviewForm({ rating: 5, comment: "" });
    setReviewImage(null);
  };

  const handleChatInquiry = async (product: Product) => {
    if (!user) {
      navigate("/login?redirect=/latest");
      return;
    }
    await sendMessage(`Hi, I'm interested in "${product.name}". Can you tell me more?`);
    setChatOpen(true);
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="mx-5 py-5 min-h-screen text-white">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-40 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 font-semibold">
            <span className="text-2xl">
              <CircleCheckBig className="text-white" />
            </span>
            <span>{notification} added to your cart</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 mb-5 flex-wrap gap-4">
        <p className="text-2xl font-bold">Dali Wears</p>

        {/* Search Bar */}
        <div className="flex items-center bg-[#001D23] rounded-full px-4 py-2 flex-1 min-w-[200px] max-w-96">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search for tops or frames..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full text-white placeholder-gray-500 text-sm"
          />
        </div>

        <Link to="/cart">
          <button className="bg-[#00DA6B] px-5 py-2 rounded-xl text-black font-bold hover:bg-[#1d9948] transition">
            Cart
          </button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="mt-5 bg-[#001D23] p-8 rounded-xl mb-10">
        <p className="text-3xl lg:text-4xl font-bold mb-4">New Arrivals</p>
        <p className="text-gray-300 text-sm mb-6 max-w-2xl">
          Our New Arrivals collection brings together the freshest fashion pieces and
          Pinterest-inspired frames — created to help you express your style in every detail.
        </p>
        <Link to="/about">
          <button className="bg-[#00DA6B] px-5 py-2 rounded-xl text-white hover:bg-[#1d9948] transition">
            Learn More
          </button>
        </Link>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {categories.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
              activeFilter === filter
                ? "bg-[#00DA6B] text-black"
                : "bg-[#001D23] text-white hover:bg-[#002a35]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Loading / Error / Empty states */}
      {loading && (
        <div className="flex justify-center py-20 text-gray-400 gap-2">
          <Loader2 className="animate-spin" /> Loading products...
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-20">
          <p className="text-red-400">Couldn't load products: {error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400">
            No products yet — check back soon, or add some from the admin dashboard.
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-[#001D23] rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative h-64 overflow-hidden bg-[#002a35]">
                <ProductImage
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
                {user && (
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                  >
                    <Heart
                      size={16}
                      className={
                        wishlistIds.has(product.id) ? "fill-[#00DA6B] text-[#00DA6B]" : "text-white"
                      }
                    />
                  </button>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                <p className="text-[#00DA6B] font-bold mb-1">{formatNaira(product.price)}</p>
                <p className="text-gray-400 text-sm mb-4">Category: {product.category}</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-[#00DA6B] text-black font-bold py-2 rounded-lg hover:bg-[#1d9948] transition flex items-center justify-center gap-2 text-sm"
                  >
                    <ShoppingCart size={16} />
                    Add
                  </button>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="flex-1 bg-[#001a1f] text-white font-bold py-2 rounded-lg hover:bg-[#002a35] transition border border-gray-600 text-sm"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#001D23] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto my-4 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 hover:bg-[#002a35] rounded-full z-10"
            >
              <X size={22} className="text-white" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-8">
              <div className="flex items-center justify-center">
                <ProductImage
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-64 md:h-80 rounded-xl"
                />
              </div>

              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h1 className="text-xl md:text-2xl font-bold">{selectedProduct.name}</h1>
                  {user && (
                    <button
                      onClick={() => toggleWishlist(selectedProduct.id)}
                      className="p-2 hover:bg-[#002a35] rounded-full flex-shrink-0"
                    >
                      <Heart
                        size={20}
                        className={
                          wishlistIds.has(selectedProduct.id)
                            ? "fill-[#00DA6B] text-[#00DA6B]"
                            : "text-gray-400"
                        }
                      />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
                </div>

                <p className="text-xl md:text-2xl font-bold text-green-500 mb-4">
                  {formatNaira(selectedProduct.price)}
                </p>

                <div className="bg-[#002a35] rounded-xl p-4 mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
                    About this item
                  </h3>
                  <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedProduct.description ||
                      "High-quality product with excellent craftsmanship. Ask us for more details, sizing, or styling suggestions."}
                  </p>
                  <p className="text-gray-500 text-xs mt-3">Category: {selectedProduct.category}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <button
                    onClick={() => handleChatInquiry(selectedProduct)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-2 md:py-3 rounded-lg hover:bg-green-600 transition text-sm"
                  >
                    <MessageCircle size={16} />
                    Chat with us
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 bg-[#002a35] text-white font-bold py-2 md:py-3 rounded-lg hover:bg-[#003a45] transition border border-gray-600 text-sm"
                  >
                    Back to Shop
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full bg-green-500 text-white font-bold py-2 md:py-3 rounded-lg hover:bg-green-600 transition text-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="px-4 md:px-8 pb-8 border-t border-gray-700">
              <h2 className="text-lg md:text-xl font-bold mb-6 mt-6 text-yellow-400">
                Leave a Review
              </h2>

              {user ? (
                <div className="bg-[#002a35] p-4 md:p-6 rounded-xl mb-8">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Rating:</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="transition"
                        >
                          <Star
                            size={20}
                            className={
                              reviewForm.rating >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-400"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder="Your Comment"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full bg-[#001D23] p-2 md:p-3 rounded-lg mb-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-20 text-sm"
                  />

                  <label className="flex items-center gap-2 text-sm text-gray-300 mb-4 cursor-pointer w-fit">
                    <Camera size={16} className="text-[#00DA6B]" />
                    {reviewImage ? reviewImage.name : "Add a photo (optional)"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setReviewImage(e.target.files?.[0] ?? null)}
                    />
                  </label>

                  <button
                    onClick={handleReviewSubmit}
                    disabled={submittingReview}
                    className="w-full bg-green-500 text-white font-bold py-2 md:py-3 rounded-lg hover:bg-green-600 transition text-sm disabled:opacity-60"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 text-sm mb-8">
                  <Link to="/login" className="text-[#00DA6B] hover:underline">
                    Log in
                  </Link>{" "}
                  to leave a review.
                </p>
              )}

              <h3 className="text-base md:text-lg font-bold mb-4 text-yellow-400">Reviews</h3>
              {reviewsLoading ? (
                <p className="text-gray-400 text-sm">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet. Be the first! ⭐</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-[#002a35] p-3 md:p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">{review.name}</span>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 text-xs md:text-sm mb-2">{review.comment}</p>
                      {review.image_url && (
                        <img
                          src={review.image_url}
                          alt="Review attachment"
                          className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400">No products found. Try a different search!</p>
        </div>
      )}
    </div>
  );
}

export default Latest;
