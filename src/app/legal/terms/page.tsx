import { LegalShell } from "@/components/legal/LegalShell";

export const metadata = { title: "Terms of Service — Goalify" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="June 2026">
      <p>
        These Terms govern your use of Goalify. By creating an account you agree to them. This is
        a template and should be reviewed by legal counsel before production use.
      </p>
      <h2>Use of the service</h2>
      <p>
        Goalify provides financial tracking and AI-generated guidance for informational purposes
        only. It is not financial, investment, tax, or legal advice.
      </p>
      <h2>Subscriptions & billing</h2>
      <p>
        Paid plans are billed monthly through Paddle. You can upgrade, downgrade, or cancel at any
        time. Cancellations take effect at the end of the current billing period.
      </p>
      <h2>Acceptable use</h2>
      <p>
        You agree not to misuse the service, attempt to breach security, or use it for unlawful
        purposes.
      </p>
      <h2>Disclaimer</h2>
      <p>
        AI recommendations are estimates and may be inaccurate. Always verify important financial
        decisions independently.
      </p>
      <h2>Contact</h2>
      <p>For questions about these Terms, contact support@goalify.app.</p>
    </LegalShell>
  );
}
