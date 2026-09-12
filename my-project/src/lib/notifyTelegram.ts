import { supabase } from "./supabaseClient";

export async function notifyTelegramMessage(preview: string) {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch("/api/notify-telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token, event: "message", preview }),
    });
  } catch {
    // Notifications are best-effort — never block sending a message.
  }
}
