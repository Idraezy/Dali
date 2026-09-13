// Base URL of the deployed Dali Wears website, whose /api/* serverless
// functions (Telegram notify, Paystack initialize/verify) this app calls —
// mobile has no server of its own, it shares the website's backend.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "Missing EXPO_PUBLIC_API_BASE_URL. Set it to your deployed website's URL " +
      "(e.g. https://daliwears.vercel.app) in .env — see SETUP.md."
  );
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}
