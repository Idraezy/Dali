import { useState, type ChangeEvent } from 'react';
import { Mail, MapPin, PhoneCall, UserRound, MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneNumber = "2349164288560";
    const { name, email, message } = formData;

    if (!name || !email || !message) {
      alert("Please fill all fields before sending ✅");
      return;
    }

    const fullMessage = `Hello Dali Wears! 👋

I'm reaching out from your website:

Name: ${name}
Email: ${email}
Message: ${message}`;

    const encodedMessage = encodeURIComponent(fullMessage);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, "_blank");
    
    // Reset form
    setFormData({ name: "", email: "", message: "" });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
    viewport: { once: true, amount: 0.3 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001E23] via-[#002A35] to-[#001E23] py-20 px-4 sm:px-6 lg:px-20">
      {/* Hero Section */}
      <motion.div
        className="max-w-6xl mx-auto mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#00DA6B] to-[#00FF7F] bg-clip-text text-transparent">
            Let's Connect
          </h1>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
            Have questions about our fashion pieces or Pinterest frames? We'd love to hear from you! Whether it's about placing an order, requesting a custom design, or simply sharing feedback—drop us a message and we'll get back to you promptly.
          </p>
        </motion.div>

        {/* Decorative Line */}
        <motion.div
          className="w-32 h-1 bg-gradient-to-r from-[#00DA6B] to-transparent mx-auto mt-8"
          initial={{ width: 0 }}
          animate={{ width: 128 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Side - Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6 text-[#00DA6B]">
                Get In Touch
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Reach out to us through any of the channels below. We're here to assist you with all your fashion needs and answer any questions you may have about our products.
              </p>
            </div>

            {/* Contact Cards */}
            <motion.div
              className="space-y-6"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {[
                { icon: Mail, label: "Email", value: "faithlawrence161@gmail.com", href: "mailto:faithlawrence161@gmail.com" },
                { icon: PhoneCall, label: "Phone", value: "+234 (0)916 428 8560", href: "tel:+2349164288560" },
                { icon: MapPin, label: "Location", value: "Nigeria", href: null },
              ].map((item, index) => (
                <motion.a
                  key={index}
                  href={item.href || undefined}
                  target={item.href ? "_blank" : undefined}
                  rel={item.href ? "noopener noreferrer" : undefined}
                  className={`flex items-start gap-4 p-6 bg-[#002A35] rounded-2xl border border-[#00DA6B] border-opacity-20 hover:border-opacity-100 transition-all duration-300 ${item.href ? 'cursor-pointer hover:scale-105' : ''}`}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 }
                  }}
                  whileHover={item.href ? { y: -5 } : {}}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-[#00DA6B] bg-opacity-20 rounded-full flex items-center justify-center">
                    <item.icon className="text-[#00DA6B]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{item.label}</h3>
                    <p className="text-gray-400 text-sm break-words">{item.value}</p>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          

          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="bg-[#002A35] p-8 sm:p-10 rounded-3xl border border-[#00DA6B] border-opacity-30 shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[#00DA6B]">
                Send Us a Message
              </h2>

              <form className="space-y-6" onSubmit={handleSend}>
                {/* Name Input */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Your Name
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    placeholder="Faith David" 
                    onChange={handleChange}
                    className="bg-[#002B35] p-4 pr-12 rounded-xl border border-[#00DA6B] border-opacity-30 w-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00DA6B] focus:border-transparent transition-all"
                  />
                  <UserRound className="absolute right-4 bottom-4 text-[#00DA6B] w-5 h-5" />
                </motion.div>

                {/* Email Input */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    placeholder="example@gmail.com" 
                    onChange={handleChange}
                    className="bg-[#002B35] p-4 pr-12 rounded-xl border border-[#00DA6B] border-opacity-30 w-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00DA6B] focus:border-transparent transition-all"
                  />
                  <Mail className="absolute right-4 bottom-4 text-[#00DA6B] w-5 h-5" />
                </motion.div>

                {/* Message Textarea */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Your Message
                  </label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    placeholder="Tell us what you're looking for..."
                    onChange={handleChange} 
                    rows={5}
                    className="bg-[#002B35] p-4 pr-12 rounded-xl border border-[#00DA6B] border-opacity-30 w-full text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#00DA6B] focus:border-transparent transition-all"
                  />
                  <MessageSquare className="absolute right-4 top-14 text-[#00DA6B] w-5 h-5" />
                </motion.div>

                {/* Submit Button */}
                <motion.button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#00DA6B] to-[#00FF7F] hover:from-[#00FF7F] hover:to-[#00DA6B] text-[#001E23] font-bold p-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-[#00DA6B]/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Message
                  <Send size={20} />
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="max-w-6xl mx-auto mt-20 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        viewport={{ once: true }}
      >
        <p className="text-gray-400 mb-4">
          Prefer to shop first? Check out our latest collection!
        </p>
        <a
          href="/latest"
          className="inline-block px-8 py-3 bg-[#002A35] border-2 border-[#00DA6B] text-[#00DA6B] font-bold rounded-full hover:bg-[#00DA6B] hover:text-[#001E23] transition-all duration-300"
        >
          Browse Our Shop
        </a>
      </motion.div>
    </div>
  );
}

export default Contact;


