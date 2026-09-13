import { supabase } from "./supabaseClient";
import { apiPost } from "./api";

export async function notifyTelegram(event: "login" | "signup" | "message", preview?: string) {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await apiPost("/api/notify-telegram", { access_token: token, event, preview });
  } catch {
    // Notifications are best-effort — never block the caller.
  }
}
