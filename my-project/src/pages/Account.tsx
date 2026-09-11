import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Package } from "lucide-react";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabaseClient";
import { formatNaira } from "../lib/format";
import type { Order, OrderItem, OrderStatus } from "../lib/types";

interface OrderWithItems extends Order {
  items: OrderItem[];
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  paid: "bg-[#00DA6B]/20 text-[#00DA6B]",
  pending: "bg-yellow-500/20 text-yellow-400",
  failed: "bg-red-500/20 text-red-400",
};

function Account() {
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
      setLoading(true);
      const { data: orderRows } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const ordersWithItems: OrderWithItems[] = [];
      for (const order of (orderRows ?? []) as Order[]) {
        const { data: itemRows } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);
        ordersWithItems.push({ ...order, items: (itemRows ?? []) as OrderItem[] });
      }

      if (active) {
        setOrders(ordersWithItems);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-20 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Account</h1>
          <p className="text-gray-400">{user?.email}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-[#002a35] text-white font-bold px-6 py-2 rounded-lg hover:bg-[#003a45] transition border border-gray-600"
        >
          Log Out
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6">Order History</h2>

      {loading && (
        <div className="flex items-center gap-2 text-gray-400 py-10">
          <Loader2 className="animate-spin" /> Loading your orders...
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-[#001D23] rounded-xl">
          <Package size={40} className="text-gray-500 mb-4" />
          <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
          <Link to="/latest">
            <button className="bg-[#00DA6B] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#1d9948] transition">
              Start Shopping
            </button>
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-[#001D23] rounded-xl p-4 md:p-6">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <div>
                <p className="font-bold">Order #{order.id}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(order.created_at).toLocaleString("en-NG")}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${STATUS_STYLES[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-300">
                  <span>
                    {item.product_name} x{item.quantity}
                  </span>
                  <span>{formatNaira(item.product_price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold border-t border-gray-700 pt-3">
              <span>Total</span>
              <span className="text-[#00DA6B]">{formatNaira(order.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Account;
