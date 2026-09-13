import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./_supabaseAdmin.js";

interface PaystackInitializeResponse {
  status: boolean;
  message?: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

// Used by the mobile app only — the web app pays via Paystack's inline JS
// popup instead, which needs no server-initiated transaction. Mobile has no
// inline popup, so it opens a hosted Paystack checkout page in an in-app
// browser, which this endpoint creates a transaction for.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { email, amount, order_id, callback_url } = req.body ?? {};
  if (
    typeof email !== "string" ||
    typeof amount !== "number" ||
    typeof order_id !== "number" ||
    typeof callback_url !== "string"
  ) {
    res.status(400).json({ error: "email, amount, order_id, and callback_url are required" });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ status: false, error: "Payment isn't configured." });
    return;
  }

  // Confirm the order exists, belongs to nobody-spoofable, and the amount
  // matches what's actually owed — never trust the client-supplied amount.
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id, total, status")
    .eq("id", order_id)
    .single();

  if (orderError || !order) {
    res.status(404).json({ status: false, error: "Order not found" });
    return;
  }

  if (Math.round(Number(order.total) * 100) !== amount) {
    res.status(400).json({ status: false, error: "Amount does not match order total." });
    return;
  }

  const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      callback_url,
      metadata: { order_id },
    }),
  });

  const initBody = (await initRes.json()) as PaystackInitializeResponse;

  if (!initBody.status || !initBody.data) {
    res.status(502).json({ status: false, error: initBody.message || "Paystack error." });
    return;
  }

  res.status(200).json({
    status: true,
    authorization_url: initBody.data.authorization_url,
    reference: initBody.data.reference,
  });
}
