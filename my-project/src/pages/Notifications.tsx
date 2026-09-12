import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/useAuth";
import type { Announcement } from "../lib/types";

function Notifications() {
  const { user, profile, refreshProfile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setAnnouncements((data ?? []) as Announcement[]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .update({ notifications_last_seen_at: new Date().toISOString() })
      .eq("id", user.id)
      .then(() => refreshProfile());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const lastSeen = profile?.notifications_last_seen_at;

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-20 py-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Bell className="text-[#00DA6B]" /> Notifications
      </h1>

      {!profile?.subscribed_to_updates && (
        <p className="text-gray-400 text-sm mb-6 bg-[#001D23] rounded-lg p-4">
          You're not subscribed to updates yet. Turn it on from{" "}
          <a href="/account" className="text-[#00DA6B] hover:underline">
            your profile
          </a>{" "}
          to get notified automatically next time.
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 py-10">
          <Loader2 className="animate-spin" /> Loading notifications...
        </div>
      ) : announcements.length === 0 ? (
        <p className="text-gray-400 py-10">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const isNew = lastSeen ? new Date(a.created_at) > new Date(lastSeen) : false;
            return (
              <div
                key={a.id}
                className={`bg-[#001D23] rounded-xl p-4 border ${
                  isNew ? "border-[#00DA6B]/40" : "border-transparent"
                }`}
              >
                <p className="text-sm text-gray-200">{a.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(a.created_at).toLocaleString("en-NG")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
