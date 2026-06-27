import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { FinancialSnapshot } from "@/lib/scores";
import type { PersonalityId } from "@/lib/quiz";
import { PERSONALITIES } from "@/lib/quiz";
import type { PlanId } from "@/lib/plans";

function ruleBasedInsights(
  s: FinancialSnapshot,
  personality: PersonalityId | null
): string[] {
  const out: string[] = [];
  if (s.savingsRate >= 20) {
    out.push(`Strong work — you're saving ${s.savingsRate}% of your income this month.`);
  } else if (s.leftover < 0) {
    out.push(`You're spending more than you earn this month. Let's find ${Math.abs(Math.round(s.leftover))}€ to trim.`);
  } else {
    out.push(`Your savings rate is ${s.savingsRate}%. Nudging it to 20% builds momentum fast.`);
  }
  if (s.activeGoals === 0) {
    out.push("Set your first goal to give your savings a target to chase.");
  } else if (s.goalProgressAvg > 50) {
    out.push(`You're ${s.goalProgressAvg}% of the way through your goals on average. Keep going!`);
  }
  if (personality) {
    out.push(PERSONALITIES[personality].recommendations[0]);
  }
  return out.slice(0, 3);
}

export function AIInsights({
  snapshot,
  personality,
  plan,
}: {
  snapshot: FinancialSnapshot;
  personality: PersonalityId | null;
  plan: PlanId;
}) {
  const insights = ruleBasedInsights(snapshot, personality);

  return (
    <GlassCard strong className="flex flex-col">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-500" />
        <h3 className="font-semibold text-gray-900">AI Insights</h3>
      </div>
      <ul className="flex-1 space-y-3">
        {insights.map((t, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
            {t}
          </li>
        ))}
      </ul>
      <Link
        href="/ai"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
      >
        {plan === "free" ? "Unlock the AI Coach" : "Open AI Coach"}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </GlassCard>
  );
}
