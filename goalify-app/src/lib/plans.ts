export type PlanId = "free" | "pro" | "premium" | "business";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // EUR / month
  tagline: string;
  features: string[];
  goalLimit: number; // -1 = unlimited
  highlight?: boolean;
  paddlePriceEnv?: string; // env var name holding the Paddle price id
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "Everything you need to start tracking.",
    goalLimit: 3,
    features: [
      "Expense tracking",
      "Daily, weekly, monthly analytics",
      "Yearly & 5-year analytics",
      "Spending categories",
      "Money personality profile",
      "Up to 3 goals",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 3,
    tagline: "Smarter saving with AI assistance.",
    goalLimit: -1,
    highlight: true,
    paddlePriceEnv: "NEXT_PUBLIC_PADDLE_PRICE_PRO",
    features: [
      "Unlimited goals",
      "AI Assistant Lite",
      "Spending predictions",
      "Budget & goal recommendations",
      "Budget alerts",
      "Advanced analytics",
      "Free for verified students",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 5,
    tagline: "Your personal AI financial coach.",
    goalLimit: -1,
    paddlePriceEnv: "NEXT_PUBLIC_PADDLE_PRICE_PREMIUM",
    features: [
      "Everything in Pro",
      "Advanced AI Financial Coach",
      "Premium AI assistant",
      "Personalized savings strategies",
      "Future spending forecasts",
      "Receipt scanner",
      "Priority support",
      "Premium reports & insights",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    price: 10,
    tagline: "Run the numbers for your business.",
    goalLimit: -1,
    paddlePriceEnv: "NEXT_PUBLIC_PADDLE_PRICE_BUSINESS",
    features: [
      "Business dashboard",
      "Revenue & expense tracking",
      "Profit calculations",
      "Monthly reports",
      "Team management",
      "Tax reports",
      "Business analytics",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "premium", "business"];

export function getPlan(id?: string | null): Plan {
  if (id && id in PLANS) return PLANS[id as PlanId];
  return PLANS.free;
}

export function canCreateGoal(planId: PlanId, currentGoalCount: number): boolean {
  const plan = PLANS[planId];
  if (plan.goalLimit === -1) return true;
  return currentGoalCount < plan.goalLimit;
}

export function hasFeature(planId: PlanId, feature: "ai_lite" | "ai_coach" | "receipt_scanner" | "business"): boolean {
  switch (feature) {
    case "ai_lite":
      return planId === "pro" || planId === "premium" || planId === "business";
    case "ai_coach":
      return planId === "premium" || planId === "business";
    case "receipt_scanner":
      return planId === "premium" || planId === "business";
    case "business":
      return planId === "business";
    default:
      return false;
  }
}
