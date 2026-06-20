# Goalify V2 — Architecture & Upgrade Plan

Goalify has been upgraded from a goal+finance tracker into a **goal → mission → check-in
behaviour platform** — a hybrid of Notion (structure), Duolingo (missions + progression),
Strava (accountability) and an AI behaviour coach. Goals were **not removed**; they became
the base layer of a deeper 3-layer system.

---

## 1. Core architecture — the 3-layer model

```
GOAL  (long-term intention: "Emergency Fund", "Get fit")
  │   progress %, status (active/paused/completed), level (Beginner→Elite), XP
  └── MISSION  (the repeatable driver: "No-spend day", "Workout 3×/week")
        │   cadence (daily/weekly), weekly target, difficulty (easy/med/hard), streak, status
        └── CHECK-IN  (one execution per day: the "did you do it?" tap)
              date-stamped; drives streaks, XP, levels and AI analysis
```

Everything in the product is computed from the check-in log — streaks, levels, health,
the AI behaviour report and the shareable card all read the same source of truth, so the
numbers are always consistent and never invented.

---

## 2. What is live now (demo) vs. backend-activated

| Feature | Status |
|---|---|
| Goals → Missions → Check-ins hierarchy | ✅ Live |
| Daily/weekly check-ins, undo, per-mission streaks | ✅ Live |
| Streak 2.0 health (Strong/Stable/Weak/Critical) | ✅ Live |
| Goal levels (Beginner → Consistent → Advanced → Elite) + XP | ✅ Live |
| Mission difficulty (easy/med/hard → XP weight) | ✅ Live |
| Dashboard: today's missions, quick check-in, weekly summary, streak health | ✅ Live |
| AI behaviour coach: failure-pattern detection + weekly report + difficulty suggestions | ✅ Live |
| Shareable weekly progress card (PNG export) | ✅ Live |
| Plans page + plan-gating | ✅ Live |
| Squad: leaderboard, support, challenge, invite link | ✅ Live (sample data) |
| Real OpenAI coaching (Edge Function) | ✅ Built — needs key + deploy |
| Cross-user social graph, real invites, live challenges | 🔜 Needs backend + auth |
| Proof upload (image/text/voice) on check-ins | 🔜 Schema ready, UI next |
| Streak freeze / recovery tools | 🔜 Pro feature, next pass |

Social is "demo-functional": the UI is real and interactive, but a true friend graph and
cross-user challenges require the live Supabase backend + real accounts (your planned
launch step). Nothing is a dead placeholder.

---

## 3. Data model / schema changes

Added to `supabase/schema.sql` (extends, does not replace, the existing tables):

- `goals.status` column (active/paused/completed)
- `missions` — goal_id, user_id, title, cadence, per_week, difficulty, status (+ RLS: owner-only)
- `mission_checkins` — mission_id, user_id, day (unique per mission/day) (+ RLS: owner-only)
- `squads` + `squad_members` — accountability groups with invite codes (+ RLS: members/owner)
- `profiles` extended earlier with coach_mode, savings_mode, theme, theme_color, bg, avatar_url

In demo mode the same shapes live in `localStorage` (check-in logs keyed per mission), so the
client logic is identical when you flip to the real backend — only the read/write layer swaps.

---

## 4. UI / component structure

The app is a single-file vanilla-JS SPA (no build step) — each "component" is a pure
function returning an HTML string, composed by a hash router. New components added:

```
dashboardView
 ├─ todayMissionsHTML()      quick check-in list (the daily habit loop)
 ├─ weeklySummaryHTML()      check-ins / best streak / active goals + share button
 ├─ behaviourCardHTML()      AI behaviour insights (Pro-gated)
 ├─ goalOverviewHTML()       top-goal progress
 └─ whatToReduceHTML()       finance optimiser (kept)
goalsView
 └─ goalCard() → missionRow()   level, XP-to-next, missions, check-in/pause/delete
squadView                     leaderboard, support, challenge, invite (Premium-gated)
plansView                     3+1 tier comparison, current-plan highlight
aiView                        behaviour report + coach personalities + chat
```

Engine (pure functions, the "state management" layer):
`missionStreak, streakHealth, goalLevel, goalProgress, doneThisWeek, behaviourReport,
weeklyReportText, makeShareCard`. All read from one check-in store.

Mobile + desktop: responsive grids (`lg:grid-cols-*`), capped scroll panels, sidebar
collapses to a select on mobile.

---

## 5. Gamification

- **Streak 2.0** — per-mission streaks with health tiers; weekend/evening dips surfaced by the AI.
- **Levels** — each goal earns XP from check-ins (easy 5 / medium 10 / hard 20) and climbs
  Beginner → Consistent → Advanced → Elite, with a progress bar to the next level.
- **Badges** — existing badge system retained and now also rewards mission streaks.

---

## 6. AI behaviour engine (not just a chatbot)

`behaviourReport()` scans the last 21 days of check-ins and:
- finds the **weekday you miss most** (e.g. "Sundays — 60% skipped"),
- flags missions to **level up** (consistently completed) or **ease down** (slipping),
- feeds a short **weekly report** into the dashboard card and the AI Coach page.

When the OpenAI Edge Function is deployed, the same real numbers are sent as context so the
live coach gives grounded, data-driven advice (with per-plan daily limits).

---

## 7. Monetization

| Tier | Gets |
|---|---|
| **Free** | Goals, limited missions (2/goal), basic streaks, basic dashboard |
| **Pro** | Unlimited missions, AI behaviour insights, advanced analytics, appearance themes |
| **Premium** | Accountability squads, challenges, deep AI coaching, behaviour reports |
| **Business** | Everything + revenue/expense/profit views |

Gating is enforced in the UI today (locked cards with upsell) and should be re-checked
server-side in the Edge Function / RLS at launch.

---

## 8. Viral / growth loop

- **Shareable weekly card** — one tap exports a 1080×1080 PNG of your streak + check-ins +
  top goal, branded "Chase your goals → goalify.app". Designed for stories/feeds.
- **Invite links** — copy-to-clipboard squad invites.
- **Squad leaderboard** — friendly comparison drives return visits and re-sharing.

---

## 9. Recommended next steps (priority order)

1. Deploy backend: run updated `schema.sql`, deploy the AI Edge Function, set the OpenAI key.
2. Swap the demo localStorage layer for the `missions` / `mission_checkins` tables (logic is ready).
3. Build proof-of-completion uploads on check-ins (bucket + UI).
4. Real social graph: friend requests, live squads, cross-user challenges.
5. Streak freeze / recovery tools (Pro).
6. Server-side plan enforcement to back up the UI gating.
