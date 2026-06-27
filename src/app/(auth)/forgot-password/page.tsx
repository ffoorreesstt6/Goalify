"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { forgotPasswordAction } from "../actions";
import { Field, SubmitButton, FormMessage } from "@/components/auth/Field";

export default function ForgotPasswordPage() {
  const [state, action] = useFormState(forgotPasswordAction, null);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-soft-md">
      <h1 className="font-display text-2xl font-bold text-gray-900">Reset your password</h1>
      <p className="mt-1 text-sm text-gray-500">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
        <FormMessage state={state} />
        <SubmitButton>Send reset link</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
