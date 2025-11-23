import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import profileImage from "../assets/profileImage.jpg";

export interface CartItem {
  id: number;
  product: {
    id: number;
    image: string;
    name: string;
    price: string;
    category: string;
    description?: string;
  };
  quantity: number;
}

interface HeaderProps {
  cart: CartItem[];
}

export default function Header({ cart = [] }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [dotColor, setDotColor] = useState("bg-green-500");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const formattedTime = `${displayHours}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;

      setCurrentTime(formattedTime);

      if (hours >= 0 && hours < 4) {
        setDotColor("bg-red-500");
      } else {
        setDotColor("bg-green-500");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isActiveRoute = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/latest", label: "Shop" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? "bg-[#001D23]/95 backdrop-blur-lg shadow-xl"
            : "bg-[#001D23]"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Active Status Indicator */}
            <motion.div
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14">
                <Link to='/about'>
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-[#00DA6B] shadow-lg"
                /></Link>
                {/* Status Dot */}
                <div
                  className={`absolute -top-0 -right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${dotColor} animate-pulse border-2 border-white shadow-lg`}
                ></div>
              </div>

              <p className="text-[10px] sm:text-xs font-semibold text-gray-300 hidden sm:block">
                {currentTime}
              </p>
            </motion.div>

            {/* Center: Desktop Navigation */}
            <motion.nav
              className="hidden md:flex space-x-8 lg:space-x-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {navLinks.map((link, ) => (
                <Link key={link.path} to={link.path}>
                  <motion.p
                    className={`cursor-pointer pb-1 hover:text-[#00DA6B] transition-colors text-base lg:text-lg font-medium relative ${
                      isActiveRoute(link.path) ? "text-[#00DA6B]" : "text-white"
                    }`}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.label}
                    {isActiveRoute(link.path) && (
                      <motion.span
                        className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#00DA6B]"
                        layoutId="underline"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.p>
                </Link>
              ))}
            </motion.nav>

            {/* Right: Cart & Menu */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {/* Shopping Cart */}
              <Link to="/cart" className="relative group">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="cursor-pointer hover:text-[#00DA6B] transition-colors"
                >
                  <ShoppingCart size={24} className="sm:w-6 sm:h-6" />
                  {cart.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                    >
                      {cart.length}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* Hamburger Menu (Mobile/Tablet) */}
              <motion.button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 hover:bg-[#002A35] rounded-lg transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                {menuOpen ? (
                  <X size={24} className="text-[#00DA6B]" />
                ) : (
                  <Menu size={24} className="text-[#00DA6B]" />
                )}
              </motion.button>
            </motion.div>
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
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
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
                  </motion.div>
                ))}

                {/* Time Display (Mobile Only) */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="pt-4 border-t border-[#00DA6B] border-opacity-20"
                >
                  <p className="text-center text-sm text-gray-400">
                    Current Time: <span className="text-[#00DA6B] font-semibold">{currentTime}</span>
                  </p>
                </motion.div>
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




