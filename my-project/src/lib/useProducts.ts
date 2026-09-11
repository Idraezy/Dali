import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { Product } from "./types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setProducts((data ?? []) as Product[]);
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshIndex]);

  const refetch = useCallback(() => setRefreshIndex((i) => i + 1), []);

  return { products, loading, error, refetch };
}
