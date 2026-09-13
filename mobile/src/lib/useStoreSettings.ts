import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { StoreSettings } from "./types";

const FALLBACK: StoreSettings = {
  id: 1,
  whatsapp_number: "2349164288560",
  contact_email: "faithlawrence161@gmail.com",
  contact_phone: "+234 (0)916 428 8560",
  updated_at: "",
};

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (!active) return;
        if (data) setSettings(data as StoreSettings);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading };
}
