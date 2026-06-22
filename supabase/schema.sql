-- ============================================================
-- GOALIFY — Production Supabase schema
-- Project: jcskgasaocfueneyahrk
-- Run this whole file in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  first_name      text,
  last_name       text,
  username        text unique,
  email           text,
  dob             date,
  country         text,
  plan            text not null default 'free' check (plan in ('free','pro','premium','business')),
  role            text not null default 'user' check (role in ('user','admin')),
  personality     text,
  onboarded       boolean not null default false,
  employment      text,
  student_status  text,
  monthly_income  numeric not null default 0,
  monthly_savings numeric not null default 0,
  budget          jsonb,            -- quiz expense category amounts
  goals_text      jsonb,            -- selected financial goals from quiz
  habits          jsonb,            -- money habits from quiz
  currency        text not null default 'EUR',
  xp              integer not null default 0,
  tos_accepted    boolean not null default false,
  marketing_optin boolean not null default false,
  notification_prefs jsonb not null default '{"weekly":true,"alerts":true,"goals":true,"news":false}',
  theme           text not null default 'dark',
  language        text not null default 'en',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- helper: is the current user an admin? (security definer to avoid RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- auto-create profile from signup metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name, username, dob, country, tos_accepted, marketing_optin)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'username',
    nullif(new.raw_user_meta_data->>'dob','')::date,
    new.raw_user_meta_data->>'country',
    coalesce((new.raw_user_meta_data->>'tos_accepted')::boolean, false),
    coalesce((new.raw_user_meta_data->>'marketing_optin')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ============================================================
-- GOALS
-- ============================================================
create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  emoji       text default '🎯',
  image_url   text,
  target_amount  numeric not null check (target_amount > 0),
  saved_amount   numeric not null default 0,
  monthly_contribution numeric not null default 0,
  target_date date,
  completed   boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.goals enable row level security;
drop policy if exists "goals_own_or_admin" on public.goals;
create policy "goals_own_or_admin" on public.goals
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id);
create index if not exists goals_user_idx on public.goals(user_id);

-- ============================================================
-- EXPENSES
-- ============================================================
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      numeric not null check (amount >= 0),
  category    text not null default 'other',
  merchant    text,
  source      text default 'manual',  -- 'manual' | 'quiz'
  spent_at    date not null default current_date,
  created_at  timestamptz not null default now()
);
alter table public.expenses enable row level security;
drop policy if exists "expenses_own_or_admin" on public.expenses;
create policy "expenses_own_or_admin" on public.expenses
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id);
create index if not exists expenses_user_idx on public.expenses(user_id, spent_at);

-- ============================================================
-- AI USAGE (daily counts; written by the Edge Function via service role)
-- ============================================================
create table if not exists public.ai_usage (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  day       date not null default current_date,
  count     integer not null default 0,
  unique (user_id, day)
);
alter table public.ai_usage enable row level security;
drop policy if exists "ai_usage_select_own_or_admin" on public.ai_usage;
create policy "ai_usage_select_own_or_admin" on public.ai_usage
  for select using (auth.uid() = user_id or public.is_admin());
-- inserts/updates done by service role (Edge Function), which bypasses RLS.

-- ============================================================
-- STUDENT VERIFICATIONS
-- ============================================================
create table if not exists public.student_verifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  university     text not null,
  student_email  text not null,
  document_url   text,
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by   uuid,
  created_at    timestamptz not null default now()
);
alter table public.student_verifications enable row level security;
drop policy if exists "sv_insert_own" on public.student_verifications;
create policy "sv_insert_own" on public.student_verifications
  for insert with check (auth.uid() = user_id);
drop policy if exists "sv_select_own_or_admin" on public.student_verifications;
create policy "sv_select_own_or_admin" on public.student_verifications
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "sv_update_admin" on public.student_verifications;
create policy "sv_update_admin" on public.student_verifications
  for update using (public.is_admin());

