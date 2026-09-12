import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Loader2 } from "lucide-react";
import ProductImage from "../components/ProductImage";
import { useProducts } from "../lib/useProducts";
import { formatNaira } from "../lib/format";

function FeaturedProduct() {
  const { products, loading } = useProducts();

  const featured = products.filter((p) => p.is_featured).slice(0, 8);

  return (
    <div className="bg-gradient-to-br from-[#001E23] to-[#002A35] text-white mt-10 p-6 sm:p-8 md:p-10 rounded-2xl mx-4 sm:mx-6 md:mx-8 lg:mx-10 shadow-2xl">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 bg-gradient-to-r from-[#00DA6B] to-[#00FF7F] bg-clip-text text-transparent">
          FEATURED PRODUCTS
        </h2>
        <p className="text-gray-400 text-sm">Handpicked by us, added by our admin</p>
      </motion.div>

      {loading && (
        <div className="flex justify-center py-12 text-gray-400 gap-2">
          <Loader2 className="animate-spin" /> Loading featured products...
        </div>
      )}

      {!loading && featured.length === 0 && (
        <p className="text-center text-gray-400 py-12 text-sm">
          Featured products will show up here once the admin marks some as featured.
        </p>
      )}

      {!loading && featured.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((item) => (
            <Link
              key={item.id}
              to="/latest"
              className="group bg-[#001A20] rounded-2xl overflow-hidden border border-[#00DA6B]/20 hover:border-[#00DA6B] transition-all duration-300"
            >
              <div className="relative h-40 sm:h-48 overflow-hidden bg-[#002A35]">
                <ProductImage
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-[#00DA6B] transition-colors">
                  {item.name}
                </h3>
                <p className="font-bold text-sm text-[#00DA6B]">{formatNaira(item.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        <Link to="/latest">
          <button className="bg-[#00DA6B] hover:bg-[#00FF7F] text-[#001E23] font-bold px-6 py-2.5 rounded-full text-sm inline-flex items-center gap-2 transition-all duration-300">
            <ShoppingBag size={16} />
            View All Products
          </button>
        </Link>
      </div>
    </div>
  );
}

export default FeaturedProduct;
