"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { resendVerificationAction } from "../actions";
import { SubmitButton, FormMessage } from "@/components/auth/Field";

function VerifyInner() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [state, action] = useFormState(resendVerificationAction, null);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-soft-md text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50">
        <MailCheck className="h-7 w-7 text-brand-500" />
      </div>
      <h1 className="font-display text-2xl font-bold text-gray-900">Check your email</h1>
      <p className="mt-2 text-sm text-gray-500">
        We sent a verification link to{" "}
        <span className="font-medium text-gray-900">{email || "your email"}</span>. Click it
        to activate your account and start onboarding.
      </p>

      <form action={action} className="mt-6 space-y-3">
        <input type="hidden" name="email" value={email} />
        <FormMessage state={state} />
        <SubmitButton>Resend verification email</SubmitButton>
      </form>

      <p className="mt-6 text-sm text-gray-500">
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyInner />
    </Suspense>
  );
}
