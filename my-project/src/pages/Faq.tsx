import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useStoreSettings } from "../lib/useStoreSettings";

function Faq() {
  const { settings } = useStoreSettings();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I place an order?",
      a: "Browse the shop, add items to your cart, then check out — pay securely online with Paystack, or use the WhatsApp option to arrange payment with us directly.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept card and bank payments through Paystack, as well as direct arrangement via WhatsApp.",
    },
    {
      q: "How long does delivery take?",
      a: "Akwa Ibom State: 1–3 business days. Lagos and all other states: 3–7 business days, counted from when your order is confirmed. See our Shipping & Delivery policy for details.",
    },
    {
      q: "Can I return an item or get a refund?",
      a: "If an item arrives damaged, faulty or not what you ordered, contact us within 48 hours of delivery. Once the return is approved, we refund you by bank transfer within 3–5 business days. See our Returns & Refunds policy for details.",
    },
    {
      q: "How do I track my order?",
      a: "Log in and check My Account → Orders for the current status of everything you've purchased.",
    },
    {
      q: "How do I get notified about new arrivals?",
      a: "Turn on \"Subscribe to updates\" from your Profile page to get notified in-app whenever new products are added.",
    },
  ];

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-20 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center">
        Frequently Asked Questions
      </h1>
      <p className="text-gray-400 text-center mb-10">
        Can't find what you're looking for?{" "}
        <a href={`https://wa.me/${settings.whatsapp_number}`} className="text-[#00DA6B] hover:underline">
          Message us on WhatsApp
        </a>
        .
      </p>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-[#001D23] rounded-xl border border-[#00DA6B]/10 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-semibold">{faq.q}</span>
              <ChevronDown
                size={18}
                className={`text-[#00DA6B] flex-shrink-0 transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === i && (
              <p className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Faq;
