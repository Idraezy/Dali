import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./useAuth";
import { notifyTelegramMessage } from "./notifyTelegram";
import { ChatContext } from "./useChat";
import type { ChatMessage } from "./types";

const POLL_INTERVAL_MS = 5000;

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      setMessages((data ?? []) as ChatMessage[]);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!open || !user) return;
    supabase
      .from("messages")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("sender", "admin")
      .eq("read", false)
      .then(() => {});
  }, [open, user, messages.length]);

  const sendMessage = async (body: string): Promise<boolean> => {
    if (!user || !body.trim()) return false;
    const text = body.trim();
    const { data, error } = await supabase
      .from("messages")
      .insert({ user_id: user.id, sender: "user", body: text })
      .select("*")
      .single();
    if (!error && data) {
      setMessages((prev) => [...prev, data as ChatMessage]);
      void notifyTelegramMessage(text);
      return true;
    }
    return false;
  };

  const unreadFromAdmin = messages.filter((m) => m.sender === "admin" && !m.read).length;

  return (
    <ChatContext.Provider value={{ open, setOpen, messages, unreadFromAdmin, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}
