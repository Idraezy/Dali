import { formatNaira } from "../lib/format";
import { hasActiveDiscount, salePrice } from "../lib/pricing";
import type { Product } from "../lib/types";

// The price a shopper pays, with the original struck through while a
// discount is running.
export default function PriceTag({ product, className = "" }: { product: Product; className?: string }) {
  const discounted = hasActiveDiscount(product);
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className={discounted ? "text-[#FF6B6B]" : "text-[#00DA6B]"}>{formatNaira(salePrice(product))}</span>
      {discounted && (
        <span className="text-[0.8em] font-normal text-gray-400 line-through">{formatNaira(product.price)}</span>
      )}
    </span>
  );
}
