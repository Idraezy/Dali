// Thin wrapper around Paystack's inline popup script (loaded from their CDN),
// avoiding a React wrapper package so we aren't pinned to a peer-dependency
// range that lags behind React 19.

interface PaystackHandlerOptions {
  key: string;
  email: string;
  amount: number; // kobo
  currency?: string;
  ref: string;
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

interface PaystackPopInterface {
  setup(options: {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref: string;
    metadata?: Record<string, unknown>;
    callback: (response: { reference: string }) => void;
    onClose: () => void;
  }): { openIframe(): void };
}

declare global {
  interface Window {
    PaystackPop?: PaystackPopInterface;
  }
}

const SCRIPT_SRC = "https://js.paystack.co/v1/inline.js";
let loadPromise: Promise<void> | null = null;

function loadPaystackScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack checkout script."));
    document.body.appendChild(script);
  });

  return loadPromise;
}

export async function openPaystackCheckout(options: PaystackHandlerOptions): Promise<void> {
  await loadPaystackScript();
  if (!window.PaystackPop) {
    throw new Error("Paystack failed to load. Check your connection and try again.");
  }

  const handler = window.PaystackPop.setup({
    key: options.key,
    email: options.email,
    amount: options.amount,
    currency: options.currency ?? "NGN",
    ref: options.ref,
    metadata: options.metadata,
    callback: (response) => options.onSuccess(response.reference),
    onClose: options.onCancel,
  });

  handler.openIframe();
}
