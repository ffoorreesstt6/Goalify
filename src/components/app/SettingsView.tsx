"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Bell,
  GraduationCap,
  Palette,
  Shield,
  Download,
  Trash2,
  CreditCard,
  LifeBuoy,
  Languages,
  Link2,
  Loader2,
  Check,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Profile } from "@/lib/types";
import {
  updateProfileAction,
  changePasswordAction,
  updateNotificationsAction,
  requestStudentVerificationAction,
  exportDataAction,
  deleteAccountAction,
} from "@/app/(app)/settings/actions";

const SECTIONS = [
  { id: "profile", label: "Edit Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "student", label: "Student Verification", icon: GraduationCap },
  { id: "billing", label: "Billing & Subscription", icon: CreditCard },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "language", label: "Language", icon: Languages },
  { id: "connected", label: "Connected Accounts", icon: Link2 },
  { id: "privacy", label: "Privacy & Legal", icon: Shield },
  { id: "data", label: "Export Data", icon: Download },
  { id: "support", label: "Support Center", icon: LifeBuoy },
  { id: "danger", label: "Delete Account", icon: Trash2 },
];

function Saved({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1 text-sm text-emerald-500">
      <Check className="h-4 w-4" /> Saved
    </span>
  );
}

export function SettingsView({ profile }: { profile: Profile }) {
  const [section, setSection] = useState("profile");

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
              section === s.id
                ? "bg-brand-50 text-foreground ring-0"
                : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
            }`}
          >
            <s.icon className="h-4 w-4 shrink-0" />
            {s.label}
          </button>
        ))}
      </nav>

      <div>
        {section === "profile" && <ProfileSection profile={profile} />}
        {section === "security" && <SecuritySection />}
        {section === "notifications" && <NotificationsSection profile={profile} />}
        {section === "student" && <StudentSection profile={profile} />}
        {section === "billing" && <BillingLinkSection />}
        {section === "theme" && <ThemeSection />}
        {section === "language" && <LanguageSection />}
        {section === "connected" && <ConnectedSection />}
        {section === "privacy" && <PrivacySection />}
        {section === "data" && <DataSection />}
        {section === "support" && <SupportSection />}
        {section === "danger" && <DangerSection />}
      </div>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        {...rest}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-accent-purple/60"
      />
    </label>
  );
}

function ProfileSection({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.full_name ?? "");
  const [income, setIncome] = useState(String(profile.monthly_income ?? 0));
  const [currency, setCurrency] = useState(profile.currency ?? "EUR");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <GlassCard>
      <h2 className="font-display text-xl font-bold">Edit Profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">Update your personal details.</p>
      <div className="mt-5 space-y-4">
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" value={profile.email ?? ""} disabled />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Monthly income (€)"
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-accent-purple/60"
            >
              {["EUR", "USD", "GBP"].map((c) => (
                <option key={c} value={c} className="bg-card">
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              start(async () => {
                setError(null);
                const res = await updateProfileAction({
                  full_name: name,
                  monthly_income: Number(income || 0),
                  currency,
                });
                if (res?.error) setError(res.error);
                else {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                }
              })
            }
            disabled={pending}
            className="btn-primary text-sm"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save changes
          </button>
          <Saved show={saved} />
        </div>
      </div>
    </GlassCard>
  );
}

function SecuritySection() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ error?: string; ok?: boolean } | null>(null);

  return (
    <GlassCard>
      <h2 className="font-display text-xl font-bold">Security</h2>
      <p className="mt-1 text-sm text-muted-foreground">Change your password.</p>
      <div className="mt-5 space-y-4">
        <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {msg?.error && <p className="text-sm text-red-500">{msg.error}</p>}
        {msg?.ok && <p className="text-sm text-emerald-500">Password updated.</p>}
        <button
          onClick={() =>
            start(async () => {
              const res = await changePasswordAction({ password, confirm });
              if (res?.error) setMsg({ error: res.error });
              else {
                setMsg({ ok: true });
                setPassword("");
                setConfirm("");
              }
            })
          }
          disabled={pending}
          className="btn-primary text-sm"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Update password
        </button>
      </div>
    </GlassCard>
  );
}

function NotificationsSection({ profile }: { profile: Profile }) {
  const initial = (profile as any).notification_prefs ?? {
    weekly_report: true,
    budget_alerts: true,
    goal_updates: true,
    product_news: false,
  };
  const [prefs, setPrefs] = useState<Record<string, boolean>>(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const items = [
    { key: "weekly_report", label: "Weekly AI reports" },
    { key: "budget_alerts", label: "Budget alerts" },
    { key: "goal_updates", label: "Goal progress updates" },
    { key: "product_news", label: "Product news & tips" },
  ];

  return (
    <GlassCard>
      <h2 className="font-display text-xl font-bold">Notifications</h2>
      <div className="mt-5 space-y-3">
        {items.map((it) => (
          <label key={it.key} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-sm">{it.label}</span>
            <button
              onClick={() => setPrefs((p) => ({ ...p, [it.key]: !p[it.key] }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                prefs[it.key] ? "bg-gradient-to-r from-brand-500 to-brand-700" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  prefs[it.key] ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        ))}
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              start(async () => {
                await updateNotificationsAction(prefs);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              })
            }
            disabled={pending}
            className="btn-primary text-sm"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save preferences
          </button>
          <Saved show={saved} />
        </div>
      </div>
    </GlassCard>
  );
}

function StudentSection({ profile }: { profile: Profile }) {
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  if (profile.student_verified) {
    return (
      <GlassCard>
        <h2 className="font-display text-xl font-bold">Student Verification</h2>
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-500">
          <Check className="h-4 w-4" /> Verified — you have Pro for free!
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <h2 className="font-display text-xl font-bold">Student Verification</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Verify your student status to unlock Pro for free.
      </p>
      <div className="mt-5 space-y-4">
        <Input label="Institution" value={institution} onChange={(e) => setInstitution(e.target.value)} />
        <Input
          label="Student email (.edu / .ac)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {msg && <p className="text-sm text-emerald-500">{msg}</p>}
        <button
          onClick={() =>
            start(async () => {
              const res = await requestStudentVerificationAction({
                institution,
                student_email: email,
              });
              if (res?.error) setMsg(res.error);
              else setMsg("Request submitted! We'll review it shortly.");
            })
          }
          disabled={pending || !institution || !email}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Submit for verification
        </button>
      </div>
    </GlassCard>
  );
}

function BillingLinkSection() {
  return (
    <GlassCard>
      <h2 className="font-display text-xl font-bold">Billing & Subscription</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your plan, payment methods and billing history.
      </p>
      <Link href="/billing" className="btn-primary mt-5 text-sm">
        Go to Billing
      </Link>
    </GlassCard>
  );
}

function ThemeSection() {
  return (
    <GlassCard>
      <h2 className="font-display text-xl font-bold">Theme</h2>
      <p className="mt-1 text-sm text-muted-foreground">Goalify uses a premium dark theme by default.</p>
      <div className="mt-5 flex gap-3">
        <div className="flex-1 rounded-xl border border-accent-purple/60 bg-gray-50 p-4 text-center ring-1 ring-accent-purple/40">
          <div className="mx-auto mb-2 h-12 w-full rounded-lg bg-gradient-to-br from-blue-600 to-purple-700" />
          <span className="text-sm font-medium">Dark (default)</span>
        </div>
        <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 p-4 text-center opacity-50">
          <div className="mx-auto mb-2 h-12 w-full rounded-lg bg-gradient-to-br from-slate-200 to-slate-400" />
          <span className="text-sm font-medium">Light (soon)</span>
        </div>
      </div>
    </GlassCard>
  );
}

function LanguageSection() {
  const [lang, setLang] = useState("en");
  return (
    <GlassCard>
      <h2 className="font-display text-xl font-bold">Language</h2>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-accent-purple/60"
      >
        {[
          ["en", "English"],
          ["de", "Deutsch"],
          ["es", "Español"],
          ["fr", "Français"],
          ["sq", "Shqip"],
        ].map(([v, l]) => (
          <option key={v} value={v} className="bg-card">
            {l}
          </option>
        ))}
      </select>
    </GlassCard>
  );
}

function ConnectedSection() {
  return (
    <GlassCard>
      <h2 className="font-display text-xl font-bold">Connected Accounts</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Connect external accounts to enrich your insights (coming soon).
      </p>
      <div className="mt-5 space-y-3">
        {["Google", "Apple", "Bank (Open Banking)"].map((p) => (
          <div key={p} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-sm">{p}</span>
            <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-muted-foreground">
              Connect
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function PrivacySection() {
  return (
    <GlassCard>
      <h2 className="font-display text-xl font-bold">Privacy & Legal</h2>
      <div className="mt-5 space-y-2">
        {[
          ["Privacy Policy", "/legal/privacy"],
          ["Terms of Service", "/legal/terms"],
          ["Cookie Policy", "/legal/cookies"],
        ].map(([l, h]) => (
          <Link
            key={h}
            href={h}
            className="block rounded-xl bg-gray-50 px-4 py-3 text-sm transition-colors hover:bg-gray-100"
          >
            {l} →
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}

function DataSection() {
  const [pending, start] = useTransition();
  return (
    <GlassCard>
      <h2 className="font-display text-xl font-bold">Export Data</h2>
      <p className="mt-1 text-sm text-muted-foreground">Download all your Goalify data as JSON.</p>
      <button
        onClick={() =>
          start(async () => {
            const res = await exportDataAction();
            if (res?.success) {
              const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "goalify-data.json";
              a.click();
              URL.revokeObjectURL(url);
            }
          })
        }
        disabled={pending}
        className="btn-primary mt-5 text-sm"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Export my data
      </button>
    </GlassCard>
  );
}

function SupportSection() {
  return (
    <GlassCard>
      <h2 className="font-display text-xl font-bold">Support Center</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Need help? We&apos;re here for you.
      </p>
      <div className="mt-5 space-y-3 text-sm">
        <a href="mailto:support@goalify.app" className="block rounded-xl bg-gray-50 px-4 py-3 hover:bg-gray-100">
          📧 Email support@goalify.app
        </a>
        <Link href="/#faq" className="block rounded-xl bg-gray-50 px-4 py-3 hover:bg-gray-100">
          ❓ Browse the FAQ
        </Link>
      </div>
    </GlassCard>
  );
}

function DangerSection() {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();

  return (
    <GlassCard className="border border-red-500/30">
      <h2 className="font-display text-xl font-bold text-red-500">Delete Account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        This permanently deletes your account and all data. This cannot be undone. Type{" "}
        <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm.
      </p>
      <Input label="" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" />
      <button
        onClick={() => start(async () => { await deleteAccountAction(); router.push("/"); })}
        disabled={pending || confirm !== "DELETE"}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-500/90 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-40"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Permanently delete account
      </button>
    </GlassCard>
  );
}
