import type { DeliveryStatus } from "./types";

// Same stages as the app and the new storefront; "cancelled" sits outside the progress bar.
export const DELIVERY_STAGES: DeliveryStatus[] = [
  "processing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

export const DELIVERY_LABELS: Record<DeliveryStatus, string> = {
  processing: "Processing",
  shipped: "Shipped",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function formatTrackingDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { month: "short", day: "2-digit" });
}

export function formatTrackingTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", hour12: false });
}
