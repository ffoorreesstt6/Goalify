# Goalify — Production Setup Guide

## What you have

| File | Purpose |
|------|---------|
| `index.html` | App shell — loads Tailwind, Chart.js, and `app.js` |
| `app.js` | Full SPA (auth, quiz, dashboard, AI, admin, everything) |
| `vercel.json` | Vercel static deploy config (no build step needed) |
| `supabase/schema.sql` | Database tables, RLS, functions, storage buckets |
| `supabase/functions/ai/index.ts` | AI Edge Function (secure OpenAI proxy) |

---

## Step 1 — Run the database schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/jcskgasaocfueneyahrk)
2. Click **SQL Editor** → **New query**
3. Paste the entire contents of `supabase/schema.sql`
4. Click **Run**

This creates all tables, RLS policies, functions, and storage buckets.

---

## Step 2 — Make yourself an admin

After running the schema and **after you have signed up once** in the app, run this SQL:

```sql
update public.profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';
```

Replace `YOUR_EMAIL_HERE` with your actual email. This grants you access to the Admin Portal at `#admin`.

---

## Step 3 — Deploy the AI Edge Function

You need the [Supabase CLI](https://supabase.com/docs/guides/cli) installed.

```bash
# Install CLI (if not already)
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref jcskgasaocfueneyahrk

# Deploy the Edge Function
supabase functions deploy ai --no-verify-jwt
```

> The `--no-verify-jwt` flag is intentional — the function validates the JWT itself for full control.

---

## Step 4 — Set your OpenAI API key (server-side secret)

⚠️ **Never put the key in `app.js` or any file you commit.** It lives only on
Supabase as a secret. If a key was ever pasted in chat, a screenshot, or code,
revoke it at https://platform.openai.com/api-keys and create a new one first.

```bash
supabase secrets set OPENAI_API_KEY=sk-your-NEW-key-here
```

Optionally override the model (default: `gpt-4o-mini`, cheapest good option):

```bash
supabase secrets set OPENAI_MODEL=gpt-4o
```

### How the AI works

The browser calls the `ai` Edge Function, which holds the key and calls OpenAI.
There are two paths:

- **Logged-in users** — per-plan daily limits (Free 5, Pro 50, Premium/Business unlimited), context built from their real profile in the database.
- **Demo mode (no login)** — a global daily cap (`DEMO_DAILY_CAP = 200` in `functions/ai/index.ts`) keeps OpenAI costs bounded while you test. The financial context is sent from the browser (the demo profile). Lower the cap or set `USE_REAL_AI = false` in `app.js` to turn the live AI off.

If the function isn't deployed yet, the app automatically falls back to sample
coaching replies, so nothing looks broken.

---

## Step 5 — Deploy to Vercel

**Option A: Vercel Dashboard (easiest)**

1. Go to [vercel.com](https://vercel.com) and click **Add New → Project**
2. Import your GitHub repo (push this folder to GitHub first)
3. Vercel will auto-detect `vercel.json` — no settings to change
4. Click **Deploy**

**Option B: Vercel CLI**

```bash
npm install -g vercel
cd path/to/Goalify
vercel
```

Your app will be live at a `*.vercel.app` URL.

---

## Step 6 — Configure Supabase Auth redirect URLs

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g. `https://goalify.vercel.app`)
3. Add it to **Redirect URLs** too
4. Save

Without this, email verification and password reset links won't redirect properly.

---

## Plan limits reference

| Plan | Price | Goals | AI messages/day |
|------|-------|-------|-----------------|
| Free | €0/mo | 3 | 5 |
| Pro | €3/mo | Unlimited | 50 |
| Premium | €5/mo | Unlimited | Unlimited |
| Business | €10/mo | Unlimited | Unlimited |

Plans are upgraded via the Admin Portal (set plan on any user) or automatically via student verification approval.

---

## Admin Portal

Navigate to `/#admin` after logging in as an admin. Features:
- View all users and their plans
- Change any user's plan via dropdown
- Approve/reject student verification requests (auto-upgrades to Pro on approval)
- See total AI usage and MRR

---

## Troubleshooting

**"AI is not configured yet"** — Run Step 4 to set your OpenAI key.

**"Daily AI limit reached"** — Normal. Limits reset at midnight UTC. Upgrade the user's plan for more.

**Email verification not redirecting** — Check Step 6 (Supabase Auth redirect URLs).

**Admin portal says "Admins only"** — Make sure you ran the SQL in Step 2 with your exact email.

**Student verification not uploading** — Make sure you ran `schema.sql` which creates the `documents` storage bucket.
