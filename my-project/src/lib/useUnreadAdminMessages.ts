import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const POLL_INTERVAL_MS = 8000;

export function useUnreadAdminMessages() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchCount = () => {
      supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("sender", "user")
        .eq("read", false)
        .then(({ count }) => {
          if (active) setCount(count ?? 0);
        });
    };

    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return count;
}
