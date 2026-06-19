import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAI, AI_MODEL, SYSTEM_PROMPTS } from "@/lib/openai";
import { categoryBreakdown } from "@/lib/analytics";
import type { Expense } from "@/lib/types";

const FALLBACK_ROASTS = [
  "Your top category this month is doing the heavy lifting on your bank account 💸",
  "Another month, another mysterious 'Other' expense category 🕵️",
  "Your savings account called. It's feeling neglected 📞",
];

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: expenses } = await supabase.from("expenses").select("*").eq("user_id", user.id).limit(500);
  const cats = categoryBreakdown((expenses as Expense[]) ?? []);
  const summary =
    cats.length > 0
      ? cats.slice(0, 4).map((c) => `${c.label}: €${c.value}`).join(", ")
      : "no spending logged yet";

  const openai = getOpenAI();
  if (!openai) {
    return NextResponse.json({
      roast: cats[0]
        ? `You spent €${cats[0].value} on ${cats[0].label.toLowerCase()} this month. Bold strategy 🍔`
        : FALLBACK_ROASTS[Math.floor(Math.random() * FALLBACK_ROASTS.length)],
      fallback: true,
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.roast },
        { role: "user", content: `This month's spending: ${summary}. Roast me.` },
      ],
      temperature: 0.9,
      max_tokens: 80,
    });
    return NextResponse.json({ roast: completion.choices[0]?.message?.content ?? FALLBACK_ROASTS[0] });
  } catch {
    return NextResponse.json({ roast: FALLBACK_ROASTS[0], fallback: true });
  }
}
