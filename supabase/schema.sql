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
-- DONE. Next: make yourself an admin AFTER you sign up once:
--   update public.profiles set role='admin' where email = 'YOUR_EMAIL_HERE';
-- ============================================================
