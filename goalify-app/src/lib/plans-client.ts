"use client";

// Client-safe re-exports + Paddle price mapping using NEXT_PUBLIC envs only.
export { PLANS, PLAN_ORDER, getPlan, canCreateGoal, hasFeature } from "./plans";
export type { PlanId, Plan } from "./plans";
import type { PlanId } from "./plans";

export function planToPriceIdClient(plan: PlanId): string | null {
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
