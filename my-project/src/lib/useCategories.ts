import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("products")
      .select("category")
      .then(({ data }) => {
        if (!active || !data) return;
        const unique = Array.from(new Set(data.map((row) => row.category as string))).sort();
        setCategories(unique);
      });
    return () => {
      active = false;
    };
  }, []);

  return categories;
}
