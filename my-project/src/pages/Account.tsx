import { useEffect, useState, type FormEvent } from "react";
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

type Tab = "profile" | "orders";

function ProfileTab() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    subscribed_to_updates: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      subscribed_to_updates: profile.subscribed_to_updates,
    });
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        subscribed_to_updates: form.subscribed_to_updates,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <p className="text-gray-400">{user?.email}</p>
        <button
          onClick={() => signOut()}
          className="bg-[#002a35] text-white font-bold px-6 py-2 rounded-lg hover:bg-[#003a45] transition border border-gray-600"
        >
          Log Out
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#001D23] rounded-xl p-6 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-semibold mb-1">Full Name</label>
          <input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B]"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B]"
            placeholder="+234..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Delivery Address</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B] resize-none h-20"
            placeholder="Street, city, state"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.subscribed_to_updates}
            onChange={(e) => setForm({ ...form, subscribed_to_updates: e.target.checked })}
            className="accent-[#00DA6B]"
          />
          Subscribe to updates (get notified in-app about new products)
        </label>

        {saved && <p className="text-[#00DA6B] text-sm">Profile updated.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#00DA6B] text-black font-bold py-3 rounded-lg hover:bg-[#1d9948] transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

function OrdersTab() {
  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-10">
        <Loader2 className="animate-spin" /> Loading your orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#001D23] rounded-xl">
        <Package size={40} className="text-gray-500 mb-4" />
        <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
        <Link to="/latest">
          <button className="bg-[#00DA6B] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#1d9948] transition">
            Start Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
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
  );
}

function Account() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-20 py-10">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="flex gap-2 mb-8 border-b border-gray-700">
        {(["profile", "orders"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 font-semibold capitalize border-b-2 transition ${
              tab === t
                ? "border-[#00DA6B] text-[#00DA6B]"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "profile" ? <ProfileTab /> : <OrdersTab />}
    </div>
  );
}

export default Account;
