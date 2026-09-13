import * as WebBrowser from "expo-web-browser";
import { apiPost } from "./api";

const PAYMENT_CALLBACK_URL = "dalimobile://payment-callback";

interface InitializeResponse {
  status: boolean;
  authorization_url?: string;
  reference?: string;
  error?: string;
}

interface VerifyResponse {
  ok: boolean;
  status?: "paid" | "failed";
  error?: string;
}

// Paystack's inline JS popup (used on the web app) doesn't exist in React
// Native — instead we open Paystack's hosted checkout page in an in-app
// browser and verify server-side afterwards, exactly like the web app's
// /api/paystack-verify already does. Never trust the browser's own
// success/cancel result; the verify call is the source of truth.
export async function payWithPaystack(params: {
  email: string;
  amountNaira: number;
  orderId: number;
}): Promise<VerifyResponse> {
  const init = await apiPost<InitializeResponse>("/api/paystack-initialize", {
    email: params.email,
    amount: Math.round(params.amountNaira * 100),
    order_id: params.orderId,
    callback_url: PAYMENT_CALLBACK_URL,
  });

  if (!init.status || !init.authorization_url || !init.reference) {
    return { ok: false, error: init.error || "Could not start payment." };
  }

  await WebBrowser.openAuthSessionAsync(init.authorization_url, PAYMENT_CALLBACK_URL);

  return apiPost<VerifyResponse>("/api/paystack-verify", {
    reference: init.reference,
    order_id: params.orderId,
  });
}
