"use client";

import { useFormState } from "react-dom";
import { resetPasswordAction } from "../actions";
import { Field, SubmitButton, FormMessage } from "@/components/auth/Field";
import { GlassCard } from "@/components/ui/GlassCard";

export default function ResetPasswordPage() {
  const [state, action] = useFormState(resetPasswordAction, null);

  return (
    <GlassCard strong>
      <h1 className="font-display text-2xl font-bold">Set a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose a strong new password.</p>

      <form action={action} className="mt-6 space-y-4">
        <Field
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <Field
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter password"
        />
        <FormMessage state={state} />
        <SubmitButton>Update password</SubmitButton>
      </form>
    </GlassCard>
  );
}
