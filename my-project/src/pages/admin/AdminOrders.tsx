import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { formatNaira } from "../../lib/format";
import { DELIVERY_LABELS, formatTrackingDate, formatTrackingTime } from "../../lib/tracking";
import type { DeliveryStatus, Order, OrderItem, OrderStatus, TrackingEvent } from "../../lib/types";

interface OrderRow extends Order {
  items: OrderItem[];
  events: TrackingEvent[];
  customerEmail: string;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  paid: "bg-[#00DA6B]/20 text-[#00DA6B]",
  pending: "bg-yellow-500/20 text-yellow-400",
  failed: "bg-red-500/20 text-red-400",
};

const INPUT_CLASS =
  "w-full bg-[#002A35] p-2.5 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00DA6B]";

type Filter = "to_ship" | "delivered" | "awaiting_payment" | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "to_ship", label: "To ship" },
  { value: "delivered", label: "Delivered" },
  { value: "awaiting_payment", label: "Awaiting payment" },
  { value: "all", label: "All" },
];

function matchesFilter(order: Order, filter: Filter) {
  switch (filter) {
    case "to_ship":
      return order.status === "paid" && !["delivered", "cancelled"].includes(order.delivery_status);
    case "delivered":
      return order.delivery_status === "delivered";
    case "awaiting_payment":
      return order.status === "pending";
    default:
      return true;
  }
}

