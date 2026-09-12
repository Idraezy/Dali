import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useAuth } from "../../lib/useAuth";
import { useUnreadAdminMessages } from "../../lib/useUnreadAdminMessages";
import AdminDashboard from "./AdminDashboard";
import AdminProducts from "./AdminProducts";
import AdminMessages from "./AdminMessages";
import AdminUsers from "./AdminUsers";
import AdminAnalytics from "./AdminAnalytics";
import AdminSettings from "./AdminSettings";

export type AdminTab = "dashboard" | "products" | "messages" | "users" | "analytics" | "settings";

const NAV: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "users", label: "Users", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const TITLES: Record<AdminTab, string> = {
  dashboard: "Dashboard",
  products: "Products",
  messages: "Messages",
  users: "Users",
  analytics: "Analytics",
  settings: "Settings",
};

function Admin() {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, signOut } = useAuth();
  const unread = useUnreadAdminMessages();

  const selectTab = (t: AdminTab) => {
    setTab(t);
    setMobileNavOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="px-6 py-6 border-b border-gray-800">
        <p className="text-xl font-extrabold text-[#00DA6B]">DALI WEARS</p>
        <p className="text-xs text-gray-500">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => selectTab(id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              tab === id ? "bg-[#00DA6B] text-[#001D23]" : "text-gray-300 hover:bg-[#002A35]"
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon size={18} />
              {label}
            </span>
            {id === "messages" && unread > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-[#002A35] transition"
        >
          <ExternalLink size={18} /> View Public Site
        </Link>
        <p className="px-3 text-xs text-gray-500 truncate">{user?.email}</p>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-[#002A35] transition"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex text-white bg-[#001218]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-[#001D23] border-r border-gray-800 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-[#001D23] flex flex-col">{sidebarContent}</div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="md:hidden p-2 hover:bg-[#002A35] rounded-lg"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">{TITLES[tab]}</h1>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString("en-NG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => selectTab("messages")}
              className="relative p-2 hover:bg-[#002A35] rounded-lg transition"
              title="Messages"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            <Link to="/">
              <button className="text-sm border border-gray-700 px-4 py-2 rounded-lg hover:bg-[#002A35] transition">
                View Site
              </button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === "dashboard" && <AdminDashboard onNavigate={selectTab} />}
          {tab === "products" && <AdminProducts />}
          {tab === "messages" && <AdminMessages />}
          {tab === "users" && <AdminUsers />}
          {tab === "analytics" && <AdminAnalytics />}
          {tab === "settings" && <AdminSettings />}
        </main>
      </div>
    </div>
  );
}

export default Admin;
