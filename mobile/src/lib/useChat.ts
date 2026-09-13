import { createContext, useContext } from "react";
import type { ChatMessage } from "./types";

export interface ChatContextValue {
  messages: ChatMessage[];
  unreadFromAdmin: number;
  sendMessage: (body: string) => Promise<boolean>;
  markRead: () => void;
}

export const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
