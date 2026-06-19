import { LegalShell } from "@/components/legal/LegalShell";

export const metadata = { title: "Privacy Policy — Goalify" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="June 2026">
      <p>
        This Privacy Policy explains how Goalify (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects,
        uses, and protects your information when you use our personal finance platform. This is a
        template and should be reviewed by legal counsel before production use.
      </p>
      <h2>Information we collect</h2>
      <p>
        Account information (name, email), financial data you enter (expenses, goals, income),
        and usage data. We do not connect to your bank accounts unless you explicitly enable an
        integration.
      </p>
      <h2>How we use your data</h2>
      <p>
        To provide analytics, AI coaching, and goal tracking. AI features may process your
        financial data to generate personalized recommendations. We never sell your data.
      </p>
      <h2>Data security</h2>
      <p>
        Data is encrypted in transit and at rest. Access is protected by authentication and
        row-level security policies so only you can read your data.
      </p>
      <h2>Your rights</h2>
      <p>
        You can export or permanently delete your data at any time from Settings. For EU users,
        GDPR rights apply.
      </p>
      <h2>Contact</h2>
      <p>For privacy questions, contact privacy@goalify.app.</p>
    </LegalShell>
  );
}
