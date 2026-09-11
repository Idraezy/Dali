import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Loader2 } from "lucide-react";
import { useProducts } from "../lib/useProducts";
import { formatNaira } from "../lib/format";
import type { Product } from "../lib/types";

function FeaturedProduct() {
  const { products, loading } = useProducts();
  const [position, setPosition] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Prefer products marked featured by the admin; fall back to the full catalog.
  const featured: Product[] =
    products.filter((p) => p.is_featured).length > 0
      ? products.filter((p) => p.is_featured)
      : products;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1280) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (featured.length === 0) return;
    const interval = setInterval(() => {
      setPosition((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [position, featured.length]);

  const handleNext = () => {
    if (featured.length === 0) return;
    setPosition((prev) => (prev + 1) % featured.length);
  };

  const handlePrev = () => {
    if (featured.length === 0) return;
    setPosition((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const getVisibleItems = () => {
    const items: Product[] = [];
    for (let i = 0; i < Math.min(itemsPerView, featured.length); i++) {
      const index = (position + i) % featured.length;
      items.push(featured[index]);
    }
    return items;
  };

  return (
    <div className="bg-gradient-to-br from-[#001E23] to-[#002A35] text-white relative overflow-hidden mt-10 p-6 sm:p-8 md:p-10 rounded-2xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 shadow-2xl">
      {/* Title */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-[#00DA6B] to-[#00FF7F] bg-clip-text text-transparent">
          FEATURED PRODUCTS
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">Discover our handpicked collection</p>
      </motion.div>

      {loading && (
        <div className="flex justify-center py-16 text-gray-400 gap-2">
          <Loader2 className="animate-spin" /> Loading featured products...
        </div>
      )}

      {!loading && featured.length === 0 && (
        <p className="text-center text-gray-400 py-16">
          Products will show up here once they're added from the admin dashboard.
        </p>
      )}

      {!loading && featured.length > 0 && (
        <>
          {/* Navigation Arrows */}
          <motion.button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-[#00DA6B] hover:bg-[#00FF7F] text-[#001E23] p-2 sm:p-3 rounded-full z-10 shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={24} className="sm:w-7 sm:h-7" />
          </motion.button>

          <motion.button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-[#00DA6B] hover:bg-[#00FF7F] text-[#001E23] p-2 sm:p-3 rounded-full z-10 shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={24} className="sm:w-7 sm:h-7" />
          </motion.button>

          {/* Product Cards Container */}
          <div className="relative px-8 sm:px-12 md:px-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={position}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {getVisibleItems().map((item, i) => (
                  <motion.div
                    key={`${position}-${i}`}
                    className="relative group bg-[#001A20] rounded-2xl shadow-xl overflow-hidden border border-[#00DA6B] border-opacity-20 hover:border-opacity-100 transition-all duration-300"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ y: -10 }}
                    onHoverStart={() => setHoveredIndex(i)}
                    onHoverEnd={() => setHoveredIndex(null)}
                  >
                    {/* Image Container */}
                    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-[#002A35]">
                      {item.image_url && (
                        <motion.img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          animate={{ scale: hoveredIndex === i ? 1.1 : 1 }}
                          transition={{ duration: 0.4 }}
                        />
                      )}

                      {/* Overlay on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-[#001E23] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredIndex === i ? 1 : 0 }}
                      >
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                          <Link to="/latest">
                            <button className="bg-[#00DA6B] text-[#001E23] px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#00FF7F] transition-colors">
                              <ShoppingBag size={16} />
                              Shop Now
                            </button>
                          </Link>
                        </div>
                      </motion.div>

                      {/* "New" Badge */}
                      <div className="absolute top-3 right-3 bg-[#00DA6B] text-[#001E23] px-3 py-1 rounded-full text-xs font-bold">
                        NEW
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 sm:p-5 text-center">
                      <h3 className="font-bold text-base sm:text-lg mb-2 text-white group-hover:text-[#00DA6B] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400 mb-3">From Dali Wears</p>
                      <p className="font-extrabold text-lg sm:text-xl text-[#00DA6B]">
                        {formatNaira(item.price)}
                      </p>

                      {/* Rating Stars */}
                      <div className="flex justify-center gap-1 mt-3">
                        {[...Array(5)].map((_, starIndex) => (
                          <span key={starIndex} className="text-[#00DA6B] text-sm">
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {featured.map((_, index) => (
              <button
                key={index}
                onClick={() => setPosition(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === position ? "bg-[#00DA6B] w-8" : "bg-gray-600 w-2 hover:bg-gray-500"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* View All Button */}
      <motion.div
        className="text-center mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Link to="/latest">
          <button className="bg-[#00DA6B] hover:bg-[#00FF7F] text-[#001E23] font-bold px-8 py-3 rounded-full text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-[#00DA6B]/50">
            View All Products
          </button>
        </Link>
      </motion.div>
    </div>
  );
}

export default FeaturedProduct;
