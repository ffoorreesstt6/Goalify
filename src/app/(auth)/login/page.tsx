"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useSearchParams } from "next/navigation";
import { loginAction } from "../actions";
import { Field, SubmitButton, FormMessage } from "@/components/auth/Field";

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const urlError = params.get("error");
  const [state, action] = useFormState(loginAction, urlError ? { error: urlError } : null);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-soft-md">
      <h1 className="font-display text-2xl font-bold text-gray-900">Welcome back</h1>
      <p className="mt-1 text-sm text-gray-500">Log in to your Goalify account.</p>

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="redirect" value={redirect} />
        <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
        <Field label="Password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" />
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <FormMessage state={state} />
        <SubmitButton>Log in</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
