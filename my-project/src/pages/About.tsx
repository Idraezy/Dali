import { motion } from "framer-motion";
import profileImage from "../assets/profileImage.jpg";
import { Heart, ShoppingBag, Palette } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
    viewport: { once: true, amount: 0.3 },
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    transition: { staggerChildren: 0.2 },
  };

  const features = [
    { icon: ShoppingBag, title: "Basic Tops", description: "Essential and versatile tops for everyday wear" },
    { icon: ShoppingBag, title: "Pin-Down Basic Tops", description: "Stylish and secure pin-down collection" },
    { icon: ShoppingBag, title: "Backless Tops", description: "Chic and daring backless designs" },
    { icon: ShoppingBag, title: "Maxi Gowns", description: "Elegant and sophisticated long gowns" },
    { icon: Palette, title: "Pinterest Frames", description: "Curated artistic frames for inspiration" },
    { icon: Heart, title: "Quality Crafted", description: "Premium materials and excellent craftsmanship" },
  ];

  return (
    <div className="min-h-screen bg-[#001E23] text-white overflow-hidden">
      {/* Hero Section */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            About <span className="text-[#00DD75]">Dali Wears</span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-400 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Crafting Style, Creating Experiences
          </motion.p>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* CEO Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Image */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-center md:justify-start"
            >
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
                <motion.div
                  className="absolute inset-0 bg-[#00DD75] opacity-20 rounded-2xl"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                ></motion.div>
                <img
                  src={profileImage}
                  alt="CEO"
                  className="relative w-full h-full object-cover rounded-2xl border-4 border-[#00DD75] shadow-2xl"
                />
              </div>
            </motion.div>

            {/* Text */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#00DD75]">
                  Our Visionary Leader
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  At the heart of Dali Wears is a passionate entrepreneur dedicated to bringing style, comfort, and quality to fashion. Our founder has worked tirelessly to create a brand that celebrates individuality and confidence through thoughtfully designed clothing.
                </p>
              </div>

              <div className="bg-[#002E35] p-6 rounded-xl border border-[#00DD75] border-opacity-30">
                <p className="text-gray-300 mb-3">
                  <span className="text-[#00DD75] font-semibold">Special Note:</span> Our founder's birthday is on <span className="font-bold text-[#00DD75]">November 23rd</span>. What better gift could there be than purchasing from Dali Wears? Support her vision and celebrate quality fashion this season.
                </p>
              </div>

              <p className="text-lg text-gray-300 leading-relaxed">
                Every piece in our collection reflects her commitment to quality, style, and customer satisfaction. From basic tops to elegant maxi gowns, each item is carefully curated to ensure you look and feel your best.
              </p>
            </motion.div>
          </motion.div>

          {/* About Brand Section */}
          <motion.div
            className="bg-gradient-to-r  bg-opacity-10 p-8 md:p-12 rounded-2xl mb-20 border border-[#00DD75] border-opacity-30"
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#00DD75]">
              Welcome to Dali Wears
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              Dali Wears is more than just a fashion brand—it's a lifestyle. We specialize in creating versatile, high-quality clothing pieces designed for the modern, confident individual. Whether you're looking for everyday essentials or statement-making pieces, our collection has something for everyone.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Our commitment to excellence extends beyond our products to our customer service. We believe in building lasting relationships with our clients and ensuring every shopping experience is memorable.
            </p>
          </motion.div>

          {/* Product Categories */}
          <motion.div
            className="mb-20"
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h3
              className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#00DD75]"
              variants={fadeInUp}
            >
              What We Offer
            </motion.h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-[#002E35] p-8 rounded-xl border border-[#00DD75] border-opacity-20 hover:border-opacity-100 transition-all duration-300 hover:shadow-lg hover:shadow-[#00DD75]/20"
                  variants={fadeInUp}
                  whileHover={{ translateY: -5 }}
                >
                  <feature.icon size={40} className="text-[#00DD75] mb-4" />
                  <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            className="mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#00DD75]">
              Our Core Values
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Quality",
                  description: "We use only the finest materials and craftsmanship in every piece we create.",
                },
                {
                  title: "Authenticity",
                  description: "Our designs reflect genuine creativity and a deep understanding of fashion trends.",
                },
                {
                  title: "Customer Care",
                  description: "Your satisfaction is our priority. We're here to ensure you have the best experience.",
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  className="text-center space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="w-16 h-16 mx-auto bg-[#00DD75] bg-opacity-20 rounded-full flex items-center justify-center">
                    <Heart size={32} className="text-[#00DD75]" />
                  </div>
                  <h4 className="text-2xl font-bold text-[#00DD75]">{value.title}</h4>
                  <p className="text-gray-400">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            className="bg-gradient-to-r from-[#00DD75] to-[#00AA55] p-10 md:p-16 rounded-2xl text-center space-y-6"
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-[#001E23]">
              Ready to Experience Dali Wears?
            </h3>
            <p className="text-lg text-[#001E23] max-w-2xl mx-auto">
              Interested in collaborations or have questions about our products? We'd love to hear from you. Get in touch with us for more information and partnership opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/latest">
                <button className="px-8 py-4 bg-[#001E23] text-[#00DD75] font-bold rounded-lg hover:bg-opacity-90 transition text-lg border-2 border-[#001E23]">
                  Shop Now
                </button>
              </Link>

              <Link to="/contact">
                <button className="px-8 py-4 bg-[#001E23] text-[#00DD75] font-bold rounded-lg hover:bg-opacity-90 transition text-lg border-2 border-[#001E23]">
                  Get in Touch
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <motion.section
        className="py-16 px-4 sm:px-6 lg:px-20 border-t border-[#00DD75] border-opacity-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-lg">
            Thank you for choosing <span className="text-[#00DD75] font-bold">Dali Wears</span>. We look forward to being part of your style journey.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            © 2024 Dali Wears. All rights reserved.
          </p>
        </div>
      </motion.section>
    </div>
  );
}