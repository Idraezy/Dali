import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ChevronLeft, Copy, Loader2, MapPin, Package, Truck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { formatNaira } from "../lib/format";
import {
  DELIVERY_LABELS,
  DELIVERY_STAGES,
  formatTrackingDate,
  formatTrackingTime,
} from "../lib/tracking";
import type { Order, OrderItem, TrackingEvent } from "../lib/types";

type ItemWithImage = OrderItem & { products: { image_url: string | null } | null };

const RECENT_EVENTS = 2;

function TrackOrder() {
  const { id } = useParams();
  const orderId = Number(id);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<ItemWithImage[]>([]);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).single(),
      supabase.from("order_items").select("*, products(image_url)").eq("order_id", orderId),
      supabase
        .from("order_tracking_events")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false }),
    ]).then(([{ data: orderRow }, { data: itemRows }, { data: eventRows }]) => {
      if (!active) return;
      setOrder((orderRow as Order) ?? null);
      setItems((itemRows ?? []) as ItemWithImage[]);
      setEvents((eventRows ?? []) as TrackingEvent[]);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [orderId]);

  const handleCopy = async () => {
    if (!order?.tracking_number) return;
    try {
      await navigator.clipboard.writeText(order.tracking_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — nothing useful to do.
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-gray-400">
        <Loader2 className="animate-spin" /> Loading tracking...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        We couldn't find this order.
        <Link to="/account" className="text-[#00DA6B] hover:underline">
          Back to my account
        </Link>
      </div>
    );
  }

  const cancelled = order.delivery_status === "cancelled";
  const currentStage = DELIVERY_STAGES.indexOf(order.delivery_status);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const visibleEvents = showAll ? events : events.slice(0, RECENT_EVENTS);

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 py-10 max-w-2xl mx-auto space-y-4">
      <Link to="/account" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white">
        <ChevronLeft size={16} /> My orders
      </Link>

      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Track order #{order.id}</h1>
        <span className="text-gray-400 text-sm">{formatNaira(order.total)}</span>
      </div>

      {order.status !== "paid" && (
        <p className="bg-[#001D23] border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-gray-300">
          {order.status === "failed"
            ? "Payment for this order failed, so it won't be shipped."
            : "We're waiting for payment to be confirmed before this order ships."}
        </p>
      )}

      {/* Delivery address */}
      <div className="bg-[#001D23] rounded-xl p-4 flex gap-3">
        <MapPin size={18} className="mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p>{order.shipping_address || "No delivery address on this order yet — message us to confirm it."}</p>
          {(order.shipping_name || order.shipping_phone) && (
            <p className="text-gray-400 mt-1">
              {[order.shipping_name, order.shipping_phone].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      <div className="bg-[#001D23] rounded-xl overflow-hidden">
        {/* Courier */}
        <div className="flex items-center gap-3 p-4">
          <div className="w-11 h-9 rounded-md bg-[#002A35] flex items-center justify-center">
            <Truck size={20} className="text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold">{order.courier || "Courier to be assigned"}</p>
            {order.tracking_number ? (
              <button onClick={handleCopy} className="flex items-center gap-2 text-sm text-gray-300" title="Copy tracking number">
                {order.tracking_number}
                {copied ? <Check size={14} className="text-[#00DA6B]" /> : <Copy size={14} className="text-gray-400" />}
              </button>
            ) : (
              <p className="text-sm text-gray-400">Tracking number added once shipped</p>
            )}
          </div>
        </div>

        {/* Status + progress */}
        <div className={`px-4 py-5 ${cancelled ? "bg-red-500/10" : "bg-[#00DA6B]/10"}`}>
          <p className="font-bold text-lg">{DELIVERY_LABELS[order.delivery_status]}</p>
          {order.delivery_status === "delivered" && order.delivered_at && (
            <p className="text-sm text-gray-400 mt-1">
              On{" "}
              <span className="font-bold text-[#00DA6B]">
                {new Date(order.delivered_at).toLocaleDateString("en-NG", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </span>
            </p>
          )}

          {!cancelled && (
            <ol className="grid grid-cols-5 gap-1 mt-5 pt-4 border-t border-dashed border-[#00DA6B]/30">
              {DELIVERY_STAGES.map((stage, i) => {
                const done = i <= currentStage;
                return (
                  <li key={stage} className="flex flex-col items-center gap-2 text-center">
                    <div className="flex items-center w-full">
                      <span className={`h-0.5 flex-1 ${i === 0 ? "invisible" : done ? "bg-[#00DA6B]" : "bg-gray-700"}`} />
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          done ? "bg-[#00DA6B] text-[#001D23]" : "border border-gray-600"
                        }`}
                      >
                        {done && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span
                        className={`h-0.5 flex-1 ${
                          i === DELIVERY_STAGES.length - 1 ? "invisible" : i < currentStage ? "bg-[#00DA6B]" : "bg-gray-700"
                        }`}
                      />
                    </div>
                    <span className={`text-[11px] sm:text-xs leading-tight ${done ? "text-[#00DA6B]" : "text-gray-500"}`}>
                      {DELIVERY_LABELS[stage]}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Timeline */}
        <div className="p-4">
          {events.length === 0 ? (
            <p className="text-sm text-gray-400">No updates yet.</p>
          ) : (
            <>
              <ol>
                {visibleEvents.map((event, i) => {
                  const highlight = i === 0;
                  return (
                    <li key={event.id} className="grid grid-cols-[56px_24px_1fr] gap-x-2">
                      <div className="text-right pt-0.5">
                        <p className={`text-sm ${highlight ? "text-[#00DA6B]" : "text-gray-400"}`}>
                          {formatTrackingDate(event.created_at)}
                        </p>
                        <p className="text-xs text-gray-500">{formatTrackingTime(event.created_at)}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className={`mt-1.5 rounded-full flex-shrink-0 ${highlight ? "w-3 h-3 bg-[#00DA6B]" : "w-2.5 h-2.5 bg-gray-600"}`} />
                        <span className="w-px flex-1 bg-gray-700" />
                      </div>
                      <p className={`text-sm pb-5 ${highlight ? "text-white" : "text-gray-400"}`}>
                        {event.location && <span className="font-semibold">{event.location} — </span>}
                        {event.message}
                      </p>
                    </li>
                  );
                })}
              </ol>
              {events.length > RECENT_EVENTS && (
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="text-sm text-gray-400 hover:text-white pl-[82px]"
                >
                  {showAll ? "Hide details" : "More logistics details ›"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="bg-[#001D23] rounded-xl p-4">
        <h2 className="font-bold">
          Products ({itemCount} {itemCount === 1 ? "item" : "items"})
        </h2>
        <div className="flex flex-wrap gap-3 mt-3">
          {items.map((item) => (
            <div key={item.id} className="relative w-24 h-28 rounded-lg overflow-hidden bg-[#002A35]">
              {item.products?.image_url ? (
                <img src={item.products.image_url} alt={item.product_name} className="w-full h-full object-cover" />
              ) : (
                <Package size={30} className="text-gray-500 m-auto mt-10" />
              )}
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 text-gray-900 text-xs font-bold rounded-full min-w-8 h-8 px-2 whitespace-nowrap flex items-center justify-center">
                {item.size && `${item.size} · `}x{item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrackOrder;
