import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Footer } from "@/components/landing/Footer";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-10 flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back home
          </Link>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="prose-invert mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground">
          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
}
