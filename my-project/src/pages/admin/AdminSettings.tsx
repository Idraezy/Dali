import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import type { StoreSettings } from "../../lib/types";

function AdminSettings() {
  const [form, setForm] = useState({ whatsapp_number: "", contact_email: "", contact_phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) {
          const s = data as StoreSettings;
          setForm({
            whatsapp_number: s.whatsapp_number,
            contact_email: s.contact_email,
            contact_phone: s.contact_phone,
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from("store_settings")
      .update({ ...form, updated_at: new Date().toISOString() })
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

        {saved && <p className="text-[#00DA6B] text-sm">Settings saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#00DA6B] text-black font-bold py-3 rounded-lg hover:bg-[#1d9948] transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

export default AdminSettings;
