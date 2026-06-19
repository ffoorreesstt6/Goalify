import { LegalShell } from "@/components/legal/LegalShell";

export const metadata = { title: "Cookie Policy — Goalify" };

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Policy" updated="June 2026">
      <p>
        This Cookie Policy explains how Goalify uses cookies and similar technologies. This is a
        template and should be reviewed by legal counsel before production use.
      </p>
      <h2>Essential cookies</h2>
      <p>
        We use essential cookies for authentication and session management. These are required for
        the app to function.
      </p>
      <h2>Analytics</h2>
      <p>
        We may use privacy-respecting analytics to understand usage and improve the product. You
        can opt out where applicable.
      </p>
      <h2>Managing cookies</h2>
      <p>You can control cookies through your browser settings.</p>
    </LegalShell>
  );
}
