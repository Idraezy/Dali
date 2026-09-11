import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./_supabaseAdmin";
import { sendTelegramMessage } from "./_telegram";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { access_token, event } = req.body ?? {};
  if (typeof access_token !== "string" || (event !== "login" && event !== "signup")) {
    res.status(400).json({ error: "access_token and a valid event are required" });
    return;
  }

  // Verify the token server-side so a client can't spoof a login notification
  // for an account that isn't actually theirs.
  const { data, error } = await supabaseAdmin.auth.getUser(access_token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid session" });
    return;
  }

  const label = event === "signup" ? "🆕 New signup" : "🔐 New login";
  const timestamp = new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" });
  const text = `${label}\n${data.user.email}\n${timestamp}`;

  const notified = await sendTelegramMessage(text);
  res.status(200).json({ ok: true, notified });
}
