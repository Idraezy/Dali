import { useEffect, useRef, useState } from "react";
import {
  ShoppingCart,
  Menu,
  X,
  Heart,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../lib/useAuth";
import { useCategories } from "../lib/useCategories";
import { useWishlist } from "../lib/useWishlist";
import { useAnnouncements } from "../lib/useAnnouncements";
import { useClickOutside } from "../lib/useClickOutside";
import type { CartItem } from "../lib/types";

interface HeaderProps {
  cart: CartItem[];
}

export default function Header({ cart = [] }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const categories = useCategories();
  const { productIds: wishlistIds } = useWishlist();
  const { announcements, unreadCount, markSeen } = useAnnouncements();

  const shopRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useClickOutside(shopRef, () => setShopOpen(false));
  useClickOutside(bellRef, () => setBellOpen(false));
  useClickOutside(avatarRef, () => setAvatarOpen(false));

  const handleLogout = async () => {
    await signOut();
    setMenuOpen(false);
    setAvatarOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActiveRoute = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
    { path: "/faq", label: "FAQ" },
  ];

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";
  const showBell = Boolean(user && profile?.subscribed_to_updates);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
          isScrolled ? "bg-[#001D23]/95 backdrop-blur-lg shadow-xl" : "bg-[#001D23]"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Wordmark */}
            <Link to="/" className="flex-shrink-0">
              <span className="text-xl sm:text-2xl font-extrabold text-[#00DA6B] tracking-tight">
                DALI WEARS
              </span>
            </Link>

            {/* Center: Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link to="/">
                <p
                  className={`cursor-pointer pb-1 hover:text-[#00DA6B] transition-colors text-base font-medium relative ${
                    isActiveRoute("/") ? "text-[#00DA6B]" : "text-white"
                  }`}
                >
                  Home
                  {isActiveRoute("/") && (
                    <motion.span
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#00DA6B]"
                      layoutId="underline"
                    />
                  )}
                </p>
              </Link>

              {/* Shop dropdown */}
              <div className="relative" ref={shopRef}>
                <button
                  onClick={() => setShopOpen((v) => !v)}
                  className={`flex items-center gap-1 cursor-pointer hover:text-[#00DA6B] transition-colors text-base font-medium ${
                    isActiveRoute("/latest") ? "text-[#00DA6B]" : "text-white"
                  }`}
                >
                  Shop
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${shopOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {shopOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-3 w-56 bg-[#002A35] border border-[#00DA6B]/20 rounded-xl shadow-2xl overflow-hidden py-2"
                    >
                      <Link
                        to="/latest"
                        onClick={() => setShopOpen(false)}
                        className="block px-4 py-2 text-sm text-white hover:bg-[#001D23] hover:text-[#00DA6B] transition"
                      >
                        All Products
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat}
                          to={`/latest?category=${encodeURIComponent(cat)}`}
                          onClick={() => setShopOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#001D23] hover:text-[#00DA6B] transition"
                        >
                          {cat}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}>
                  <p
                    className={`cursor-pointer pb-1 hover:text-[#00DA6B] transition-colors text-base font-medium relative ${
                      isActiveRoute(link.path) ? "text-[#00DA6B]" : "text-white"
                    }`}
                  >
                    {link.label}
                    {isActiveRoute(link.path) && (
                      <motion.span
                        className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#00DA6B]"
                        layoutId="underline"
                      />
                    )}
                  </p>
                </Link>
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Wishlist */}
              {user && (
                <Link to="/wishlist" className="relative hidden sm:block">
                  <div className="cursor-pointer hover:text-[#00DA6B] transition-colors" title="Wishlist">
                    <Heart size={22} className={wishlistIds.size > 0 ? "fill-[#00DA6B] text-[#00DA6B]" : ""} />
                    {wishlistIds.size > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#00DA6B] text-[#001D23] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {wishlistIds.size}
                      </span>
                    )}
                  </div>
                </Link>
              )}

              {/* Notification bell */}
              {showBell && (
                <div className="relative hidden sm:block" ref={bellRef}>
                  <button
                    onClick={() => {
                      const next = !bellOpen;
                      setBellOpen(next);
                      if (next) markSeen();
                    }}
                    className="cursor-pointer hover:text-[#00DA6B] transition-colors"
                    title="Notifications"
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {bellOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-72 bg-[#002A35] border border-[#00DA6B]/20 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-700 font-semibold text-sm">
                          Updates
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {announcements.length === 0 ? (
                            <p className="px-4 py-6 text-sm text-gray-400 text-center">
                              No updates yet.
                            </p>
                          ) : (
                            announcements.map((a) => (
                              <div
                                key={a.id}
                                className="px-4 py-3 border-b border-gray-800 text-sm text-gray-300"
                              >
                                {a.message}
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(a.created_at).toLocaleDateString("en-NG")}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                        <Link
                          to="/notifications"
                          onClick={() => setBellOpen(false)}
                          className="block px-4 py-3 text-center text-sm text-[#00DA6B] hover:bg-[#001D23] border-t border-gray-700 transition"
                        >
                          View all
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Avatar / auth */}
              {user ? (
                <div className="relative hidden sm:block" ref={avatarRef}>
                  <button
                    onClick={() => setAvatarOpen((v) => !v)}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <span className="w-9 h-9 rounded-lg bg-[#00DA6B] text-[#001D23] font-bold flex items-center justify-center">
                      {initial}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform ${avatarOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {avatarOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 bg-[#002A35] border border-[#00DA6B]/20 rounded-xl shadow-2xl overflow-hidden py-2"
                      >
                        <div className="px-4 py-3 border-b border-gray-700">
                          <p className="text-sm text-white truncate">{user.email}</p>
                          {profile?.is_admin && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#00DA6B] text-[#001D23]">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <Link
                          to="/account"
                          onClick={() => setAvatarOpen(false)}
                          className="block px-4 py-2 text-sm text-white hover:bg-[#001D23] hover:text-[#00DA6B] transition"
                        >
                          My Account
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setAvatarOpen(false)}
                          className="block px-4 py-2 text-sm text-white hover:bg-[#001D23] hover:text-[#00DA6B] transition"
                        >
                          My Wishlist
                        </Link>
                        {profile?.is_admin && (
                          <Link
                            to="/admin"
                            onClick={() => setAvatarOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-[#001D23] hover:text-[#00DA6B] transition"
                          >
                            <LayoutDashboard size={16} />
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[#001D23] transition text-left"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-semibold text-white hover:text-[#00DA6B] transition"
                >
                  Log In
                </Link>
              )}

              {/* Shop pill button */}
              <Link to="/latest" className="hidden sm:block">
                <button className="bg-[#00DA6B] px-5 py-2 rounded-full text-[#001D23] font-bold text-sm hover:bg-[#00FF7F] transition">
                  Shop
                </button>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <div className="cursor-pointer hover:text-[#00DA6B] transition-colors">
                  <ShoppingCart size={22} />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </div>
              </Link>

              {/* Hamburger Menu (Mobile/Tablet) */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 hover:bg-[#002A35] rounded-lg transition-colors"
              >
                {menuOpen ? (
                  <X size={22} className="text-[#00DA6B]" />
                ) : (
                  <Menu size={22} className="text-[#00DA6B]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden bg-[#002A35] border-t border-[#00DA6B] border-opacity-20 overflow-hidden"
            >
              <nav className="px-4 py-6 space-y-4">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className={`block py-3 px-4 rounded-lg transition-all ${
                    isActiveRoute("/")
                      ? "bg-[#00DA6B] text-[#001E23] font-bold"
                      : "text-gray-300 hover:bg-[#001D23] hover:text-[#00DA6B]"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/latest"
                  onClick={() => setMenuOpen(false)}
                  className={`block py-3 px-4 rounded-lg transition-all ${
                    isActiveRoute("/latest")
                      ? "bg-[#00DA6B] text-[#001E23] font-bold"
                      : "text-gray-300 hover:bg-[#001D23] hover:text-[#00DA6B]"
                  }`}
                >
                  Shop
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className={`block py-3 px-4 rounded-lg transition-all ${
                      isActiveRoute(link.path)
                        ? "bg-[#00DA6B] text-[#001E23] font-bold"
                        : "text-gray-300 hover:bg-[#001D23] hover:text-[#00DA6B]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-2 border-t border-[#00DA6B] border-opacity-20 space-y-2">
                  {user ? (
                    <>
                      {profile?.is_admin && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="block py-3 px-4 rounded-lg text-gray-300 hover:bg-[#001D23] hover:text-[#00DA6B] transition-all"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="block py-3 px-4 rounded-lg text-gray-300 hover:bg-[#001D23] hover:text-[#00DA6B] transition-all"
                      >
                        My Wishlist
                      </Link>
                      <Link
                        to="/account"
                        onClick={() => setMenuOpen(false)}
                        className="block py-3 px-4 rounded-lg text-gray-300 hover:bg-[#001D23] hover:text-[#00DA6B] transition-all"
                      >
                        My Account
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left py-3 px-4 rounded-lg text-gray-300 hover:bg-[#001D23] hover:text-[#00DA6B] transition-all"
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 px-4 rounded-lg text-gray-300 hover:bg-[#001D23] hover:text-[#00DA6B] transition-all"
                    >
                      Log In
                    </Link>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer */}
      <div className="h-16 sm:h-20 md:h-20"></div>
    </>
  );
}
