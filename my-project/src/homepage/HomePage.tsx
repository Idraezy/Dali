import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import home1 from "../assets/home1.jpeg";
import home2 from "../assets/home2.jpeg";
import home3 from "../assets/home3.jpeg";
import home4 from "../assets/home4.jpeg";
import home5 from "../assets/home5.jpeg";
import home6 from "../assets/home6.jpg";
import home7 from "../assets/home7.jpg";
import FeaturedProduct from "./FeaturedProduct";

function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [home1, home2, home3, home4, home5, home6,home7];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-[#001D23] px-4 sm:px-6 md:px-8 lg:px-10 py-10">
      <div className="bg-[#002A35] px-5 sm:px-8 md:px-10 lg:px-12 py-10 sm:py-12 md:py-16 rounded-2xl shadow-2xl">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-12">
          {/* Left Side - Brand Name */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold text-[#00DA6B] leading-tight"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                DALI
              </motion.span>

              <motion.span
                className="block ml-8 sm:ml-12 md:ml-16 lg:ml-20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                WEARS
              </motion.span>
            </motion.div>

            <motion.p
              className="text-gray-400 text-base sm:text-lg md:text-xl mt-4 sm:mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Fashion that speaks for you
            </motion.p>
          </motion.div>

          {/* Right Side - Image Carousel */}
          <motion.div
            className="relative w-full lg:w-1/2 h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`Fashion ${currentImageIndex + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
            </AnimatePresence>

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? "bg-[#00DA6B] w-8"
                      : "bg-gray-400 hover:bg-gray-300"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </motion.div>
        </div>

        {/* Shop Now Button */}
        <motion.div
          className="flex justify-center lg:justify-start mt-8 sm:mt-10 md:mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Link to="/latest">
            <motion.button
              className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-transparent border-2 border-[#00DA6B] text-[#00DA6B] rounded-full font-bold text-base sm:text-lg hover:bg-[#00DA6B] hover:text-white transition-all duration-300 shadow-lg hover:shadow-[#00DA6B]/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              SHOP NOW
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats or Features Section */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {[
            { label: "Quality Products", value: "100%" },
            { label: "Happy Customers", value: "500+" },
            { label: "Fashion Items", value: "200+" },
            { label: "Fast Delivery", value: "24/7" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-[#001D23] p-4 sm:p-6 rounded-xl text-center border border-[#00DA6B] border-opacity-20 hover:border-opacity-100 transition-all duration-300"
              whileHover={{ translateY: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-[#00DA6B] mb-2">
                {stat.value}
              </h3>
              <p className="text-gray-400 text-sm sm:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <FeaturedProduct/>
    </div>
  );
}

export default HomePage;