import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "../lib/useAuth";
import { useChat } from "../lib/useChat";

export default function ChatWidget() {
  const { user } = useAuth();
  const { open, setOpen, messages, unreadFromAdmin, sendMessage } = useChat();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  if (!user) return null;

  const handleSend = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    const text = body;
    setBody("");
    const ok = await sendMessage(text);
    if (!ok) setBody(text);
    setSending(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-80 sm:w-96 h-96 bg-[#001D23] border border-[#00DA6B]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-[#002A35] px-4 py-3 flex items-center justify-between">
            <p className="font-semibold text-white text-sm">Chat with Dali Wears</p>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm text-center mt-10">
                Send us a message and we'll get back to you.
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "ml-auto bg-[#00DA6B] text-[#001D23]"
                      : "bg-[#002A35] text-white"
                  }`}
                >
                  {m.body}
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-800 flex gap-2">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
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
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="mb-3 bg-[#001D23] border border-[#00DA6B]/30 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg hover:border-[#00DA6B] transition"
        >
          Text us directly
        </button>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="relative w-14 h-14 rounded-full bg-[#00DA6B] text-[#001D23] shadow-xl flex items-center justify-center hover:bg-[#00FF7F] transition"
        title="Chat with us"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unreadFromAdmin > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadFromAdmin}
          </span>
        )}
      </button>
    </div>
  );
}
