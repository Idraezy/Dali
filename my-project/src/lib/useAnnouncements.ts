import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./useAuth";
import type { Announcement } from "./types";

export function useAnnouncements() {
  const { user, profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [localLastSeen, setLocalLastSeen] = useState<string | null>(null);

  useEffect(() => {
    setLocalLastSeen(profile?.notifications_last_seen_at ?? null);
  }, [profile?.notifications_last_seen_at]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setAnnouncements((data ?? []) as Announcement[]));
  }, [user]);

  const unreadCount = announcements.filter(
    (a) => !localLastSeen || new Date(a.created_at) > new Date(localLastSeen)
  ).length;

  const markSeen = useCallback(async () => {
    if (!user) return;
    const now = new Date().toISOString();
    setLocalLastSeen(now);
    await supabase.from("profiles").update({ notifications_last_seen_at: now }).eq("id", user.id);
  }, [user]);

  return { announcements, unreadCount, markSeen };
}
