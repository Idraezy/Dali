import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabaseClient";
import { openPaystackCheckout } from "../lib/paystack";
import { formatNaira } from "../lib/format";
import { useChat } from "../lib/useChat";
import type { CartItem } from "../lib/types";

interface CheckoutProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
}

function Checkout({ cart, setCart }: CheckoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setOpen: setChatOpen, sendMessage } = useChat();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [messaging, setMessaging] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
        <p className="text-xl text-gray-400 mb-6">Your cart is empty.</p>
        <Link to="/latest">
          <button className="bg-[#00DA6B] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#1d9948] transition">
            Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  const handleMessageUs = async () => {
    if (!user) return;
    setMessaging(true);
    const summary = cart.map((item) => `${item.product.name} x${item.quantity}`).join("\n");
    const message = `Hi, I'd like to arrange payment for:\n${summary}\n\nTotal: ${formatNaira(total)}`;
    await sendMessage(message);
    setMessaging(false);
    setChatOpen(true);
  };

  const handlePaystackCheckout = async () => {
    if (!user) return;
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
              setCart([]);
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
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-20 py-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

      <div className="bg-[#001D23] rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Order Summary</h2>
        <div className="space-y-3 mb-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-300">
              <span>
                {item.product.name} x{item.quantity}
              </span>
              <span>{formatNaira(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xl font-bold border-t border-gray-700 pt-4">
          <span>Total</span>
          <span className="text-[#00DA6B]">{formatNaira(total)}</span>
        </div>
      </div>

      {payError && <p className="text-red-400 text-sm mb-4 text-center">{payError}</p>}

      <button
        onClick={handlePaystackCheckout}
        disabled={paying}
        className="w-full flex items-center justify-center gap-2 bg-[#00DA6B] text-black font-bold py-3 rounded-lg hover:bg-[#1d9948] transition mb-3 disabled:opacity-60"
      >
        {paying && <Loader2 size={18} className="animate-spin" />}
        {paying ? "Processing..." : "Pay with Paystack"}
      </button>

      <button
        onClick={handleMessageUs}
        disabled={messaging}
        className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition mb-3 disabled:opacity-60"
      >
        <MessageCircle size={18} />
        {messaging ? "Sending..." : "Message Us to Arrange Payment"}
      </button>

      <Link to="/cart">
        <button className="w-full bg-[#002a35] text-white font-bold py-3 rounded-lg hover:bg-[#003a45] transition border border-gray-600">
          Back to Cart
        </button>
      </Link>
    </div>
  );
}

export default Checkout;
