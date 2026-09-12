import { useEffect, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import type { ChatMessage } from "../../lib/types";

interface RawMessage extends ChatMessage {
  profiles: { email: string; full_name: string | null } | null;
}

interface Thread {
  userId: string;
  email: string;
  name: string | null;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

const POLL_INTERVAL_MS = 5000;

function AdminMessages() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchThreads = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, profiles(email, full_name)")
        .order("created_at", { ascending: false })
        .limit(500);

      if (!active) return;

      const byUser = new Map<string, Thread>();
      for (const row of (data ?? []) as RawMessage[]) {
        const existing = byUser.get(row.user_id);
        if (!existing) {
          byUser.set(row.user_id, {
            userId: row.user_id,
            email: row.profiles?.email ?? "Unknown",
            name: row.profiles?.full_name ?? null,
            lastMessage: row.body,
            lastAt: row.created_at,
            unread: row.sender === "user" && !row.read ? 1 : 0,
          });
        } else if (row.sender === "user" && !row.read) {
          existing.unread += 1;
        }
      }

      setThreads(Array.from(byUser.values()));
      setLoading(false);
    };

    fetchThreads();
    const interval = setInterval(fetchThreads, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    let active = true;

    const fetchThread = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", selectedUserId)
        .order("created_at", { ascending: true });
      if (active) setThread((data ?? []) as ChatMessage[]);
    };

    fetchThread();
    const interval = setInterval(fetchThread, POLL_INTERVAL_MS);

    supabase
      .from("messages")
      .update({ read: true })
      .eq("user_id", selectedUserId)
      .eq("sender", "user")
      .eq("read", false)
      .then(() => {});

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedUserId]);

  const handleSend = async () => {
    if (!reply.trim() || !selectedUserId || sending) return;
    setSending(true);
    const body = reply.trim();
    setReply("");
    const { data, error } = await supabase
      .from("messages")
      .insert({ user_id: selectedUserId, sender: "admin", body })
      .select("*")
      .single();
    setSending(false);
    if (!error && data) {
      setThread((prev) => [...prev, data as ChatMessage]);
    }
  };

  const selectedThread = threads.find((t) => t.userId === selectedUserId);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Messages</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 py-10">
          <Loader2 className="animate-spin" /> Loading conversations...
        </div>
      ) : threads.length === 0 ? (
        <p className="text-gray-400 py-10">No messages yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[560px]">
          {/* Thread list */}
          <div className="bg-[#001D23] rounded-xl overflow-y-auto">
            {threads
              .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
              .map((t) => (
                <button
                  key={t.userId}
                  onClick={() => setSelectedUserId(t.userId)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-800 transition ${
                    selectedUserId === t.userId ? "bg-[#002A35]" : "hover:bg-[#001a1f]"
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <p className="font-semibold text-sm truncate">{t.name || t.email}</p>
                    {t.unread > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-1">{t.lastMessage}</p>
                </button>
              ))}
          </div>

          {/* Thread view */}
          <div className="md:col-span-2 bg-[#001D23] rounded-xl flex flex-col">
            {!selectedUserId ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                Select a conversation
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="font-semibold text-sm">
                    {selectedThread?.name || selectedThread?.email}
                  </p>
                  <p className="text-xs text-gray-500">{selectedThread?.email}</p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {thread.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                        m.sender === "admin"
                          ? "ml-auto bg-[#00DA6B] text-[#001D23]"
                          : "bg-[#002A35] text-white"
                      }`}
                    >
                      {m.body}
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-gray-800 flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a reply..."
                    className="flex-1 bg-[#002A35] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00DA6B]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="bg-[#00DA6B] text-[#001D23] p-2 rounded-lg hover:bg-[#00FF7F] transition disabled:opacity-60"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMessages;
