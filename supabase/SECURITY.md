# Goalify data-security rules (non-negotiable)

Learned from the 2026-07-08 goals cross-account leak (`goals_public_read` policy
+ unfiltered `select *` in the app). These rules apply to EVERY future table:
receipt scanner, inbox, AI coach, referrals, gifts, store, subscriptions, etc.

## Every new table / migration
1. `alter table ... enable row level security;` **in the same migration** that creates the table.
2. Owner policies scoped to `auth.uid() = user_id` for SELECT / INSERT / UPDATE / DELETE (`for all ... using/with check`).
3. **No anonymous access** unless explicitly intended (catalogs like `plans`, `badges`).
4. **Never rely on frontend filtering alone** — but the app must still filter
   `.eq('user_id', ...)` explicitly (defense in depth; a permissive policy must not widen lists).
5. No table-level SELECT policy may expose one user's rows to another. Cross-user
   visibility goes through dedicated **views** (see below), never base tables.
6. After every migration, run `rls-isolation-test.sql` — it auto-discovers
   user-owned tables and fails if User A can read User B's rows.

## Public exposure (Find People / Leaderboards / Public Profiles — future)
Expose ONLY via a dedicated safe-column view (definer semantics, deliberate decision):
- allowed: username, avatar_url, banner_url, country (optional), badges, xp,
  level, goals completed count, streak, public achievements.
- NEVER: email, date of birth, income, spending, savings, settings,
  student verification, private goals, coin balance.
Current state: `public_profiles`, `leaderboard`, `public_goals` are all
`security_invoker=on` → zero cross-account exposure until deliberately widened.
