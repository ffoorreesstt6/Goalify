// ============================================================
// Goalify AI Edge Function (Deno) — secure OpenAI proxy
// Holds the OpenAI key server-side (NEVER exposed to the browser).
//
// Two paths:
//   • Logged-in user  -> per-plan daily limits, context from their DB profile
//   • Demo (no login)  -> rate-limited GLOBAL daily cap to bound cost,
//                         context supplied by the client request
//
// Deploy:
//   supabase functions deploy ai --no-verify-jwt
//   supabase secrets set OPENAI_API_KEY=sk-...your NEW key...
// (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.)
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LIMITS: Record<string, number> = { free: 5, pro: 50, premium: Infinity, business: Infinity };
const DEMO_DAILY_CAP = 200;            // total demo calls per day across everyone (cost guard)
const MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

const SYS: Record<string, string> = {
  coach: "You are Goalify's AI Financial Coach. Warm, concise, practical. Use euros (€). Give specific, actionable advice from the user's financial context. Not a licensed advisor — add a short disclaimer only for investment-specific guidance. Under 180 words.",
  lite: "You are Goalify's AI Assistant Lite. Brief, friendly budgeting tips and goal suggestions. Under 100 words. Use euros (€).",
  roast: "You are Goalify Roast Mode. Given a spending summary, write ONE short, funny, lightly sarcastic but kind line (max 2 sentences) about their habits. Never cruel. End with an emoji.",
  report: "You are Goalify's report generator. Produce a concise weekly report: one-line summary, 3 observations, 2 recommendations. Use euros (€). Encouraging and specific.",
};
const TONE: Record<string, string> = {
  chill: "Speaking style: soft, supportive, low-pressure.",
  fun: "Speaking style: upbeat, motivational and energetic, an occasional emoji is fine.",
  strict: "Speaking style: direct and blunt, no fluff.",
  roast: "Speaking style: playful and lightly sarcastic, but never mean.",
};

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

function buildContext(parts: string[]): string {
  return parts.length ? `\n\nUser financial context:\n${parts.join("\n")}` : "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return j({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) return j({ error: "AI is not configured yet: run `supabase secrets set OPENAI_API_KEY=...`." }, 500);

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  let payload: { messages?: { role: string; content: string }[]; mode?: string; tone?: string; context?: Record<string, unknown> };
  try { payload = await req.json(); } catch { return j({ error: "Invalid JSON" }, 400); }
  const mode = payload.mode || "coach";
  const tone = payload.tone && TONE[payload.tone] ? `\n${TONE[payload.tone]}` : "";
  const messages = (payload.messages || []).slice(-12); // cap history -> cost guard

  // ---- identify caller (JWT optional) ----
  const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  let user = null;
  if (jwt) {
    const { data } = await admin.auth.getUser(jwt);
    user = data?.user ?? null;
  }

  let ctxParts: string[] = [];
  const today = new Date().toISOString().slice(0, 10);

  if (user) {
    // ---------- LOGGED-IN PATH ----------
    const { data: profile } = await admin.from("profiles")
      .select("plan, personality, monthly_income, monthly_savings, budget").eq("id", user.id).single();
    const plan = profile?.plan ?? "free";
    const limit = LIMITS[plan] ?? 5;
    const { data: usageRow } = await admin.from("ai_usage").select("count").eq("user_id", user.id).eq("day", today).maybeSingle();
    const used = usageRow?.count ?? 0;
    if (used >= limit) return j({ error: `Daily AI limit reached (${limit}/day on the ${plan} plan). Upgrade for more.`, limit, used, remaining: 0 }, 429);

    if (profile?.monthly_income) ctxParts.push(`Monthly income: €${profile.monthly_income}`);
    if (profile?.monthly_savings) ctxParts.push(`Monthly savings: €${profile.monthly_savings}`);
    if (profile?.personality) ctxParts.push(`Money personality: ${profile.personality}`);
    if (profile?.budget) ctxParts.push(`Monthly budget by category: ${JSON.stringify(profile.budget)}`);

    const reply = await callOpenAI(openaiKey, mode, tone, ctxParts, messages);
    if (reply.error) return j({ error: reply.error }, reply.status);
    await admin.from("ai_usage").upsert({ user_id: user.id, day: today, count: used + 1 }, { onConflict: "user_id,day" });
    return j({ reply: reply.text, limit: limit === Infinity ? null : limit, used: used + 1, remaining: limit === Infinity ? null : limit - used - 1 });
  }

  // ---------- DEMO PATH (no login) ----------
  const { data: dRow } = await admin.from("demo_ai_usage").select("count").eq("day", today).maybeSingle();
  const dUsed = dRow?.count ?? 0;
  if (dUsed >= DEMO_DAILY_CAP) return j({ error: "Demo AI is busy today — please try again tomorrow or sign in." }, 429);

  const c = payload.context || {};
  if (c.income) ctxParts.push(`Monthly income: €${c.income}`);
  if (c.savings) ctxParts.push(`Monthly savings: €${c.savings}`);
  if (c.personality) ctxParts.push(`Money personality: ${c.personality}`);
  if (c.budget) ctxParts.push(`This month's spend by category: ${JSON.stringify(c.budget)}`);

  const reply = await callOpenAI(openaiKey, mode, tone, ctxParts, messages);
  if (reply.error) return j({ error: reply.error }, reply.status);
  await admin.from("demo_ai_usage").upsert({ day: today, count: dUsed + 1 }, { onConflict: "day" });
  return j({ reply: reply.text, demo: true });
});

async function callOpenAI(key: string, mode: string, tone: string, ctxParts: string[], messages: { role: string; content: string }[]) {
  const system = `${SYS[mode] ?? SYS.coach}${tone}${buildContext(ctxParts)}`;
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: system }, ...messages],
        temperature: mode === "roast" ? 0.9 : 0.6,
        max_tokens: mode === "roast" ? 80 : 500,
      }),
    });
    const data = await r.json();
    if (!r.ok) return { error: data?.error?.message || "OpenAI request failed", status: 502 as number, text: "" };
    return { text: data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.", error: "", status: 200 };
  } catch (e) {
    return { error: String(e), status: 500 as number, text: "" };
  }
}
