import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabaseClient";
import { openPaystackCheckout } from "../lib/paystack";
import { formatNaira } from "../lib/format";
import type { CartItem } from "../lib/types";

export type { CartItem };

interface CartProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

function Cart({ cart, setCart }: CartProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const total = (cart || []).reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(id);
      return;
    }
    setCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const handleRemoveItem = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleWhatsAppCheckout = () => {
    const phoneNumber = "2349164288560";
    const cartSummary = cart
      .map((item) => `${item.product.name} x${item.quantity}`)
      .join("\n");
    const message = `Hello Dali Wears,\n\nI would like to purchase:\n${cartSummary}\n\nTotal: ${formatNaira(
      total
    )}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  const handlePaystackCheckout = async () => {
    if (!user) {
      navigate("/login?redirect=/cart");
      return;
    }

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      setPayError("Online payment isn't configured yet. Please checkout with WhatsApp instead.");
      return;
    }

    setPayError(null);
    setPaying(true);

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({ user_id: user.id, status: "pending", total })
        .select("id")
        .single();

      if (orderError || !order) {
        throw new Error(orderError?.message || "Could not create order.");
      }

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw new Error(itemsError.message);

      await openPaystackCheckout({
        key: publicKey,
        email: user.email ?? "",
        amount: Math.round(total * 100),
        ref: `dali-${order.id}-${Date.now()}`,
        metadata: { order_id: order.id },
        onSuccess: async (reference) => {
          try {
            const res = await fetch("/api/paystack-verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference, order_id: order.id }),
            });
            const body = await res.json();
            if (body.status === "paid") {
              handleClearCart();
              navigate("/account");
            } else {
              setPayError("Payment could not be verified. Please try again or contact us.");
            }
          } finally {
            setPaying(false);
          }
        },
        onCancel: () => setPaying(false),
      });
    } catch (err) {
      setPaying(false);
      setPayError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-20 py-10">
      <h1 className="text-4xl font-bold mb-10 text-center">🛒 Your Cart</h1>

      {!cart || cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-2xl text-gray-400 mb-8">Your cart is empty</p>
          <Link to="/latest">
            <button className="bg-[#00DA6B] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#1d9948] transition text-lg">
              Continue Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Instruction Box */}
            <div className="bg-[#002a35] border-l-4 border-[#00DA6B] p-4 md:p-6 rounded-lg mb-8 flex gap-4">
              <AlertCircle size={24} className="text-[#00DA6B] flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">Review Your Items</h3>
                <p className="text-gray-300">
                  Pay securely online with{" "}
                  <span className="font-semibold text-[#00DA6B]">Paystack</span>, or use{" "}
                  <span className="font-semibold text-[#00DA6B]">Checkout with WhatsApp</span> to
                  arrange payment directly with us.
                </p>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#001D23] rounded-xl p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  {/* Product Image */}
                  <img
                    src={item.product.image_url ?? undefined}
                    alt={item.product.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg bg-[#002a35]"
                  />

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="text-lg md:text-2xl font-bold mb-2">{item.product.name}</h3>
                    <p className="text-[#00DA6B] text-lg font-bold mb-2">
                      {formatNaira(item.product.price)}
                    </p>
                    <p className="text-gray-400 text-sm">Category: {item.product.category}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-[#002a35] p-2 rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-[#003a45] rounded transition"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="px-4 font-bold text-lg">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-[#003a45] rounded transition"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 hover:bg-red-500 hover:bg-opacity-20 rounded transition text-red-500"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right w-full sm:w-auto">
                    <p className="text-gray-400 text-sm">Subtotal:</p>
                    <p className="text-xl font-bold text-[#00DA6B]">
                      {formatNaira(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#001D23] rounded-xl p-6 sticky top-20">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 border-b border-gray-700 pb-6">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold">{formatNaira(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-bold">TBD</span>
                </div>
              </div>

              <div className="flex justify-between text-2xl font-bold mb-6">
                <span>Total:</span>
                <span className="text-[#00DA6B]">{formatNaira(total)}</span>
              </div>

              {payError && <p className="text-red-400 text-sm mb-4">{payError}</p>}

              {!user && (
                <p className="text-gray-400 text-sm mb-3">
                  <Link to="/login?redirect=/cart" className="text-[#00DA6B] hover:underline">
                    Log in
                  </Link>{" "}
                  to pay online and track your order.
                </p>
              )}

              <button
                onClick={handlePaystackCheckout}
                disabled={paying}
                className="w-full flex items-center justify-center gap-2 bg-[#00DA6B] text-black font-bold py-3 rounded-lg hover:bg-[#1d9948] transition mb-3 disabled:opacity-60"
              >
                {paying && <Loader2 size={18} className="animate-spin" />}
                {paying ? "Processing..." : "Pay with Paystack"}
              </button>

              <button
                onClick={handleWhatsAppCheckout}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition mb-3"
              >
                Checkout with WhatsApp
              </button>

              <Link to="/latest">
                <button className="w-full bg-[#002a35] text-white font-bold py-3 rounded-lg hover:bg-[#003a45] transition border border-gray-600">
                  Continue Shopping
                </button>
              </Link>

              <button
                onClick={handleClearCart}
                className="w-full mt-3 bg-red-500 bg-opacity-20 text-red-500 font-bold py-3 rounded-lg hover:bg-opacity-30 transition"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
