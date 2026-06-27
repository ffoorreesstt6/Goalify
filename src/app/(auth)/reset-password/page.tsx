"use client";

import { useFormState } from "react-dom";
import { resetPasswordAction } from "../actions";
import { Field, SubmitButton, FormMessage } from "@/components/auth/Field";

export default function ResetPasswordPage() {
  const [state, action] = useFormState(resetPasswordAction, null);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-soft-md">
      <h1 className="font-display text-2xl font-bold text-gray-900">Set a new password</h1>
      <p className="mt-1 text-sm text-gray-500">Choose a strong new password.</p>

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
    </div>
  );
}
