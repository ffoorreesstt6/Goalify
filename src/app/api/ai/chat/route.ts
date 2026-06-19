import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAI, AI_MODEL, SYSTEM_PROMPTS, buildContext } from "@/lib/openai";
import { getPlan, hasFeature, type PlanId } from "@/lib/plans";
import { buildSnapshot } from "@/lib/scores";
import { categoryBreakdown } from "@/lib/analytics";
import type { Expense, Goal } from "@/lib/types";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
  };
  if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

  // Plan gating
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, personality, monthly_income")
    .eq("id", user.id)
    .single();
  const plan = (profile?.plan ?? "free") as PlanId;

  if (!hasFeature(plan, "ai_lite")) {
    return NextResponse.json(
      { error: "AI Assistant is available on Pro and above. Upgrade to unlock it.", upgrade: true },
      { status: 403 }
    );
  }

  const isCoach = hasFeature(plan, "ai_coach");
  const systemPrompt = isCoach ? SYSTEM_PROMPTS.coach : SYSTEM_PROMPTS.lite;

  // Build financial context
  const { data: expenses } = await supabase.from("expenses").select("*").eq("user_id", user.id).limit(500);
  const { data: goals } = await supabase.from("goals").select("*").eq("user_id", user.id);
  const snapshot = buildSnapshot(profile?.monthly_income ?? 0, (expenses as Expense[]) ?? [], (goals as Goal[]) ?? []);
  const cats = categoryBreakdown((expenses as Expense[]) ?? []).slice(0, 5);

  const context = buildContext({
    income: snapshot.income,
    spending: snapshot.spending,
    savingsRate: snapshot.savingsRate,
    personality: profile?.personality,
    topCategories: cats.map((c) => ({ label: c.label, value: c.value })),
    goals: ((goals as Goal[]) ?? []).map((g) => ({ name: g.name, saved: g.saved_amount, target: g.target_amount })),
  });

  const openai = getOpenAI();
  if (!openai) {
    // Graceful fallback when no API key is configured.
    return NextResponse.json({
      content:
        "AI is not fully configured yet (missing OpenAI API key). Based on your data: " +
        (snapshot.savingsRate >= 20
          ? `you're saving ${snapshot.savingsRate}% — great work! Consider directing extra savings to your top goal.`
          : `your savings rate is ${snapshot.savingsRate}%. Try trimming your top category (${cats[0]?.label ?? "discretionary spending"}) to free up cash for goals.`),
      fallback: true,
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: `${systemPrompt}\n\nUser financial context:\n${context}` },
        ...messages,
      ],
      temperature: 0.6,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    // Log usage (best-effort)
    await supabase
      .from("ai_usage")
      .insert({ user_id: user.id, feature: isCoach ? "coach" : "lite", tokens: completion.usage?.total_tokens ?? 0 })
      .then(() => {}, () => {});

    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "AI request failed" }, { status: 500 });
  }
}
