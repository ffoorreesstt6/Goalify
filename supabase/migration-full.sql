-- ============================================================
-- GOALIFY — full production migration (safe to paste & re-run)
-- Supabase Dashboard → SQL Editor → New query → paste all → Run
-- Idempotent: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS / DROP POLICY IF EXISTS.
-- Fixes: "Could not find the table 'public.goals' in the schema cache"
-- ============================================================

create extension if not exists "pgcrypto";

-- ── shared updated_at trigger ────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ── admin helper (no-op safe if it already exists) ───────────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ============================================================
-- PROFILES — ensure the onboarding/bio/language columns exist
-- (table itself is created by the main schema; these are safe adds)
-- ============================================================
alter table public.profiles add column if not exists onboarded boolean not null default false;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists language text not null default 'en';
alter table public.profiles add column if not exists budget jsonb;
alter table public.profiles add column if not exists spend_freq jsonb;

-- ============================================================
-- GOALS
-- ============================================================
create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  emoji       text default '🎯',
  image_url   text,
  target_amount numeric not null check (target_amount > 0),
  saved_amount  numeric not null default 0,
  monthly_contribution numeric not null default 0,
  target_date date,
  private     boolean not null default false,
  completed   boolean not null default false,
  status      text not null default 'active',
  missions    jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
-- bring older goals tables up to date
alter table public.goals add column if not exists private boolean not null default false;
alter table public.goals add column if not exists status text not null default 'active';
alter table public.goals add column if not exists missions jsonb not null default '[]'::jsonb;
alter table public.goals add column if not exists target_date date;
alter table public.goals add column if not exists image_url text;
alter table public.goals add column if not exists updated_at timestamptz not null default now();

alter table public.goals enable row level security;
drop policy if exists "goals_select_own" on public.goals;
drop policy if exists "goals_insert_own" on public.goals;
drop policy if exists "goals_update_own" on public.goals;
drop policy if exists "goals_delete_own" on public.goals;
drop policy if exists "goals_own_or_admin" on public.goals;
create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id or public.is_admin());
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

create index if not exists goals_user_idx on public.goals(user_id, created_at desc);
drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at before update on public.goals for each row execute function public.set_updated_at();

-- ============================================================
-- EXPENSES (the app's spending entries table)
-- ============================================================
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      numeric not null check (amount >= 0),
  category    text not null default 'other',
  merchant    text,
  source      text default 'manual',         -- 'manual' | 'quiz'
  spent_at    date not null default current_date,
  created_at  timestamptz not null default now()
);
alter table public.expenses enable row level security;
drop policy if exists "expenses_select_own" on public.expenses;
drop policy if exists "expenses_insert_own" on public.expenses;
drop policy if exists "expenses_update_own" on public.expenses;
drop policy if exists "expenses_delete_own" on public.expenses;
drop policy if exists "expenses_own_or_admin" on public.expenses;
create policy "expenses_select_own" on public.expenses for select using (auth.uid() = user_id or public.is_admin());
create policy "expenses_insert_own" on public.expenses for insert with check (auth.uid() = user_id);
create policy "expenses_update_own" on public.expenses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "expenses_delete_own" on public.expenses for delete using (auth.uid() = user_id);
create index if not exists expenses_user_idx on public.expenses(user_id, spent_at desc);

-- ============================================================
-- SPENDING CATEGORIES (per-user custom categories)
-- ============================================================
create table if not exists public.spending_categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  key         text not null,
  label       text not null,
  emoji       text default '💸',
  color       text default '#8b5cf6',
  monthly_budget numeric not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, key)
);
alter table public.spending_categories enable row level security;
drop policy if exists "spcat_select_own" on public.spending_categories;
drop policy if exists "spcat_insert_own" on public.spending_categories;
drop policy if exists "spcat_update_own" on public.spending_categories;
drop policy if exists "spcat_delete_own" on public.spending_categories;
create policy "spcat_select_own" on public.spending_categories for select using (auth.uid() = user_id or public.is_admin());
create policy "spcat_insert_own" on public.spending_categories for insert with check (auth.uid() = user_id);
create policy "spcat_update_own" on public.spending_categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "spcat_delete_own" on public.spending_categories for delete using (auth.uid() = user_id);
create index if not exists spcat_user_idx on public.spending_categories(user_id);
drop trigger if exists spcat_set_updated_at on public.spending_categories;
create trigger spcat_set_updated_at before update on public.spending_categories for each row execute function public.set_updated_at();

-- ============================================================
-- QUIZ ANSWERS (one row per user; stores the onboarding answers)
-- ============================================================
create table if not exists public.quiz_answers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  income      numeric not null default 0,
  country     text,
  freq        jsonb not null default '{}'::jsonb,   -- per-category weekly counts
  spend       jsonb not null default '{}'::jsonb,   -- per-category monthly €
  subs        jsonb not null default '[]'::jsonb,
  frustrate   text,
  reduce      text,
  bankcheck   text,
  challenge   text,
  personality text,
  completed_at timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id)
);
alter table public.quiz_answers enable row level security;
drop policy if exists "quiz_select_own" on public.quiz_answers;
drop policy if exists "quiz_insert_own" on public.quiz_answers;
drop policy if exists "quiz_update_own" on public.quiz_answers;
drop policy if exists "quiz_delete_own" on public.quiz_answers;
create policy "quiz_select_own" on public.quiz_answers for select using (auth.uid() = user_id or public.is_admin());
create policy "quiz_insert_own" on public.quiz_answers for insert with check (auth.uid() = user_id);
create policy "quiz_update_own" on public.quiz_answers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "quiz_delete_own" on public.quiz_answers for delete using (auth.uid() = user_id);
create index if not exists quiz_user_idx on public.quiz_answers(user_id);
drop trigger if exists quiz_set_updated_at on public.quiz_answers;
create trigger quiz_set_updated_at before update on public.quiz_answers for each row execute function public.set_updated_at();

-- ============================================================
-- Done. Reload the app — the goals table now exists in the schema cache.
-- (Supabase refreshes the cache automatically within a few seconds.)
-- ============================================================
