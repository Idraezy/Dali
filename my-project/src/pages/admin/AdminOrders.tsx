import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { formatNaira } from "../../lib/format";
import type { Order, OrderItem, OrderStatus } from "../../lib/types";

interface OrderRow extends Order {
  items: OrderItem[];
  customerEmail: string;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  paid: "bg-[#00DA6B]/20 text-[#00DA6B]",
  pending: "bg-yellow-500/20 text-yellow-400",
  failed: "bg-red-500/20 text-red-400",
};

const STATUS_FILTERS: Array<OrderStatus | "all"> = ["all", "paid", "pending", "failed"];

function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      const { data: orderRows } = await supabase
        .from("orders")
        .select("*, profiles(email)")
        .order("created_at", { ascending: false });

      const rows: OrderRow[] = [];
      for (const row of (orderRows ?? []) as Array<Order & { profiles: { email: string } | null }>) {
        const { data: itemRows } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", row.id);
        rows.push({
          ...row,
          items: (itemRows ?? []) as OrderItem[],
          customerEmail: row.profiles?.email ?? "Unknown",
        });
      }

      if (active) {
        setOrders(rows);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const filtered = orders.filter((o) => statusFilter === "all" || o.status === statusFilter);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Orders ({orders.length})</h2>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${
                statusFilter === status
                  ? "bg-[#00DA6B] text-black"
                  : "bg-[#001D23] text-white hover:bg-[#002a35]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 py-10">
          <Loader2 className="animate-spin" /> Loading orders...
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 py-10">No orders in this category yet.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="bg-[#001D23] rounded-xl p-4 md:p-6">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <div>
                  <p className="font-bold">Order #{order.id}</p>
                  <p className="text-gray-400 text-sm">{order.customerEmail}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(order.created_at).toLocaleString("en-NG")}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-1 mb-4">
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
      )}
    </div>
  );
}

export default AdminOrders;
