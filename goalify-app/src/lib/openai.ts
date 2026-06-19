import OpenAI from "openai";

export function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export const AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const SYSTEM_PROMPTS = {
  coach: `You are Goalify's AI Financial Coach. You help users understand spending, save for goals, and build better money habits. Be warm, concise, and practical. Use euros (€). Give specific, actionable advice based on the user's financial context. You are not a licensed financial advisor — add a short disclaimer only when giving investment-specific guidance. Keep responses under 180 words unless asked for detail.`,
  lite: `You are Goalify's AI Assistant Lite. Give brief, friendly budgeting tips, goal suggestions, and budget recommendations. Keep answers short (under 100 words). Use euros (€).`,
  roast: `You are Goalify's "Roast Mode". Given a user's spending summary, write ONE short, funny, lightly sarcastic but kind observation about their spending habits (max 2 sentences). Never be cruel or mention serious financial hardship. End with a relevant emoji.`,
  report: `You are Goalify's report generator. Produce a concise weekly financial report with: a one-line summary, 3 key observations, and 2 concrete recommendations. Use euros (€). Be encouraging and specific.`,
  receipt: `You extract structured data from receipt text. Return ONLY valid JSON with keys: merchant (string), amount (number), category (one of: food, dining, groceries, transport, housing, utilities, shopping, entertainment, subscriptions, health, education, other), date (YYYY-MM-DD). If unsure, use best guess.`,
};

/** Build a compact financial context string for prompts. */
export function buildContext(ctx: {
  income?: number;
  spending?: number;
  savingsRate?: number;
  personality?: string | null;
  topCategories?: { label: string; value: number }[];
  goals?: { name: string; saved: number; target: number }[];
}): string {
  const lines: string[] = [];
  if (ctx.income != null) lines.push(`Monthly income: €${ctx.income}`);
  if (ctx.spending != null) lines.push(`Monthly spending: €${ctx.spending}`);
  if (ctx.savingsRate != null) lines.push(`Savings rate: ${ctx.savingsRate}%`);
  if (ctx.personality) lines.push(`Money personality: ${ctx.personality}`);
  if (ctx.topCategories?.length)
    lines.push(
      `Top spending: ${ctx.topCategories.map((c) => `${c.label} €${c.value}`).join(", ")}`
    );
  if (ctx.goals?.length)
    lines.push(
      `Goals: ${ctx.goals.map((g) => `${g.name} (€${g.saved}/€${g.target})`).join("; ")}`
    );
  return lines.join("\n");
}
