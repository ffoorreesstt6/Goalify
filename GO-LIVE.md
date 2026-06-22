# Goalify — Go-Live: Google Sign-in + Verification Email

The code is ready. These steps are done in **your** Supabase + Google dashboards (I can't enter
secret keys for you). Do them in order. ~20 minutes.

---

## 0) One thing first: Google sign-in needs a real URL
Google OAuth **will not work from a file:// page** (double-clicking index.html). You need the site
served from a real address. Easiest options:
- **Local test:** in the Goalify folder run `python -m http.server 5173` → open http://localhost:5173
- **Live:** deploy the folder to Vercel/Netlify → you get e.g. `https://goalify.vercel.app`

Use whichever URL you'll actually run on in the steps below (you can add both).

---

## 1) Confirm the Supabase project is yours
Open `app.js` (lines 6–7) and check these match YOUR project
(Supabase → Project Settings → API):
```
const SUPABASE_URL  = "https://jcskgasaocfueneyahrk.supabase.co";
const SUPABASE_ANON = "eyJ...";   // the public anon key
```
If they're not your project, paste your own Project URL + anon (public) key here.

## 2) Run the database schema (if not already)
Supabase → **SQL Editor** → New query → paste all of `supabase/schema.sql` → **Run**.

## 3) Set the auth URLs
Supabase → **Authentication → URL Configuration**:
- **Site URL:** your main URL (e.g. `https://goalify.vercel.app` or `http://localhost:5173`)
- **Redirect URLs:** add both:
  - `https://goalify.vercel.app`
  - `http://localhost:5173`

## 4) Turn on the verification email
Supabase → **Authentication → Providers → Email**:
- Enable **"Confirm email"** (ON).
Supabase → **Authentication → Email Templates → "Confirm signup"**:
- Paste the contents of `supabase/email-templates/confirm-signup.html`.
- In that template replace `LOGO_URL` with a public link to the logo. Quickest: Supabase →
  **Storage** → create a public bucket `public` → upload `assets/favicon.png` → copy its public URL.
- Keep the `{{ .ConfirmationURL }}` placeholder exactly as is.

> Flow once on: user signs up → app shows "Check your email" → they click the link → they land
> back on your site logged in → straight into the quiz. (The app already handles the return link.)

## 5) Turn on Google sign-in
**a. Google Cloud Console** (console.cloud.google.com):
1. Create/select a project → **APIs & Services → OAuth consent screen** → External → fill app name
   "Goalify", support email, save.
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application**.
3. Under **Authorized redirect URIs** add exactly:
   ```
   https://jcskgasaocfueneyahrk.supabase.co/auth/v1/callback
   ```
   (replace with your project URL if different — it's always `<PROJECT_URL>/auth/v1/callback`)
4. Create → copy the **Client ID** and **Client secret**.

**b. Supabase** → **Authentication → Providers → Google**:
- Toggle **Enable**, paste the **Client ID** and **Client secret**, save.

That's it — the "Continue with Google" button already calls Supabase and will now work.

## 6) Flip the app to live
In `app.js` (around line 23):
```
const DEMO_MODE = true;   →   const DEMO_MODE = false;
```
Save, redeploy (or restart your local server), hard-refresh. The app now uses real accounts:
- Landing → **Sign up / Log in** (email+password OR Google) → email verify (for email signups) → quiz → dashboard.

---

## Quick test checklist
- [ ] Open your real URL (not file://)
- [ ] Click **Start for free** → **Continue with Google** → Google popup → back into the quiz ✅
- [ ] Or sign up with email → "Check your email" screen → click link → back in, logged in ✅
- [ ] Refresh — you stay logged in ✅

## Still to do for full launch (separate from this)
- Payments (Stripe/Paddle) — tell me which and I'll build checkout + webhook.
- Move the admin code + promo codes server-side (they're demo-only in client right now).
