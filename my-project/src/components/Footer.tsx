import { useState } from "react";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  const handleSubscribe = () => {
    if (!email.trim()) {
      setError("Email is required");
      setNotification("");
      return;
    }
    setError("");
    setNotification("✅Thank you for your message! I'll get back to you soon.");
    setEmail("");
    setTimeout(() => setNotification(""), 3000); // Hide after 3s
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true },
  };

  return (
    <footer className="bg-[#001E23] text-white mt-20 border-t border-[#00DA6B] border-opacity-20">
      {/* Main Footer Content */}
      <div className="px-4 sm:px-6 lg:px-20 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <motion.div {...fadeInUp} className="space-y-4">
            <h3 className="text-3xl font-bold text-[#00DA6B]">DALI WEARS</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Crafting style and creating experiences. Your destination for quality fashion and timeless elegance.
            </p>
            {/* Social Media */}
            <div className="flex gap-4 pt-2">
              <motion.a
                href="https://instagram.com/dali_wears"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#002A35] p-2 rounded-full hover:bg-[#00DA6B] hover:text-[#001E23] transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a
                href="https://facebook.com/daliwears"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#002A35] p-2 rounded-full hover:bg-[#00DA6B] hover:text-[#001E23] transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                href="https://twitter.com/daliwears"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#002A35] p-2 rounded-full hover:bg-[#00DA6B] hover:text-[#001E23] transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter size={20} />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
            <h4 className="text-lg font-bold mb-4 text-[#00DA6B]">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-[#00DA6B] transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/latest" className="text-gray-400 hover:text-[#00DA6B] transition-colors text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-[#00DA6B] transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-[#00DA6B] transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-[#00DA6B] transition-colors text-sm">
                  Cart
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Product Categories */}
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
            <h4 className="text-lg font-bold mb-4 text-[#00DA6B]">Categories</h4>
            <ul className="space-y-3">
              <li className="text-gray-400 text-sm">Basic Tops</li>
              <li className="text-gray-400 text-sm">Pin-Down Tops</li>
              <li className="text-gray-400 text-sm">Backless Tops</li>
              <li className="text-gray-400 text-sm">Maxi Gowns</li>
              <li className="text-gray-400 text-sm">Pinterest Frames</li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
            <h4 className="text-lg font-bold mb-4 text-[#00DA6B]">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail size={16} className="text-[#00DA6B] flex-shrink-0" />
                <span>faithlawrence161@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone size={16} className="text-[#00DA6B] flex-shrink-0" />
                <span>+234 (0)916 428 8560</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin size={16} className="text-[#00DA6B] flex-shrink-0" />
                <span>Nigeria</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          className="mt-12 pt-8 border-t border-[#00DA6B] border-opacity-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h4 className="text-lg font-bold mb-2 text-[#00DA6B]">Stay Updated</h4>
              <p className="text-gray-400 text-sm">
                Subscribe to our newsletter for exclusive offers and updates
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="px-4 py-2 bg-[#002A35] border border-[#00DA6B] border-opacity-30 rounded-lg focus:outline-none focus:border-[#00DA6B] text-white placeholder-gray-500 w-full sm:w-64"
              />
              <button
                onClick={handleSubscribe}
                className="px-6 py-2 bg-[#00DA6B] text-[#001E23] font-bold rounded-lg hover:bg-[#00FF7F] transition-colors"
              >
                Subscribe
              </button>

              {/* Error message */}
              {error && (
                <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{error}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        className="bg-[#001A20] px-4 sm:px-6 lg:px-20 py-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
            © 2024 Dali Wears. All rights reserved. | Built with 💚
          </p>

          {/* Checkout Button */}
          <Link to="/cart">
            <motion.button
              className="bg-[#00DA6B] px-6 py-2 rounded-xl text-black font-bold text-base hover:bg-[#00FF7F] transition-all duration-300 shadow-lg hover:shadow-[#00DA6B]/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Checkout Now
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Animated Notification Popup */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-8 right-8 bg-[#00DA6B] text-[#001E23] px-6 py-3 rounded-lg shadow-lg font-semibold z-50"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}

export default Footer;