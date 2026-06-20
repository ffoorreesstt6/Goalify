// ============================================================
// Goalify AI Edge Function (Deno) — secure OpenAI proxy
// Enforces per-plan daily message limits. Holds the OpenAI key
// server-side (never exposed to the browser).
//
// Deploy:
//   supabase functions deploy ai --no-verify-jwt
//   supabase secrets set OPENAI_API_KEY=sk-...
// (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.)
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LIMITS: Record<string, number> = { free: 5, pro: 50, premium: Infinity, business: Infinity };
const MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

const SYS: Record<string, string> = {
  coach: "You are Goalify's AI Financial Coach. Warm, concise, practical. Use euros (€). Give specific, actionable advice from the user's financial context. Not a licensed advisor — add a short disclaimer only for investment-specific guidance. Under 180 words.",
  lite: "You are Goalify's AI Assistant Lite. Brief, friendly budgeting tips and goal suggestions. Under 100 words. Use euros (€).",
  roast: "You are Goalify Roast Mode. Given a spending summary, write ONE short, funny, lightly sarcastic but kind line (max 2 sentences) about their habits. Never cruel. End with an emoji.",
  report: "You are Goalify's report generator. Produce a concise weekly report: one-line summary, 3 observations, 2 recommendations. Use euros (€). Encouraging and specific.",
};

function j(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return j({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  // Identify the caller from their JWT
  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace("Bearer ", "");
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userData?.user) return j({ error: "Unauthorized" }, 401);
  const user = userData.user;

  // Load plan
  const { data: profile } = await admin.from("profiles").select("plan, personality, monthly_income, monthly_savings, budget").eq("id", user.id).single();
  const plan = profile?.plan ?? "free";
  const limit = LIMITS[plan] ?? 5;

  // Check today's usage
  const today = new Date().toISOString().slice(0, 10);
  const { data: usageRow } = await admin.from("ai_usage").select("count").eq("user_id", user.id).eq("day", today).maybeSingle();
  const used = usageRow?.count ?? 0;
  if (used >= limit) {
    return j({ error: `Daily AI limit reached (${limit}/day on the ${plan} plan). Upgrade for more.`, limit, used, remaining: 0 }, 429);
  }

  if (!openaiKey) return j({ error: "AI is not configured yet: set OPENAI_API_KEY with `supabase secrets set`." }, 500);

  let payload: { messages?: { role: string; content: string }[]; mode?: string };
  try { payload = await req.json(); } catch { return j({ error: "Invalid JSON" }, 400); }
  const mode = payload.mode || "coach";
  const messages = payload.messages || [];

  // Build context from real profile data
  const ctxParts: string[] = [];
  if (profile?.monthly_income) ctxParts.push(`Monthly income: €${profile.monthly_income}`);
  if (profile?.monthly_savings) ctxParts.push(`Monthly savings: €${profile.monthly_savings}`);
  if (profile?.personality) ctxParts.push(`Money personality: ${profile.personality}`);
  if (profile?.budget) ctxParts.push(`Monthly budget by category: ${JSON.stringify(profile.budget)}`);
  const system = `${SYS[mode] ?? SYS.coach}\n\nUser financial context:\n${ctxParts.join("\n")}`;

  // Call OpenAI
  let reply = "";
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: system }, ...messages],
        temperature: mode === "roast" ? 0.9 : 0.6,
        max_tokens: mode === "roast" ? 80 : 500,
      }),
    });
    const data = await r.json();
    if (!r.ok) return j({ error: data?.error?.message || "OpenAI request failed" }, 502);
    reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
  } catch (e) {
    return j({ error: String(e) }, 500);
  }

  // Increment usage (upsert)
  await admin.from("ai_usage").upsert(
    { user_id: user.id, day: today, count: used + 1 },
    { onConflict: "user_id,day" }
  );

  return j({ reply, limit: limit === Infinity ? null : limit, used: used + 1, remaining: limit === Infinity ? null : limit - used - 1 });
});
