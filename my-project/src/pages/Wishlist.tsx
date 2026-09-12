import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Loader2, Trash2 } from "lucide-react";
import ProductImage from "../components/ProductImage";
import { supabase } from "../lib/supabaseClient";
import { useWishlist } from "../lib/useWishlist";
import { formatNaira } from "../lib/format";
import type { CartItem, Product } from "../lib/types";

interface WishlistProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
}

function Wishlist({ cart, setCart }: WishlistProps) {
  const { productIds, loading: idsLoading, toggle } = useWishlist();
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

  const handleAddToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { id: product.id, product, quantity: 1 }]);
    }
  };

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-20 py-10">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Heart className="text-[#00DA6B] fill-[#00DA6B]" /> My Wishlist
      </h1>

      {(loading || idsLoading) && (
        <div className="flex items-center gap-2 text-gray-400 py-10">
          <Loader2 className="animate-spin" /> Loading your wishlist...
        </div>
      )}

      {!loading && !idsLoading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-[#001D23] rounded-xl">
          <Heart size={40} className="text-gray-500 mb-4" />
          <p className="text-gray-400 mb-6">Nothing saved yet.</p>
          <Link to="/latest">
            <button className="bg-[#00DA6B] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#1d9948] transition">
              Browse the Shop
            </button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-[#001D23] rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
          >
            <div className="relative h-56 overflow-hidden bg-[#002a35]">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                className="w-full h-full group-hover:scale-110 transition-transform duration-300"
              />
              <button
                onClick={() => toggle(product.id)}
                className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                title="Remove from wishlist"
              >
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold mb-1">{product.name}</h3>
              <p className="text-[#00DA6B] font-bold mb-3">{formatNaira(product.price)}</p>
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-[#00DA6B] text-black font-bold py-2 rounded-lg hover:bg-[#1d9948] transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
