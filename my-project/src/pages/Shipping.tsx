import PolicyPage from "../components/PolicyPage";

function Shipping() {
  return (
    <PolicyPage
      title="Shipping & Delivery"
      updated="28 October 2026"
      intro="Dali Wears is based in Akwa Ibom State and delivers to customers across Nigeria. This policy explains how orders are fulfilled and how long delivery takes."
      sections={[
        {
          heading: "Order fulfilment",
          items: [
            "Your order is confirmed once payment is successful through Paystack, or once we have confirmed a payment arranged directly with you.",
            "You will see your order and its status under My Account → Orders.",
            "We will contact you by phone, WhatsApp or chat to confirm your delivery address and arrange delivery.",
          ],
        },
        {
          heading: "Delivery timelines",
          paragraphs: [
            "Timelines are counted in business days (Monday to Friday, excluding public holidays) from the day your order is confirmed:",
          ],
          items: [
            "Akwa Ibom State: 1–3 business days.",
            "Lagos: 3–7 business days.",
            "All other states in Nigeria: 3–7 business days.",
          ],
        },
        {
          heading: "Delivery fees",
          paragraphs: [
            "Delivery fees depend on your location and are confirmed with you before your order is dispatched.",
          ],
        },
        {
          heading: "Delays",
          paragraphs: [
            "Courier delays, public holidays or events outside our control can occasionally extend these timelines. If your order is delayed, we will let you know and keep you updated until it arrives.",
          ],
        },
        {
          heading: "Receiving your order",
          paragraphs: [
            "Please check your items when they arrive. If anything is damaged, faulty or not what you ordered, contact us within 48 hours of delivery — see our Returns & Refunds policy.",
          ],
        },
      ]}
    />
  );
}

export default Shipping;
