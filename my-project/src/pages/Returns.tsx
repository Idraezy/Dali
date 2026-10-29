import PolicyPage from "../components/PolicyPage";

function Returns() {
  return (
    <PolicyPage
      title="Returns & Refunds"
      updated="28 October 2026"
      intro="We want you to love what you order. This policy explains when we accept returns and how you can request a refund."
      sections={[
        {
          heading: "When we accept returns",
          paragraphs: ["We accept returns when an item:"],
          items: [
            "arrives damaged or faulty, or",
            "is not what you ordered (wrong item, size or colour).",
          ],
        },
        {
          heading: "Time limit",
          paragraphs: [
            "You must report the issue within 48 hours of delivery. Requests made after 48 hours cannot be accepted.",
          ],
        },
        {
          heading: "What we cannot accept",
          items: [
            "Change-of-mind returns, or items that were the size or style you ordered.",
            "Items that have been worn, washed, altered or damaged after delivery.",
          ],
        },
        {
          heading: "How to request a return or refund",
          items: [
            "Contact us within 48 hours of delivery by chat, WhatsApp or email.",
            "Include your order details and clear photos of the item and the issue.",
            "We will review your request and tell you how to send the item back.",
          ],
        },
        {
          heading: "Return delivery costs",
          paragraphs: [
            "If the item is faulty, damaged or not what you ordered, Dali Wears covers the cost of returning it. Original delivery fees are not refundable.",
          ],
        },
        {
          heading: "Refunds",
          paragraphs: [
            "Once we receive and inspect the returned item and approve your request, we refund you by bank transfer within 3–5 business days. We will ask for your bank account details to process the refund.",
          ],
        },
      ]}
    />
  );
}

export default Returns;
