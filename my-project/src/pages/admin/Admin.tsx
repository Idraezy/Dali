import { useState } from "react";
import { LayoutDashboard, Package, ShoppingBag } from "lucide-react";
import AdminOverview from "./AdminOverview";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";

type Tab = "overview" | "products" | "orders";

const TABS: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
];

function Admin() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-10 py-10">
      <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-400 mb-8">Manage your products, orders, and store performance.</p>

      <div className="flex gap-2 mb-8 border-b border-gray-700 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap border-b-2 transition ${
              tab === id
                ? "border-[#00DA6B] text-[#00DA6B]"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && <AdminOverview />}
      {tab === "products" && <AdminProducts />}
      {tab === "orders" && <AdminOrders />}
    </div>
  );
}

export default Admin;
