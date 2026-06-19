"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { forgotPasswordAction } from "../actions";
import { Field, SubmitButton, FormMessage } from "@/components/auth/Field";
import { GlassCard } from "@/components/ui/GlassCard";

export default function ForgotPasswordPage() {
  const [state, action] = useFormState(forgotPasswordAction, null);

  return (
    <GlassCard strong>
      <h1 className="font-display text-2xl font-bold">Reset your password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
        <FormMessage state={state} />
        <SubmitButton>Send reset link</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-accent-purple hover:underline">
          Back to login
        </Link>
      </p>
    </GlassCard>
  );
}
