import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAI, AI_MODEL, SYSTEM_PROMPTS } from "@/lib/openai";
import { hasFeature, type PlanId } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  const plan = (profile?.plan ?? "free") as PlanId;
  if (!hasFeature(plan, "receipt_scanner")) {
    return NextResponse.json(
      { error: "Receipt scanning is a Premium feature.", upgrade: true },
      { status: 403 }
    );
  }

  const { imageBase64 } = (await req.json()) as { imageBase64?: string };
  if (!imageBase64) return NextResponse.json({ error: "No image provided" }, { status: 400 });

  const openai = getOpenAI();
  if (!openai) {
    return NextResponse.json({
      error: "Receipt scanning requires an OpenAI API key to be configured.",
      fallback: true,
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.receipt },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract the receipt data as JSON." },
            { type: "image_url", image_url: { url: imageBase64 } },
          ] as any,
        },
      ],
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    return NextResponse.json({ data: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to read receipt" }, { status: 500 });
  }
}
