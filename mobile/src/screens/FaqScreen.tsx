import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStoreSettings } from "../lib/useStoreSettings";
import { colors } from "../lib/theme";

const FAQS = [
  {
    q: "How do I place an order?",
    a: "Browse the shop, add items to your cart, then check out — pay securely online with Paystack, or message us to arrange payment directly.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept card and bank payments through Paystack, as well as direct arrangement via chat.",
  },
  {
    q: "How long does delivery take?",
    a: "Delivery timelines depend on your location within Nigeria. We'll confirm an estimate with you after your order is placed.",
  },
  {
    q: "Can I return or exchange an item?",
    a: "Reach out to us via chat within 48 hours of delivery if there's an issue with your order, and we'll sort it out.",
  },
  {
    q: "How do I track my order?",
    a: "Log in and check My Account → Orders for the current status of everything you've purchased.",
  },
  {
    q: "How do I get notified about new arrivals?",
    a: 'Turn on "Subscribe to updates" from your Profile tab to get notified whenever new products are added.',
  },
];

export default function FaqScreen() {
  const { settings } = useStoreSettings();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Frequently Asked Questions</Text>
      <Text style={styles.subtitle}>Can't find what you're looking for? Message us in the chat tab.</Text>
      <Text style={styles.contact}>{settings.contact_email}</Text>

      <View style={{ gap: 10, marginTop: 16 }}>
        {FAQS.map((faq, i) => (
          <View key={i} style={styles.card}>
            <TouchableOpacity
              style={styles.question}
              onPress={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <Text style={styles.questionText}>{faq.q}</Text>
              <Ionicons
                name={openIndex === i ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.accent}
              />
            </TouchableOpacity>
            {openIndex === i && <Text style={styles.answer}>{faq.a}</Text>}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 22, fontWeight: "800", marginBottom: 8 },
  subtitle: { color: colors.textMuted, fontSize: 13 },
  contact: { color: colors.accent, fontSize: 13, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: 10, overflow: "hidden" },
  question: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  questionText: { color: colors.text, fontWeight: "600", fontSize: 13, flex: 1, marginRight: 8 },
  answer: { color: colors.textMuted, fontSize: 12, paddingHorizontal: 14, paddingBottom: 14, lineHeight: 18 },
});
