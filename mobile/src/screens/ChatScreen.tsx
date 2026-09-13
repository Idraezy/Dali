import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useAuth } from "../lib/useAuth";
import { useChat } from "../lib/useChat";
import { colors } from "../lib/theme";
import type { ChatMessage } from "../lib/types";

export default function ChatScreen() {
  const { user } = useAuth();
  const { messages, sendMessage, markRead } = useChat();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useFocusEffect(
    useCallback(() => {
      markRead();
    }, [markRead])
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    const text = body;
    setBody("");
    const ok = await sendMessage(text);
    if (!ok) setBody(text);
    setSending(false);
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="chatbubble-ellipses-outline" size={40} color="#4B5563" />
        <Text style={styles.empty}>Log in to chat with us.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {messages.length === 0 ? (
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.empty}>Send us a message and we'll get back to you.</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.sender === "user" ? styles.bubbleUser : styles.bubbleAdmin,
              ]}
            >
              <Text style={item.sender === "user" ? styles.bubbleTextUser : styles.bubbleTextAdmin}>
                {item.body}
              </Text>
            </View>
          )}
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={body}
          onChangeText={setBody}
          placeholder="Type a message..."
          placeholderTextColor="#6B7280"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending}>
          <Ionicons name="send" size={18} color={colors.background} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: "center", alignItems: "center", padding: 24 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 12 },
  bubble: { maxWidth: "80%", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleUser: { alignSelf: "flex-end", backgroundColor: colors.accent },
  bubbleAdmin: { alignSelf: "flex-start", backgroundColor: colors.surface },
  bubbleTextUser: { color: colors.background },
  bubbleTextAdmin: { color: colors.text },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text,
  },
  sendButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
});
