import type { PlanId } from "./plans";

/** Map Paddle price IDs (from env) to internal plan ids. */
export function priceIdToPlan(priceId: string): PlanId | null {
  const map: Record<string, PlanId> = {
    [process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO || ""]: "pro",
    [process.env.NEXT_PUBLIC_PADDLE_PRICE_PREMIUM || ""]: "premium",
    [process.env.NEXT_PUBLIC_PADDLE_PRICE_BUSINESS || ""]: "business",
  };
  return map[priceId] ?? null;
}

export function planToPriceId(plan: PlanId): string | null {
  switch (plan) {
    case "pro":
      return process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO || null;
    case "premium":
      return process.env.NEXT_PUBLIC_PADDLE_PRICE_PREMIUM || null;
    case "business":
      return process.env.NEXT_PUBLIC_PADDLE_PRICE_BUSINESS || null;
    default:
      return null;
  }
}

const PADDLE_API_BASE =
  process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";

/** Server-side Paddle API call. */
export async function paddleApi(path: string, init?: RequestInit) {
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new Error("PADDLE_API_KEY not configured");
  const res = await fetch(`${PADDLE_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paddle API ${res.status}: ${text}`);
  }
  return res.json();
}

export async function cancelPaddleSubscription(subscriptionId: string) {
  return paddleApi(`/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ effective_from: "next_billing_period" }),
  });
}
