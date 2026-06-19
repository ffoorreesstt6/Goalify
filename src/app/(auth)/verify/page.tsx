"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { resendVerificationAction } from "../actions";
import { SubmitButton, FormMessage } from "@/components/auth/Field";
import { GlassCard } from "@/components/ui/GlassCard";

function VerifyInner() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [state, action] = useFormState(resendVerificationAction, null);

  return (
    <GlassCard strong className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 ring-1 ring-white/10">
        <MailCheck className="h-7 w-7 text-accent-purple" />
      </div>
      <h1 className="font-display text-2xl font-bold">Check your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a verification link to{" "}
        <span className="font-medium text-foreground">{email || "your email"}</span>. Click it
        to activate your account and start onboarding.
      </p>

      <form action={action} className="mt-6 space-y-3">
        <input type="hidden" name="email" value={email} />
        <FormMessage state={state} />
        <SubmitButton>Resend verification email</SubmitButton>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-accent-purple hover:underline">
          Back to login
        </Link>
      </p>
    </GlassCard>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyInner />
    </Suspense>
  );
}
