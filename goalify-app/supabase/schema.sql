-- ============================================================
-- GOALIFY — Supabase schema (PostgreSQL)
-- Run this in the Supabase SQL editor.
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free','pro','premium','business')),
  personality text,
  is_student boolean not null default false,
  student_verified boolean not null default false,
  onboarded boolean not null default false,
  quiz_answers jsonb,
  monthly_income numeric not null default 0,
  currency text not null default 'EUR',
  notification_prefs jsonb not null default '{"weekly_report":true,"budget_alerts":true,"goal_updates":true,"product_news":false}',
  xp integer not null default 0,
  level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- GOALS
-- ============================================================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text default '🎯',
  target_amount numeric not null check (target_amount > 0),
  saved_amount numeric not null default 0,
  monthly_contribution numeric not null default 0,
  target_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;

drop policy if exists "goals_all_own" on public.goals;
create policy "goals_all_own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists goals_user_idx on public.goals(user_id);

-- ============================================================
-- EXPENSES
-- ============================================================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount >= 0),
  category text not null default 'other',
  description text,
  merchant text,
  is_recurring boolean not null default false,
  spent_at date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

drop policy if exists "expenses_all_own" on public.expenses;
create policy "expenses_all_own" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists expenses_user_idx on public.expenses(user_id);
create index if not exists expenses_spent_idx on public.expenses(user_id, spent_at);

-- ============================================================
-- SUBSCRIPTIONS (user-tracked recurring services)
-- ============================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null default 0,
  cycle text not null default 'monthly' check (cycle in ('monthly','yearly')),
  category text not null default 'subscriptions',
  next_charge date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_all_own" on public.subscriptions;
create policy "subscriptions_all_own" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- CHALLENGES
-- ============================================================
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  target_xp integer not null default 0,
  status text not null default 'active' check (status in ('active','completed','failed')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz
);

alter table public.challenges enable row level security;

drop policy if exists "challenges_all_own" on public.challenges;
create policy "challenges_all_own" on public.challenges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- AI USAGE (logging)
-- ============================================================
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null,
  tokens integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

drop policy if exists "ai_usage_insert_own" on public.ai_usage;
create policy "ai_usage_insert_own" on public.ai_usage
  for insert with check (auth.uid() = user_id);

drop policy if exists "ai_usage_select_own" on public.ai_usage;
create policy "ai_usage_select_own" on public.ai_usage
  for select using (auth.uid() = user_id);

-- ============================================================
-- STUDENT VERIFICATIONS
-- ============================================================
create table if not exists public.student_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution text not null,
  student_email text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.student_verifications enable row level security;

drop policy if exists "student_verifications_insert_own" on public.student_verifications;
create policy "student_verifications_insert_own" on public.student_verifications
  for insert with check (auth.uid() = user_id);

drop policy if exists "student_verifications_select_own" on public.student_verifications;
create policy "student_verifications_select_own" on public.student_verifications
  for select using (auth.uid() = user_id);

-- ============================================================
-- BILLING SUBSCRIPTIONS (Paddle) — managed by service role only
-- ============================================================
create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paddle_subscription_id text unique,
  paddle_customer_id text,
  plan text not null default 'free',
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_subscriptions enable row level security;

drop policy if exists "billing_select_own" on public.billing_subscriptions;
create policy "billing_select_own" on public.billing_subscriptions
  for select using (auth.uid() = user_id);
-- No insert/update policy: only the service role (webhook) writes here.

-- ============================================================
-- ADMIN USERS — service role only (RLS on, no public policies)
-- ============================================================
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  last_login timestamptz,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Intentionally NO policies → only the service-role key can read/write.

-- ============================================================
-- award_xp RPC — increments XP and recomputes level
-- ============================================================
create or replace function public.award_xp(p_user uuid, p_amount integer)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
    set xp = xp + p_amount,
        level = floor((xp + p_amount) / 100) + 1,
        updated_at = now()
  where id = p_user and auth.uid() = p_user;
end;
$$;

grant execute on function public.award_xp(uuid, integer) to authenticated;
