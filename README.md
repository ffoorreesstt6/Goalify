# Goalify

AI-powered personal finance & goal-tracking SaaS. Built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase, OpenAI, and Paddle.

> Turn Every Euro Into Progress.

## Features

- Premium dark-mode UI with blue/purple gradients, glassmorphism and animations
- Secure auth (Supabase): login, signup, email verification, forgot/reset password, sessions, anti-spam honeypot
- Onboarding quiz → money personality + personalized recommendations
- Dashboard: income, spending, leftover, savings rate, goals, **Goalify Score** & **Money Health Score**
- Analytics: daily / weekly / monthly / yearly / 5-year charts + category breakdown
- Goals system with plan-based limits (Free = 3, paid = unlimited)
- AI Coach (OpenAI): assistant, coaching, **Roast Mode**, weekly insights, receipt scanner
- Future Simulator: project savings, goal dates and growth
- Challenges, XP, levels & badges; streaks
- Subscription detector (Netflix, Spotify, ChatGPT, …)
- Full Settings (profile, security, notifications, student verification, data export, delete account, …)
- Paddle billing: Free / Pro €3 / Premium €5 / Business €10, upgrade & cancel, webhooks
- Hidden, secure **Admin Panel** (credentials stored hashed in the DB, not in the frontend)

## 1. Install

```bash
npm install
```

## 2. Environment

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

At minimum you need the two Supabase values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

OpenAI, Paddle and the admin bootstrap values are optional for first run — the
app degrades gracefully (AI shows rule-based fallbacks, billing shows a notice).

## 3. Database

In the Supabase dashboard → SQL Editor, run the contents of:

```
supabase/schema.sql
```

This creates all tables, row-level-security policies, the auto-profile trigger,
and the `award_xp` function.

### Email verification
In Supabase → Authentication → URL Configuration, set the Site URL to your app
URL and add `…/auth/callback` as a redirect URL.

## 4. Run

```bash
npm run dev
```

Open http://localhost:3000

## 5. Admin panel

- The hidden admin entry is the faint `·` at the very bottom-right of the
  landing-page footer, or go directly to `/admin/login`.
- On first login the app bootstraps an admin from `ADMIN_BOOTSTRAP_EMAIL` /
  `ADMIN_BOOTSTRAP_PASSWORD`. **Change these after first login** from the admin
  panel. Credentials are stored as scrypt hashes in the `admin_users` table and
  are never exposed to the frontend.

## 6. Paddle

1. Create products/prices in Paddle for Pro, Premium, Business.
2. Put the price IDs in `NEXT_PUBLIC_PADDLE_PRICE_*`.
3. Set `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`.
4. Add a webhook in Paddle pointing to `…/api/paddle/webhook`.

## Tech

Next.js 14 · TypeScript · Tailwind CSS · Supabase (Auth + Postgres + RLS) ·
OpenAI · Paddle · Recharts · Framer Motion.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run typecheck` — TypeScript check
- `npm run lint` — lint
