import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { priceIdToPlan } from "@/lib/paddle";

export const runtime = "nodejs";

function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  // Format: "ts=1700000000;h1=abcdef..."
  const parts = Object.fromEntries(
    signatureHeader.split(";").map((kv) => kv.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;
  const signedPayload = `${ts}:${rawBody}`;
  const computed = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(h1));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  const signature = req.headers.get("paddle-signature");

  if (secret) {
    if (!verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type: string = event.event_type;
  const data = event.data ?? {};
  const supabase = createAdminClient();

  // user_id should be passed as custom_data at checkout time.
  const userId: string | undefined = data?.custom_data?.user_id;

  try {
    if (type === "subscription.created" || type === "subscription.updated" || type === "subscription.activated") {
      const priceId: string | undefined = data?.items?.[0]?.price?.id;
      const plan = priceId ? priceIdToPlan(priceId) : null;
      const status = data?.status;

      if (userId && plan && (status === "active" || status === "trialing")) {
        await supabase.from("profiles").update({ plan }).eq("id", userId);
      }

      if (userId) {
        await supabase.from("billing_subscriptions").upsert(
          {
            user_id: userId,
            paddle_subscription_id: data.id,
            paddle_customer_id: data.customer_id,
            plan: plan ?? "free",
            status,
            current_period_end: data?.current_billing_period?.ends_at ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "paddle_subscription_id" }
        );
      }
    }

    if (type === "subscription.canceled") {
      if (userId) {
        await supabase.from("profiles").update({ plan: "free" }).eq("id", userId);
        await supabase
          .from("billing_subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("paddle_subscription_id", data.id);
      }
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
