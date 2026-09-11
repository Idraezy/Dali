import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { formatNaira } from "../../lib/format";

interface Stats {
  products: number;
  orders: number;
  pendingOrders: number;
  customers: number;
  revenue: number;
}

function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const [productCount, orderCount, pendingCount, customerCount, paidOrders] =
        await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("total").eq("status", "paid"),
        ]);

      const revenue = (paidOrders.data ?? []).reduce(
        (sum, o) => sum + Number((o as { total: number }).total),
        0
      );

      if (!active) return;
      setStats({
        products: productCount.count ?? 0,
        orders: orderCount.count ?? 0,
        pendingOrders: pendingCount.count ?? 0,
        customers: customerCount.count ?? 0,
        revenue,
      });
    })();

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: "Total Revenue (Paid)", value: stats ? formatNaira(stats.revenue) : "—" },
    { label: "Total Orders", value: stats?.orders ?? "—" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? "—" },
    { label: "Products", value: stats?.products ?? "—" },
    { label: "Customers", value: stats?.customers ?? "—" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-[#001D23] p-6 rounded-xl border border-[#00DA6B] border-opacity-20 hover:border-opacity-100 transition-all duration-300"
          >
            <p className="text-2xl font-bold text-[#00DA6B] mb-1">{card.value}</p>
            <p className="text-gray-400 text-sm">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminOverview;
