import { useEffect, useState } from "react";
import { Plus, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { formatNaira } from "../../lib/format";
import { useUnreadAdminMessages } from "../../lib/useUnreadAdminMessages";
import type { AdminTab } from "./Admin";
import type { Product } from "../../lib/types";

interface Stats {
  products: number;
  orders: number;
  customers: number;
  revenue: number;
}

interface RecentMessage {
  id: number;
  user_id: string;
  body: string;
  created_at: string;
  sender: string;
  profiles: { email: string; full_name: string | null } | null;
}

interface AdminDashboardProps {
  onNavigate: (tab: AdminTab) => void;
}

function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const unread = useUnreadAdminMessages();

  useEffect(() => {
    let active = true;

    (async () => {
      const [productCount, orderCount, customerCount, paidOrders, products, messages] =
        await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("total").eq("status", "paid"),
          supabase.from("products").select("*").order("created_at", { ascending: false }).limit(5),
          supabase
            .from("messages")
            .select("*, profiles(email, full_name)")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

      if (!active) return;

      const revenue = (paidOrders.data ?? []).reduce(
        (sum, o) => sum + Number((o as { total: number }).total),
        0
      );

      setStats({
        products: productCount.count ?? 0,
        orders: orderCount.count ?? 0,
        customers: customerCount.count ?? 0,
        revenue,
      });
      setRecentProducts((products.data ?? []) as Product[]);
      setRecentMessages((messages.data ?? []) as RecentMessage[]);
    })();

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: "Products", value: stats?.products ?? "—" },
    { label: "Orders", value: stats?.orders ?? "—" },
    { label: "Customers", value: stats?.customers ?? "—" },
    { label: "Unread Messages", value: unread },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[#001D23] p-5 rounded-xl border border-[#00DA6B] border-opacity-20"
          >
            <p className="text-2xl font-bold text-[#00DA6B] mb-1">{card.value}</p>
            <p className="text-gray-400 text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      {stats && (
        <p className="text-gray-400 text-sm mb-6">
          Total paid revenue: <span className="text-[#00DA6B] font-bold">{formatNaira(stats.revenue)}</span>
        </p>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => onNavigate("products")}
          className="flex items-center gap-2 bg-[#00DA6B] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#1d9948] transition"
        >
          <Plus size={16} /> Add Product
        </button>
        <button
          onClick={() => onNavigate("messages")}
          className="flex items-center gap-2 bg-[#001D23] border border-gray-700 px-4 py-2 rounded-lg hover:bg-[#002A35] transition"
        >
          <MessageSquare size={16} /> Messages
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent products */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Recent Products</h3>
            <button onClick={() => onNavigate("products")} className="text-sm text-[#00DA6B] hover:underline">
              View all
            </button>
          </div>
          {recentProducts.length === 0 ? (
            <p className="text-gray-400 text-sm">No products yet.</p>
          ) : (
            <div className="bg-[#001D23] rounded-xl overflow-hidden">
              {recentProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                  <p className="text-sm text-[#00DA6B] font-bold">{formatNaira(p.price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Recent Messages</h3>
            <button onClick={() => onNavigate("messages")} className="text-sm text-[#00DA6B] hover:underline">
              View all
            </button>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-gray-400 text-sm">No messages yet.</p>
          ) : (
            <div className="bg-[#001D23] rounded-xl overflow-hidden">
              {recentMessages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onNavigate("messages")}
                  className="w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-800 last:border-0 hover:bg-[#002A35] transition"
                >
                  <div className="w-8 h-8 rounded-full bg-[#00DA6B] text-[#001D23] font-bold flex items-center justify-center flex-shrink-0 text-sm">
                    {(m.profiles?.full_name || m.profiles?.email || "?")[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {m.profiles?.full_name || m.profiles?.email || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{m.body}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!stats && (
        <div className="flex items-center gap-2 text-gray-400 py-10">
          <Loader2 className="animate-spin" /> Loading dashboard...
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