-- ============================================================
-- award_xp RPC
-- ============================================================
create or replace function public.award_xp(p_amount integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set xp = xp + p_amount, updated_at = now() where id = auth.uid();
end; $$;
grant execute on function public.award_xp(integer) to authenticated;

-- admin action: approve a student verification and upgrade that user to Pro
create or replace function public.approve_student(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  update public.student_verifications set status='approved', reviewed_by=auth.uid() where id=p_id returning user_id into v_user;
  update public.profiles set plan='pro', updated_at=now() where id=v_user;
end; $$;
grant execute on function public.approve_student(uuid) to authenticated;

create or replace function public.reject_student(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  update public.student_verifications set status='rejected', reviewed_by=auth.uid() where id=p_id;
end; $$;
grant execute on function public.reject_student(uuid) to authenticated;

-- admin action: set a user's plan
create or replace function public.admin_set_plan(p_user uuid, p_plan text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  update public.profiles set plan=p_plan, updated_at=now() where id=p_user;
end; $$;
grant execute on function public.admin_set_plan(uuid, text) to authenticated;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public) values ('goal-images','goal-images', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('documents','documents', false)
  on conflict (id) do nothing;

-- goal-images: public read; users manage files under their own folder (userId/...)
drop policy if exists "goalimg_read" on storage.objects;
create policy "goalimg_read" on storage.objects for select using (bucket_id = 'goal-images');
drop policy if exists "goalimg_write" on storage.objects;
create policy "goalimg_write" on storage.objects for insert
  with check (bucket_id = 'goal-images' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "goalimg_update" on storage.objects;
create policy "goalimg_update" on storage.objects for update
  using (bucket_id = 'goal-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- documents: private; only owner (or admin) can read; owner can upload
drop policy if exists "docs_read_own_or_admin" on storage.objects;
create policy "docs_read_own_or_admin" on storage.objects for select
  using (bucket_id = 'documents' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin()));
drop policy if exists "docs_write_own" on storage.objects;
create policy "docs_write_own" on storage.objects for insert
  with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- Demo AI usage counter (global daily cap for the no-login demo path).
-- Only the Edge Function (service role) touches this; RLS with no policy
-- blocks all browser access.
-- ============================================================
create table if not exists public.demo_ai_usage (
  day date primary key,
  count int not null default 0
);
alter table public.demo_ai_usage enable row level security;

-- Optional columns used by the app's appearance + coaching settings.
-- Safe to run repeatedly.
alter table public.profiles add column if not exists coach_mode text default 'fun';
alter table public.profiles add column if not exists savings_mode text default 'fun';
alter table public.profiles add column if not exists theme text default 'dark';
alter table public.profiles add column if not exists theme_color text default 'blue';
alter table public.profiles add column if not exists bg text default 'none';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists banner_url text;

-- ============================================================
-- V3: Public profiles, visibility & prestige progression
-- profile_visibility: 'public' (default) appears in search + leaderboards;
-- 'private' hides the user from everyone. show_active_goals toggles whether
-- active goals are shown on the public profile. prestige is the post-L100
-- prestige rank (0 = not prestiged) — scaffolded for a future expansion.
-- ============================================================
alter table public.profiles add column if not exists profile_visibility text default 'public';
alter table public.profiles add column if not exists show_active_goals boolean default true;
alter table public.profiles add column if not exists prestige int default 0;
alter table public.profiles add column if not exists prestige_at timestamptz;

-- Onboarding quiz results (modern flow: categories, top-3, end-of-month, goals)
alter table public.profiles add column if not exists spend_categories text[] default '{}';
alter table public.profiles add column if not exists top_categories text[] default '{}';
alter table public.profiles add column if not exists end_of_month text;
alter table public.profiles add column if not exists improve_goals text[] default '{}';
alter table public.profiles add column if not exists savings_potential text;
-- Slider quiz: frustration, reduce target, bank-check habit, money challenge
alter table public.profiles add column if not exists frustrate_category text;
alter table public.profiles add column if not exists reduce_category text;
alter table public.profiles add column if not exists bank_check text;
alter table public.profiles add column if not exists money_challenge text;

-- Public leaderboard source: only public, onboarded profiles are exposed.
-- Ready for real ranking once accounts go live; ordered by prestige then XP.
create or replace view public.leaderboard as
  select id, first_name, last_name, username, plan, xp, prestige, avatar_url
  from public.profiles
  where coalesce(profile_visibility,'public') = 'public'
    and coalesce(onboarded,false) = true
  order by coalesce(prestige,0) desc, coalesce(xp,0) desc;

-- ============================================================
-- V2: Goals → Missions → Check-ins hierarchy
-- ============================================================
alter table public.goals add column if not exists status text default 'active';
alter table public.goals add column if not exists private boolean default false;

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  cadence text default 'daily',        -- 'daily' | 'weekly'
  per_week int default 5,
  difficulty text default 'medium',    -- 'easy' | 'medium' | 'hard'
  status text default 'active',        -- 'active' | 'paused'
  created_at timestamptz default now()
);
alter table public.missions enable row level security;
drop policy if exists "missions_own" on public.missions;
create policy "missions_own" on public.missions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.mission_checkins (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  day date not null,
  created_at timestamptz default now(),
  unique (mission_id, day)
);
alter table public.mission_checkins enable row level security;
drop policy if exists "checkins_own" on public.mission_checkins;
create policy "checkins_own" on public.mission_checkins for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- V2: Accountability squads (Premium)
-- ============================================================
create table if not exists public.squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner uuid references auth.users(id) on delete cascade,
  invite_code text unique default substr(md5(random()::text),1,8),
  created_at timestamptz default now()
);
create table if not exists public.squad_members (
  squad_id uuid references public.squads(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (squad_id, user_id)
);
alter table public.squads enable row level security;
alter table public.squad_members enable row level security;
drop policy if exists "squad_member_read" on public.squads;
create policy "squad_member_read" on public.squads for select
  using (exists (select 1 from public.squad_members m where m.squad_id = id and m.user_id = auth.uid()) or auth.uid() = owner);
drop policy if exists "squad_owner_all" on public.squads;
create policy "squad_owner_all" on public.squads for all
  using (auth.uid() = owner) with check (auth.uid() = owner);
drop policy if exists "members_self" on public.squad_members;
create policy "members_self" on public.squad_members for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- DONE. Next: make yourself an admin AFTER you sign up once:
--   update public.profiles set role='admin' where email = 'YOUR_EMAIL_HERE';
-- ============================================================
