import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side — Purple gradient panel */}
      <div className="auth-gradient-left hidden relative w-1/2 items-center justify-center px-12 lg:flex">
        <div className="relative z-10 max-w-md">
          <div className="mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none">
                <path
                  d="M12 2L4 7v10l8 5 8-5V7l-8-5z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 7v5l3.5 2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold leading-tight tracking-tight text-white">
            Reach your financial goals faster.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/70">
            AI-powered coaching, smart goal tracking, and insights that help you save more — effortlessly.
          </p>
          <div className="mt-8 space-y-4">
            {[
              "AI coach that knows your spending habits",
              "Smart goal tracking with real-time progress",
              "Personalized insights & savings strategies",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2 lg:px-12">
        <div className="absolute left-6 top-6 lg:hidden">
          <Logo />
        </div>
        <div className="w-full max-w-sm">{children}</div>
        <p className="mt-8 text-center text-xs text-gray-400">
          By continuing you agree to our{" "}
          <Link href="/legal/terms" className="underline hover:text-gray-600">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline hover:text-gray-600">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
