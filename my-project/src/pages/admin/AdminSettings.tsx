import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import type { CoinSettings, StoreSettings } from "../../lib/types";

const INPUT_CLASS =
  "w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B]";

const EMPTY_COINS = {
  checkin_coins: "",
  streak_bonus_coins: "",
  order_coins_per_1000: "",
  referral_coins: "",
  naira_per_coin: "",
  min_redeem_coins: "",
  payout_schedule: "",
};

type CoinForm = typeof EMPTY_COINS;

const COIN_FIELDS: { key: keyof CoinForm; label: string; hint?: string; numeric?: boolean }[] = [
  { key: "checkin_coins", label: "Coins per daily check-in", numeric: true },
  { key: "streak_bonus_coins", label: "Bonus on every 7th day of a streak", numeric: true },
  { key: "order_coins_per_1000", label: "Coins per ₦1,000 spent", hint: "Paid when an order is delivered.", numeric: true },
  { key: "referral_coins", label: "Coins per referral", hint: "Paid when the invited friend's first order is delivered.", numeric: true },
  { key: "naira_per_coin", label: "Value of 1 coin (₦)", hint: "Leave empty until decided — the app shows “coming soon”.", numeric: true },
  { key: "min_redeem_coins", label: "Minimum coins to cash out", hint: "Leave empty until decided.", numeric: true },
  { key: "payout_schedule", label: "Payout date", hint: "e.g. “Last Friday of every month”. Leave empty until decided." },
];

function toCoinForm(c: CoinSettings): CoinForm {
  return {
    checkin_coins: String(c.checkin_coins),
    streak_bonus_coins: String(c.streak_bonus_coins),
    order_coins_per_1000: String(c.order_coins_per_1000),
    referral_coins: String(c.referral_coins),
    naira_per_coin: c.naira_per_coin == null ? "" : String(c.naira_per_coin),
    min_redeem_coins: c.min_redeem_coins == null ? "" : String(c.min_redeem_coins),
    payout_schedule: c.payout_schedule ?? "",
  };
}

const optionalNumber = (v: string) => (v.trim() === "" ? null : Number(v));

function AdminSettings() {
  const [form, setForm] = useState({
    whatsapp_number: "",
    contact_email: "",
    contact_phone: "",
    android_app_url: "",
    ios_app_url: "",
  });
  const [coins, setCoins] = useState<CoinForm>(EMPTY_COINS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [coinsSaving, setCoinsSaving] = useState(false);
  const [coinsSaved, setCoinsSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("store_settings").select("*").eq("id", 1).single(),
      supabase.from("coin_settings").select("*").eq("id", 1).single(),
    ]).then(([{ data }, { data: coinData }]) => {
      if (data) {
        const s = data as StoreSettings;
        setForm({
          whatsapp_number: s.whatsapp_number,
          contact_email: s.contact_email,
          contact_phone: s.contact_phone,
          android_app_url: s.android_app_url ?? "",
          ios_app_url: s.ios_app_url ?? "",
        });
      }
      if (coinData) setCoins(toCoinForm(coinData as CoinSettings));
      setLoading(false);
    });
  }, []);

  const handleCoinsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCoinsSaving(true);
    setCoinsSaved(false);
    const { error } = await supabase
      .from("coin_settings")
      .update({
        checkin_coins: Number(coins.checkin_coins),
        streak_bonus_coins: Number(coins.streak_bonus_coins),
        order_coins_per_1000: Number(coins.order_coins_per_1000),
        referral_coins: Number(coins.referral_coins),
        naira_per_coin: optionalNumber(coins.naira_per_coin),
        min_redeem_coins: optionalNumber(coins.min_redeem_coins),
        payout_schedule: coins.payout_schedule.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    setCoinsSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    setCoinsSaved(true);
    setTimeout(() => setCoinsSaved(false), 3000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from("store_settings")
      .update({
        ...form,
        android_app_url: form.android_app_url.trim() || null,
        ios_app_url: form.ios_app_url.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-10">
        <Loader2 className="animate-spin" /> Loading settings...
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Store Settings</h2>
      <p className="text-gray-400 text-sm mb-6 max-w-xl">
        These details are used across the storefront (WhatsApp checkout, contact page, footer)
        instead of being hardcoded in the code.
      </p>

      <form onSubmit={handleSubmit} className="bg-[#001D23] rounded-xl p-6 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-semibold mb-1">
            WhatsApp Number (international format, no + or spaces)
          </label>
          <input
            value={form.whatsapp_number}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
            className="w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B]"
            placeholder="2349164288560"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Contact Email</label>
          <input
            type="email"
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            className="w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Contact Phone (display format)</label>
          <input
            value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
            className="w-full bg-[#002A35] p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00DA6B]"
            placeholder="+234 (0)916 428 8560"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Google Play Link (optional)</label>
          <input
            type="url"
            value={form.android_app_url}
            onChange={(e) => setForm({ ...form, android_app_url: e.target.value })}
            className={INPUT_CLASS}
            placeholder="https://play.google.com/store/apps/details?id=…"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">App Store Link (optional)</label>
          <input
            type="url"
            value={form.ios_app_url}
            onChange={(e) => setForm({ ...form, ios_app_url: e.target.value })}
            className={INPUT_CLASS}
            placeholder="https://apps.apple.com/app/…"
          />
          <p className="text-xs text-gray-500 mt-1">
            The site's Get App page says "coming soon" until a link is added.
          </p>
        </div>

        {saved && <p className="text-[#00DA6B] text-sm">Settings saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#00DA6B] text-black font-bold py-3 rounded-lg hover:bg-[#1d9948] transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>

      <h2 className="text-2xl font-bold mt-12 mb-2">Dali Coins</h2>
      <p className="text-gray-400 text-sm mb-6 max-w-xl">
        How many coins customers earn in the app, and what coins are worth. Changes apply from the
        next coins earned.
      </p>

      <form onSubmit={handleCoinsSubmit} className="bg-[#001D23] rounded-xl p-6 space-y-4 max-w-xl">
        {COIN_FIELDS.map(({ key, label, hint, numeric }) => (
          <div key={key}>
            <label className="block text-sm font-semibold mb-1">{label}</label>
            <input
              type={numeric ? "number" : "text"}
              min={numeric ? 0 : undefined}
              step={key === "naira_per_coin" ? "0.01" : undefined}
              value={coins[key]}
              onChange={(e) => setCoins({ ...coins, [key]: e.target.value })}
              className={INPUT_CLASS}
            />
            {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
          </div>
        ))}

        {coinsSaved && <p className="text-[#00DA6B] text-sm">Coin settings saved.</p>}

        <button
          type="submit"
          disabled={coinsSaving}
          className="w-full bg-[#00DA6B] text-black font-bold py-3 rounded-lg hover:bg-[#1d9948] transition disabled:opacity-60"
        >
          {coinsSaving ? "Saving..." : "Save Coin Settings"}
        </button>
      </form>
    </div>
  );
}

export default AdminSettings;
