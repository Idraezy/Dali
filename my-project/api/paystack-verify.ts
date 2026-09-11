import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./_supabaseAdmin";
import { sendTelegramMessage } from "./_telegram";

interface PaystackVerifyResponse {
  status: boolean;
  data?: {
    status: string;
    amount: number;
    reference: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { reference, order_id } = req.body ?? {};
  if (typeof reference !== "string" || typeof order_id !== "number") {
    res.status(400).json({ error: "reference and order_id are required" });
    return;
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Payment verification is not configured." });
    return;
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id, total, status")
    .eq("id", order_id)
    .single();

  if (orderError || !order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.status === "paid") {
    res.status(200).json({ ok: true, status: "paid" });
    return;
  }

  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  const verifyBody = (await verifyRes.json()) as PaystackVerifyResponse;

  const paid =
    verifyBody.status &&
    verifyBody.data?.status === "success" &&
    // Paystack amounts are in kobo; order.total is in naira.
    verifyBody.data.amount === Math.round(Number(order.total) * 100);

  if (!paid) {
    await supabaseAdmin.from("orders").update({ status: "failed" }).eq("id", order_id);
    res.status(200).json({ ok: true, status: "failed" });
    return;
  }

  await supabaseAdmin
    .from("orders")
    .update({ status: "paid", paystack_reference: reference })
    .eq("id", order_id);

  await sendTelegramMessage(
    `💰 New paid order #${order_id}\nAmount: ₦${Number(order.total).toLocaleString("en-NG")}\nReference: ${reference}`
  );

  res.status(200).json({ ok: true, status: "paid" });
}