function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("to_ship");

  const load = useCallback(async () => {
    const { data: orderRows } = await supabase
      .from("orders")
      .select("*, profiles(email)")
      .order("created_at", { ascending: false });
    const rows = (orderRows ?? []) as Array<Order & { profiles: { email: string } | null }>;
    const ids = rows.map((o) => o.id);

    const [{ data: itemRows }, { data: eventRows }] = ids.length
      ? await Promise.all([
          supabase.from("order_items").select("*").in("order_id", ids),
          supabase
            .from("order_tracking_events")
            .select("*")
            .in("order_id", ids)
            .order("created_at", { ascending: false }),
        ])
      : [{ data: [] }, { data: [] }];

    const items = (itemRows ?? []) as OrderItem[];
    const events = (eventRows ?? []) as TrackingEvent[];
    setOrders(
      rows.map((row) => ({
        ...row,
        items: items.filter((i) => i.order_id === row.id),
        events: events.filter((e) => e.order_id === row.id),
        customerEmail: row.profiles?.email ?? "Unknown",
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-10">
        <Loader2 className="animate-spin" /> Loading orders...
      </div>
    );
  }

  const filtered = orders.filter((o) => matchesFilter(o, filter));

  return (
    <div>
      <p className="text-gray-400 text-sm mb-6 max-w-xl">
        Move orders through delivery and post tracking updates — customers see every update on their
        tracking page in the website and app. Coins are paid automatically once an order is both paid
        and delivered.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              filter === value ? "bg-[#00DA6B] text-[#001D23]" : "bg-[#001D23] text-gray-300 hover:bg-[#002A35]"
            }`}
          >
            {label} ({orders.filter((o) => matchesFilter(o, value)).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 py-16">No orders here.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onChanged }: { order: OrderRow; onChanged: () => Promise<void> }) {
  const [delivery, setDelivery] = useState({
    delivery_status: order.delivery_status,
    courier: order.courier ?? "",
    tracking_number: order.tracking_number ?? "",
  });
  const [update, setUpdate] = useState({ message: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);

  const saveDelivery = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("orders")
      .update({
        delivery_status: delivery.delivery_status,
        courier: delivery.courier.trim() || null,
        tracking_number: delivery.tracking_number.trim() || null,
      })
      .eq("id", order.id);
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    await onChanged();
  };

  const markPaid = async () => {
    if (!confirm(`Mark order #${order.id} as paid? Only do this once you've received the money.`)) return;
    const { error } = await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);
    if (error) {
      alert(error.message);
      return;
    }
    await onChanged();
  };

  const postUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!update.message.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("order_tracking_events").insert({
      order_id: order.id,
      stage: order.delivery_status,
      message: update.message.trim(),
      location: update.location.trim() || null,
    });
    setPosting(false);
    if (error) {
      alert(error.message);
      return;
    }
    setUpdate({ message: "", location: "" });
    await onChanged();
  };

  return (
    <div className="bg-[#001D23] rounded-xl p-4 md:p-6">
      <div className="flex flex-wrap justify-between items-start gap-2">
        <div>
          <p className="font-bold">Order #{order.id}</p>
          <p className="text-gray-400 text-sm">{order.customerEmail}</p>
          <p className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleString("en-NG")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${STATUS_STYLES[order.status]}`}>
            {order.status}
          </span>
          {order.status === "pending" && (
            <button
              onClick={markPaid}
              className="text-xs border border-gray-600 px-3 py-1 rounded-full hover:bg-[#002A35] transition"
            >
              Mark as paid
            </button>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <p className="font-semibold">Deliver to</p>
          <p className="text-gray-400 mt-1">
            {order.shipping_address || "No address on file"}
            {(order.shipping_name || order.shipping_phone) && (
              <>
                <br />
                {[order.shipping_name, order.shipping_phone].filter(Boolean).join(" · ")}
              </>
            )}
          </p>
        </div>
        <div>
          <p className="font-semibold">Items</p>
          <div className="text-gray-400 mt-1 space-y-0.5">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2">
                <span>
                  {item.product_name}
                  {item.size && ` (Size ${item.size})`} x{item.quantity}
                </span>
                <span>{formatNaira(item.product_price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-gray-700 pt-1 font-bold text-white">
              <span>Total</span>
              <span className="text-[#00DA6B]">{formatNaira(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={saveDelivery} className="grid sm:grid-cols-4 gap-3 sm:items-end mt-6 pt-4 border-t border-gray-800">
        <div>
          <label className="block text-xs font-semibold mb-1">Delivery stage</label>
          <select
            value={delivery.delivery_status}
            onChange={(e) => setDelivery({ ...delivery, delivery_status: e.target.value as DeliveryStatus })}
            className={INPUT_CLASS}
          >
            {(Object.keys(DELIVERY_LABELS) as DeliveryStatus[]).map((stage) => (
              <option key={stage} value={stage}>
                {DELIVERY_LABELS[stage]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Courier</label>
          <input
            value={delivery.courier}
            onChange={(e) => setDelivery({ ...delivery, courier: e.target.value })}
            placeholder="e.g. GIG Logistics"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Tracking number</label>
          <input
            value={delivery.tracking_number}
            onChange={(e) => setDelivery({ ...delivery, tracking_number: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-[#00DA6B] text-black font-bold py-2.5 rounded-lg hover:bg-[#1d9948] transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save delivery"}
        </button>
      </form>

      <form onSubmit={postUpdate} className="grid sm:grid-cols-4 gap-3 sm:items-end mt-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold mb-1">Add tracking update</label>
          <input
            value={update.message}
            onChange={(e) => setUpdate({ ...update, message: e.target.value })}
            placeholder="e.g. Arrived at hub"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Location (optional)</label>
          <input
            value={update.location}
            onChange={(e) => setUpdate({ ...update, location: e.target.value })}
            placeholder="e.g. Uyo Branch"
            className={INPUT_CLASS}
          />
        </div>
        <button
          type="submit"
          disabled={posting || !update.message.trim()}
          className="border border-[#00DA6B] text-[#00DA6B] font-bold py-2.5 rounded-lg hover:bg-[#00DA6B]/10 transition disabled:opacity-50"
        >
          {posting ? "Posting..." : "Post update"}
        </button>
      </form>

      {order.events.length > 0 && (
        <ol className="mt-4 pt-4 border-t border-gray-800 space-y-1 text-sm">
          {order.events.map((event) => (
            <li key={event.id} className="flex gap-3 text-gray-400">
              <span className="w-24 flex-shrink-0 tabular-nums">
                {formatTrackingDate(event.created_at)} {formatTrackingTime(event.created_at)}
              </span>
              <span>
                {event.location && <span className="text-white">{event.location} — </span>}
                {event.message}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default AdminOrders;
