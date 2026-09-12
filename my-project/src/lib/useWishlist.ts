import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./useAuth";

export function useWishlist() {
  const { user } = useAuth();
  const [productIds, setProductIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!user) {
      setProductIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setProductIds(new Set((data ?? []).map((row) => row.product_id as number)));
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (productId: number) => {
      if (!user) return;
      if (productIds.has(productId)) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        setProductIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
        setProductIds((prev) => new Set(prev).add(productId));
      }
    },
    [user, productIds]
  );

  return { productIds, loading, toggle, refresh };
}
