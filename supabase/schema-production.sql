-- ============================================================================
-- GOALIFY — PRODUCTION SCHEMA (rebuild of public schema)
-- Idempotent. Run in: Supabase Dashboard → SQL Editor → New query → Run.
--
-- SAFETY
--   • Never touches auth.users (only references it).
--   • Every user table references auth.users(id) ON DELETE CASCADE.
--   • Auto-provisions profile + settings + streak + onboarding on signup,
--     and backfills every EXISTING auth user at the bottom of this file.
--   • Sessions/refresh tokens are a CLIENT concern (persistSession +
--     autoRefreshToken); this schema never revokes them.
--
-- DESIGN NOTES
--   • Normalised, not one-table-per-bullet. Where the brief lists variants
--     (income/expense/recurring, notification types, cosmetic categories),
--     they are a typed column + CHECK, which scales better than N tables.
--   • `expenses`, `goals`, `profiles`, `missions`, `mission_checkins`,
--     `quiz_answers`, `student_verifications`, `ai_usage` keep the exact
--     shapes the live SPA already queries — so nothing breaks.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";      -- fuzzy username/full-text search

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- attach the updated_at trigger to a table by name (idempotent)
create or replace function public._attach_updated_at(p_table regclass)
returns void language plpgsql as $$
declare tname text := p_table::text;
begin
  execute format('drop trigger if exists trg_updated_at on %s', tname);
  execute format('create trigger trg_updated_at before update on %s
                  for each row execute function public.set_updated_at()', tname);
end; $$;

-- ============================================================================
-- CORE · PROFILES
-- ============================================================================
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  first_name      text,
  last_name       text,
  username        text unique,
  email           text,
  dob             date,
  bio             text,
  country         text,
  city            text,
  timezone        text default 'UTC',
  avatar_url      text,
  banner_url      text,
  plan            text not null default 'free' check (plan in ('free','pro','premium','business')),
  role            text not null default 'user' check (role in ('user','admin')),
  personality     text,
  onboarded       boolean not null default false,
  employment      text,
  student_status  text,
  monthly_income  numeric not null default 0,
  monthly_savings numeric not null default 0,
  budget          jsonb,
  goals_text      jsonb,
  habits          jsonb,
  currency        text not null default 'EUR',
  xp              integer not null default 0 check (xp >= 0),
  level           integer not null default 1 check (level >= 1),
  prestige        integer not null default 0,
  prestige_at     timestamptz,
  tos_accepted    boolean not null default false,
  marketing_optin boolean not null default false,
  theme           text not null default 'dark',
  theme_color     text not null default 'blue',
  bg              text not null default 'none',
  language        text not null default 'en',
  coach_mode      text default 'fun',
  savings_mode    text default 'fun',
  profile_visibility text not null default 'public' check (profile_visibility in ('public','private')),
  show_active_goals  boolean not null default true,
  -- quiz result columns kept for the live onboarding flow
  spend_categories text[] default '{}',
  top_categories   text[] default '{}',
  end_of_month     text,
  improve_goals    text[] default '{}',
  savings_potential text,
  frustrate_category text,
  reduce_category  text,
  bank_check       text,
  money_challenge  text,
  notification_prefs jsonb not null default '{"weekly":true,"alerts":true,"goals":true,"news":false}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.profiles enable row level security;
create index if not exists profiles_username_trgm on public.profiles using gin (username gin_trgm_ops);
create index if not exists profiles_public_idx on public.profiles(profile_visibility) where profile_visibility = 'public';
create index if not exists profiles_plan_idx on public.profiles(plan);
select public._attach_updated_at('public.profiles');

-- admin check (security definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin on public.profiles
  for select using (auth.uid() = id or public.is_admin());
-- NOTE: the raw profiles table is deliberately owner/admin-only (it holds email,
-- dob, income). Public discovery uses the safe public_profiles VIEW below, which
-- exposes only non-sensitive columns.
drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin on public.profiles
  for update using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

-- is the given profile publicly discoverable? (security definer → usable inside
-- other tables' RLS without exposing the profiles table itself)
create or replace function public.is_public_profile(p_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = p_id and profile_visibility = 'public');
$$;

-- safe public projection (search / leaderboards / profile previews) — no email/dob/income.
-- Views are owner-defined and bypass the profiles table RLS, so only these columns leak.
create or replace view public.public_profiles as
  select id, username, first_name, avatar_url, banner_url, plan, xp, level, prestige,
         country, city, bio, show_active_goals
  from public.profiles
  where profile_visibility = 'public';

create or replace view public.leaderboard as
  select id, username, first_name, avatar_url, plan, xp, level, prestige
  from public.profiles
  where profile_visibility = 'public' and onboarded = true
  order by prestige desc, xp desc;

grant select on public.public_profiles to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;

-- ============================================================================
-- CORE · SETTINGS · ONBOARDING · STREAKS
-- ============================================================================
create table if not exists public.user_settings (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  language      text not null default 'en',
  currency      text not null default 'EUR',
  timezone      text not null default 'UTC',
  theme         text not null default 'dark',
  theme_color   text not null default 'blue',
  background    text not null default 'none',
  privacy       text not null default 'public' check (privacy in ('public','friends','private')),
  notif_push    boolean not null default true,
  notif_email   boolean not null default true,
  notif_goals   boolean not null default true,
  notif_social  boolean not null default true,
  notif_streak  boolean not null default true,
  email_product boolean not null default false,
  email_weekly  boolean not null default true,
  receipt_autocreate boolean not null default true,
  receipt_default_category text default 'other',
  reduce_motion boolean not null default false,
  updated_at    timestamptz not null default now()
);
alter table public.user_settings enable row level security;
drop policy if exists settings_own on public.user_settings;
create policy settings_own on public.user_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
select public._attach_updated_at('public.user_settings');

create table if not exists public.onboarding_progress (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  step        integer not null default 0,
  completed   boolean not null default false,
  answers     jsonb not null default '{}',
  completed_at timestamptz,
  updated_at  timestamptz not null default now()
);
alter table public.onboarding_progress enable row level security;
drop policy if exists onboarding_own on public.onboarding_progress;
create policy onboarding_own on public.onboarding_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
select public._attach_updated_at('public.onboarding_progress');

create table if not exists public.streaks (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  current      integer not null default 0,
  longest      integer not null default 0,
  last_active  date,
  freezes      integer not null default 0,
  updated_at   timestamptz not null default now()
);
alter table public.streaks enable row level security;
drop policy if exists streaks_own on public.streaks;
create policy streaks_own on public.streaks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
select public._attach_updated_at('public.streaks');

-- ============================================================================
-- GOALS
-- ============================================================================
create table if not exists public.goal_categories (
  id    smallint primary key,
  key   text unique not null,
  label text not null,
  emoji text default '🎯'
);
insert into public.goal_categories (id,key,label,emoji) values
  (1,'savings','Savings','💰'),(2,'travel','Travel','✈️'),(3,'tech','Tech','💻'),
  (4,'home','Home','🏠'),(5,'car','Vehicle','🚗'),(6,'education','Education','🎓'),
  (7,'emergency','Emergency Fund','🛡️'),(8,'other','Other','🎯')
on conflict (id) do nothing;

create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category_id smallint references public.goal_categories(id) on delete set null,
  name        text not null,
  emoji       text default '🎯',
  image_url   text,
  target_amount numeric not null check (target_amount > 0),
  saved_amount  numeric not null default 0 check (saved_amount >= 0),
  monthly_contribution numeric not null default 0,
  target_date date,
  completed   boolean not null default false,
  completed_at timestamptz,
  status      text not null default 'active' check (status in ('active','paused','completed','archived')),
  private     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.goals enable row level security;
drop policy if exists goals_own_or_admin on public.goals;
create policy goals_own_or_admin on public.goals for all
  using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id);
-- SECURITY: goals are strictly owner-only at the table level. The old
-- goals_public_read policy let any signed-in user read any non-private goal
-- of any public profile — combined with an unfiltered select in the app it
-- leaked goals across accounts. Public display goes through the
-- public.public_goals view below (safe columns, opt-in via show_active_goals).
drop policy if exists goals_public_read on public.goals;
create index if not exists goals_user_idx on public.goals(user_id, status);
create index if not exists goals_category_idx on public.goals(category_id);
select public._attach_updated_at('public.goals');

-- public projection of goals (future public profile pages). security_invoker
-- (set below) means the caller's RLS applies — cross-account exposure is zero
-- today; widening this when profiles launch must be a deliberate decision.
create or replace view public.public_goals as
  select g.id, g.user_id, g.name, g.emoji, g.target_amount, g.saved_amount, g.completed
  from public.goals g
  join public.profiles p on p.id = g.user_id
  where p.profile_visibility = 'public'
    and p.show_active_goals
    and not coalesce(g.private, false)
    and coalesce(g.status, 'active') <> 'archived';
alter view public.public_goals set (security_invoker = on);
grant select on public.public_goals to anon, authenticated;

create table if not exists public.goal_milestones (
  id         uuid primary key default gen_random_uuid(),
  goal_id    uuid not null references public.goals(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  label      text not null,
  target_amount numeric not null check (target_amount >= 0),
  reached    boolean not null default false,
  reached_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.goal_milestones enable row level security;
drop policy if exists milestones_own on public.goal_milestones;
create policy milestones_own on public.goal_milestones for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists milestones_goal_idx on public.goal_milestones(goal_id);

create table if not exists public.goal_reminders (
  id         uuid primary key default gen_random_uuid(),
  goal_id    uuid not null references public.goals(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  cadence    text not null default 'weekly' check (cadence in ('daily','weekly','monthly')),
  next_at    timestamptz,
  enabled    boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.goal_reminders enable row level security;
drop policy if exists reminders_own on public.goal_reminders;
create policy reminders_own on public.goal_reminders for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists reminders_next_idx on public.goal_reminders(user_id, next_at) where enabled;

-- contributions = goal_progress events (drives progress + charts)
create table if not exists public.goal_contributions (
  id         uuid primary key default gen_random_uuid(),
  goal_id    uuid not null references public.goals(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     numeric not null,
  note       text,
  created_at timestamptz not null default now()
);
alter table public.goal_contributions enable row level security;
drop policy if exists contrib_own on public.goal_contributions;
create policy contrib_own on public.goal_contributions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists contrib_goal_idx on public.goal_contributions(goal_id, created_at);

-- future simulator saved scenarios
create table if not exists public.future_scenarios (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text,
  inputs     jsonb not null default '{}',   -- income, cuts, horizon, rate…
  result     jsonb,                          -- projected timeline
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.future_scenarios enable row level security;
drop policy if exists scenarios_own on public.future_scenarios;
create policy scenarios_own on public.future_scenarios for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
select public._attach_updated_at('public.future_scenarios');

-- ============================================================================
-- FINANCE
-- ============================================================================
create table if not exists public.transaction_categories (
  id    smallint primary key,
  key   text unique not null,
  label text not null,
  kind  text not null default 'expense' check (kind in ('expense','income','savings')),
  emoji text
);
insert into public.transaction_categories (id,key,label,kind,emoji) values
  (1,'groceries','Groceries','expense','🛒'),(2,'restaurants','Restaurants','expense','🍽️'),
  (3,'transport','Transport','expense','🚌'),(4,'rent','Rent/Housing','expense','🏠'),
  (5,'utilities','Utilities','expense','⚡'),(6,'subscriptions','Subscriptions','expense','📱'),
  (7,'shopping','Shopping','expense','🛍️'),(8,'entertainment','Entertainment','expense','🎬'),
  (9,'salary','Salary','income','💼'),(10,'savings','Savings','savings','🐷'),
  (11,'other','Other','expense','✨')
on conflict (id) do nothing;

-- KEEP the live table shape the SPA writes to (sb.from('expenses'))
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      numeric not null check (amount >= 0),
  category    text not null default 'other',
  merchant    text,
  source      text default 'manual',
  spent_at    date not null default current_date,
  created_at  timestamptz not null default now()
);
alter table public.expenses enable row level security;
drop policy if exists expenses_own_or_admin on public.expenses;
create policy expenses_own_or_admin on public.expenses for all
  using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id);
create index if not exists expenses_user_idx on public.expenses(user_id, spent_at);

-- unified ledger for the richer finance features (income/expense/recurring)
create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         text not null check (type in ('expense','income','transfer','savings')),
  amount       numeric not null check (amount >= 0),
  currency     text not null default 'EUR',
  category_id  smallint references public.transaction_categories(id) on delete set null,
  category     text,
  merchant     text,
  note         text,
  occurred_on  date not null default current_date,
  recurring    boolean not null default false,
  recurrence   text check (recurrence in ('daily','weekly','monthly','yearly')),
  recurrence_until date,
  source       text not null default 'manual' check (source in ('manual','quiz','receipt','recurring')),
  receipt_id   uuid,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.transactions enable row level security;
drop policy if exists tx_own on public.transactions;
create policy tx_own on public.transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists tx_user_date_idx on public.transactions(user_id, occurred_on desc);
create index if not exists tx_recurring_idx on public.transactions(user_id) where recurring;
select public._attach_updated_at('public.transactions');

create table if not exists public.budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  category_id smallint references public.transaction_categories(id) on delete set null,
  category    text,
  period      text not null default 'monthly' check (period in ('weekly','monthly')),
  limit_amount numeric not null check (limit_amount >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, category, period)
);
alter table public.budgets enable row level security;
drop policy if exists budgets_own on public.budgets;
create policy budgets_own on public.budgets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
select public._attach_updated_at('public.budgets');

-- ============================================================================
-- RECEIPT SCANNER
-- ============================================================================
create table if not exists public.receipt_scans (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  image_path    text not null,                     -- storage: receipts/<uid>/...
  source        text not null default 'camera' check (source in ('camera','gallery')),
  status        text not null default 'processing' check (status in ('processing','review','saved','failed')),
  ocr_text      text,
  ocr_raw       jsonb,
  merchant      text,
  detected_country  text,
  detected_currency text,
  category      text,
  total         numeric,
  tax           numeric,
  confidence    numeric check (confidence between 0 and 1),
  purchased_at  date,
  transaction_id uuid references public.transactions(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.receipt_scans enable row level security;
drop policy if exists receipts_own on public.receipt_scans;
create policy receipts_own on public.receipt_scans for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists receipts_user_idx on public.receipt_scans(user_id, created_at desc);
select public._attach_updated_at('public.receipt_scans');

create table if not exists public.receipt_items (
  id         uuid primary key default gen_random_uuid(),
  scan_id    uuid not null references public.receipt_scans(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text,
  qty        numeric default 1,
  unit_price numeric,
  line_total numeric,
  category   text
);
alter table public.receipt_items enable row level security;
drop policy if exists receipt_items_own on public.receipt_items;
create policy receipt_items_own on public.receipt_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists receipt_items_scan_idx on public.receipt_items(scan_id);

-- ============================================================================
-- SOCIAL — friend requests · friendships · visitors
-- ============================================================================
-- NOTE: the follower/following `follows` table was removed 2026-07 (migration
-- drop_dead_follows_system). Goalify uses a mutual-friendship model only.

create table if not exists public.friend_requests (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at  timestamptz not null default now(),
  responded_at timestamptz,
  check (sender_id <> receiver_id),
  unique (sender_id, receiver_id)          -- prevents duplicate requests
);
alter table public.friend_requests enable row level security;
drop policy if exists fr_read on public.friend_requests;
create policy fr_read on public.friend_requests for select
  using (auth.uid() in (sender_id, receiver_id));
drop policy if exists fr_send on public.friend_requests;
create policy fr_send on public.friend_requests for insert with check (auth.uid() = sender_id);
drop policy if exists fr_respond on public.friend_requests;
create policy fr_respond on public.friend_requests for update
  using (auth.uid() in (sender_id, receiver_id));
create index if not exists fr_receiver_idx on public.friend_requests(receiver_id, status);

-- accepted friendships stored canonically (user_low < user_high) to dedupe
create table if not exists public.friendships (
  user_low   uuid not null references auth.users(id) on delete cascade,
  user_high  uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_low, user_high),
  check (user_low < user_high)
);
alter table public.friendships enable row level security;
drop policy if exists friendships_read on public.friendships;
create policy friendships_read on public.friendships for select
  using (auth.uid() in (user_low, user_high));

create table if not exists public.profile_visitors (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  visitor_id uuid not null references auth.users(id) on delete cascade,
  visited_at timestamptz not null default now(),
  check (profile_id <> visitor_id)
);
alter table public.profile_visitors enable row level security;
drop policy if exists visitors_read on public.profile_visitors;
create policy visitors_read on public.profile_visitors for select using (auth.uid() = profile_id);
drop policy if exists visitors_write on public.profile_visitors;
create policy visitors_write on public.profile_visitors for insert with check (auth.uid() = visitor_id);
create index if not exists visitors_profile_idx on public.profile_visitors(profile_id, visited_at desc);

-- ============================================================================
-- INBOX — conversations · members · messages · reactions · attachments
-- ============================================================================
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  is_group   boolean not null default false,
  title      text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
select public._attach_updated_at('public.conversations');

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'member' check (role in ('member','admin')),
  last_read_at timestamptz,
  typing_at   timestamptz,                    -- typing status
  muted       boolean not null default false,
  joined_at   timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
alter table public.conversation_members enable row level security;
create index if not exists convmem_user_idx on public.conversation_members(user_id);

-- membership predicate (security definer → avoids recursive RLS)
create or replace function public.is_member(p_conversation uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.conversation_members
                where conversation_id = p_conversation and user_id = auth.uid());
$$;

drop policy if exists conv_read on public.conversations;
create policy conv_read on public.conversations for select using (public.is_member(id));
drop policy if exists conv_create on public.conversations;
create policy conv_create on public.conversations for insert with check (auth.uid() = created_by);
drop policy if exists convmem_read on public.conversation_members;
create policy convmem_read on public.conversation_members for select using (public.is_member(conversation_id));
drop policy if exists convmem_self on public.conversation_members;
create policy convmem_self on public.conversation_members for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id  uuid not null references auth.users(id) on delete cascade,
  body       text,
  created_at timestamptz not null default now(),
  edited_at  timestamptz,
  deleted    boolean not null default false
);
alter table public.messages enable row level security;
drop policy if exists msg_read on public.messages;
create policy msg_read on public.messages for select using (public.is_member(conversation_id));
drop policy if exists msg_send on public.messages;
create policy msg_send on public.messages for insert
  with check (auth.uid() = sender_id and public.is_member(conversation_id));
drop policy if exists msg_edit on public.messages;
create policy msg_edit on public.messages for update using (auth.uid() = sender_id);
create index if not exists messages_conv_idx on public.messages(conversation_id, created_at desc);

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);
alter table public.message_reactions enable row level security;
drop policy if exists reactions_rw on public.message_reactions;
create policy reactions_rw on public.message_reactions for all
  using (auth.uid() = user_id or public.is_member((select conversation_id from public.messages m where m.id = message_id)))
  with check (auth.uid() = user_id);

create table if not exists public.message_attachments (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  path       text not null,
  mime       text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);
alter table public.message_attachments enable row level security;
drop policy if exists attach_rw on public.message_attachments;
create policy attach_rw on public.message_attachments for all
  using (public.is_member((select conversation_id from public.messages m where m.id = message_id)))
  with check (auth.uid() = user_id);

-- ============================================================================
-- NOTIFICATIONS (single typed table covers every listed notification kind)
-- ============================================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null check (type in (
               'friend_request','friend_accepted','goal_completed','badge_earned',
               'premium_gift','store_purchase','streak_reminder','receipt_result',
               'inbox_message','system')),
  title      text not null,
  body       text,
  data       jsonb not null default '{}',
  actor_id   uuid references auth.users(id) on delete set null,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
drop policy if exists notif_own on public.notifications;
create policy notif_own on public.notifications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists notif_user_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;

-- ============================================================================
-- REWARDS — badges · achievements · missions · reward history
-- ============================================================================
create table if not exists public.badges (
  id    text primary key,
  name  text not null,
  emoji text,
  description text,
  tier  text default 'bronze'
);
create table if not exists public.user_badges (
  user_id   uuid not null references auth.users(id) on delete cascade,
  badge_id  text not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);
alter table public.user_badges enable row level security;
drop policy if exists user_badges_read on public.user_badges;
create policy user_badges_read on public.user_badges for select
  using (auth.uid() = user_id or public.is_public_profile(user_id));
drop policy if exists user_badges_write on public.user_badges;
create policy user_badges_write on public.user_badges for insert with check (auth.uid() = user_id);

create table if not exists public.achievements (
  id text primary key, name text not null, description text, xp_reward int default 0
);
create table if not exists public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);
alter table public.user_achievements enable row level security;
drop policy if exists user_ach_own on public.user_achievements;
create policy user_ach_own on public.user_achievements for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Missions + check-ins (exact shapes used by the live SPA)
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  cadence text default 'daily' check (cadence in ('daily','weekly')),
  per_week int default 5,
  difficulty text default 'medium' check (difficulty in ('easy','medium','hard')),
  scope text default 'goal' check (scope in ('goal','daily','weekly')),
  status text default 'active' check (status in ('active','paused')),
  created_at timestamptz default now()
);
alter table public.missions enable row level security;
drop policy if exists missions_own on public.missions;
create policy missions_own on public.missions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists missions_user_idx on public.missions(user_id, status);

create table if not exists public.mission_checkins (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  day date not null,
  created_at timestamptz default now(),
  unique (mission_id, day)
);
alter table public.mission_checkins enable row level security;
drop policy if exists checkins_own on public.mission_checkins;
create policy checkins_own on public.mission_checkins for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists checkins_user_day_idx on public.mission_checkins(user_id, day);

create table if not exists public.reward_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null,                 -- 'xp','badge','coins','mission','streak'
  amount     integer,
  ref        text,
  created_at timestamptz not null default now()
);
alter table public.reward_history enable row level security;
drop policy if exists reward_hist_own on public.reward_history;
create policy reward_hist_own on public.reward_history for select using (auth.uid() = user_id);
create index if not exists reward_hist_idx on public.reward_history(user_id, created_at desc);

-- ============================================================================
-- GOALIFY COINS — append-only ledger (balance derived), server-authoritative
-- ============================================================================
create table if not exists public.coin_ledger (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  delta      integer not null,               -- + earn / - spend
  reason     text not null,                  -- checkin, streak7, goal_complete, cosmetic, refund…
  ref        text,                           -- idempotency ref (goal id, item id…)
  created_at timestamptz not null default now()
);
alter table public.coin_ledger enable row level security;
drop policy if exists coin_read_own on public.coin_ledger;
create policy coin_read_own on public.coin_ledger for select using (auth.uid() = user_id);
-- writes ONLY via the security-definer functions below (no insert/update/delete policy)
create index if not exists coin_user_idx on public.coin_ledger(user_id, created_at);
create unique index if not exists coin_idem_idx on public.coin_ledger(user_id, reason, ref) where ref is not null;

create or replace view public.coin_balance as
  select user_id, coalesce(sum(delta),0)::int as balance
  from public.coin_ledger group by user_id;

create or replace function public.credit_coins(p_reason text, p_ref text, p_amount int)
returns int language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); mult numeric; amt int; today_total int; week_total int; wcap int; plan text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if not (p_reason='checkin' and p_amount=5
       or p_reason='streak7' and p_amount=25
       or p_reason='goal_complete' and p_amount=100
       or p_reason='recap' and p_amount=20
       or p_reason='first_analysis' and p_amount=100) then raise exception 'invalid earn'; end if;
  select p.plan into plan from public.profiles p where p.id = uid;
  -- one-time bonuses pay flat and skip earn caps; recurring earns get the tier multiplier
  mult := case when p_reason='first_analysis' then 1
               when plan in ('premium','business') then 2 when plan='pro' then 1.5 else 1 end;
  amt  := round(p_amount * mult);
  if p_reason <> 'first_analysis' then
    wcap := case when plan in ('pro','premium','business') then 1000000 else 80 end;
    select coalesce(sum(delta),0) into today_total from public.coin_ledger
      where user_id=uid and delta>0 and created_at::date = current_date;
    if today_total + amt > 120 then return -1; end if;             -- daily cap
    select coalesce(sum(delta),0) into week_total from public.coin_ledger
      where user_id=uid and delta>0 and created_at >= date_trunc('week', now());
    if week_total >= wcap then return -1; end if;                  -- weekly cap (Free=80)
    if week_total + amt > wcap then amt := wcap - week_total; end if;
  end if;
  insert into public.coin_ledger(user_id, delta, reason, ref)
    values (uid, amt, p_reason, p_ref) on conflict do nothing;
  return (select balance from public.coin_balance where user_id = uid);
end; $$;
grant execute on function public.credit_coins(text,text,int) to authenticated;

create or replace function public.spend_coins(p_reason text, p_item text, p_cost int)
returns int language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); bal int; plan text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_cost <= 0 then raise exception 'invalid cost'; end if;
  select p.plan into plan from public.profiles p where p.id = uid;
  if plan = 'free' then raise exception 'store locked on free plan'; end if;
  select coalesce(sum(delta),0) into bal from public.coin_ledger where user_id = uid;
  if bal < p_cost then raise exception 'insufficient coins'; end if;
  insert into public.coin_ledger(user_id, delta, reason, ref) values (uid, -p_cost, p_reason, p_item);
  return bal - p_cost;
end; $$;
grant execute on function public.spend_coins(text,text,int) to authenticated;

-- ============================================================================
-- STORE — products (typed) · inventory · purchases
-- ============================================================================
create table if not exists public.store_products (
  id        text primary key,
  name      text not null,
  category  text not null check (category in ('banner','theme','frame','coinskin','flameskin','effect','icon','background')),
  cost      integer not null check (cost >= 0),
  min_plan  text not null default 'pro' check (min_plan in ('free','pro','premium','business')),
  animated  boolean not null default false,
  seasonal  boolean not null default false,
  data      jsonb not null default '{}',    -- gradient css, colors…
  active    boolean not null default true,
  created_at timestamptz not null default now()
);
insert into public.store_products (id,name,category,cost,min_plan,data) values
  ('ban_sunset','Sunset banner','banner',200,'pro','{"css":"linear-gradient(120deg,#ff7e5f,#feb47b)"}'),
  ('ban_ocean','Ocean banner','banner',200,'pro','{"css":"linear-gradient(120deg,#2193b0,#6dd5ed)"}'),
  ('ban_aurora','Aurora banner','banner',450,'premium','{"css":"linear-gradient(120deg,#8a2be2,#00d4ff,#43e97b)"}'),
  ('theme_emerald','Emerald theme','theme',300,'pro','{"accent":"green"}'),
  ('coin_gold','Gold coin skin','coinskin',250,'pro','{"color":"#E5C879"}'),
  ('frame_silver','Silver frame','frame',400,'pro','{"frame":"frame-silver"}'),
  ('flame_blue','Blue Fire streak','flameskin',350,'pro','{"color":"#4ea3ff"}')
on conflict (id) do nothing;
alter table public.store_products enable row level security;
drop policy if exists store_read on public.store_products;
create policy store_read on public.store_products for select using (active);  -- catalog is public

create table if not exists public.user_inventory (
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.store_products(id) on delete cascade,
  equipped   boolean not null default false,
  acquired_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
alter table public.user_inventory enable row level security;
drop policy if exists inventory_own on public.user_inventory;
create policy inventory_own on public.user_inventory for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.store_purchases (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.store_products(id) on delete cascade,
  coins_spent integer not null,
  created_at timestamptz not null default now()
);
alter table public.store_purchases enable row level security;
drop policy if exists purchases_own on public.store_purchases;
create policy purchases_own on public.store_purchases for select using (auth.uid() = user_id);
create index if not exists purchases_user_idx on public.store_purchases(user_id, created_at desc);

-- ============================================================================
-- PREMIUM — plans · subscriptions · gifts
-- ============================================================================
create table if not exists public.plans (
  id         text primary key check (id in ('free','pro','premium','business')),
  name       text not null,
  price_month numeric not null default 0,
  price_year  numeric not null default 0,
  coin_multiplier numeric not null default 1,
  monthly_stipend int not null default 0,
  features   jsonb not null default '{}'
);
insert into public.plans (id,name,price_month,price_year,coin_multiplier,monthly_stipend) values
  ('free','Free',0,0,1,0),('pro','Pro',3,29,1.5,200),
  ('premium','Premium',5,49,2,600),('business','Business',9,75,2,600)
on conflict (id) do nothing;

create table if not exists public.subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  plan       text not null references public.plans(id),
  status     text not null default 'active' check (status in ('active','past_due','canceled','trialing','student')),
  is_student boolean not null default false,
  provider   text,                            -- 'paddle' etc.
  provider_ref text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
drop policy if exists subs_read_own on public.subscriptions;
create policy subs_read_own on public.subscriptions for select using (auth.uid() = user_id or public.is_admin());
-- writes come from the billing webhook (service role) — no user write policy
create index if not exists subs_user_idx on public.subscriptions(user_id);
select public._attach_updated_at('public.subscriptions');

create table if not exists public.premium_gifts (
  id         uuid primary key default gen_random_uuid(),
  sender_id  uuid references auth.users(id) on delete set null,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  plan       text not null references public.plans(id),
  months     int not null default 1,
  redeemed   boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.premium_gifts enable row level security;
drop policy if exists gifts_read on public.premium_gifts;
create policy gifts_read on public.premium_gifts for select
  using (auth.uid() in (sender_id, recipient_id));

-- ============================================================================
-- STUDENT VERIFICATION (extends the live table shape)
-- ============================================================================
create table if not exists public.student_verifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  university    text not null,
  student_email text not null,
  document_url  text,
  city          text,
  country       text,
  status        text not null default 'pending' check (status in ('pending','approved','rejected','expired')),
  verification_code text,
  reviewer_notes text,
  reviewed_by   uuid references auth.users(id) on delete set null,
  free_pro_until timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);
alter table public.student_verifications enable row level security;
drop policy if exists sv_insert_own on public.student_verifications;
create policy sv_insert_own on public.student_verifications for insert with check (auth.uid() = user_id);
drop policy if exists sv_select_own_or_admin on public.student_verifications;
create policy sv_select_own_or_admin on public.student_verifications for select
  using (auth.uid() = user_id or public.is_admin());
drop policy if exists sv_update_admin on public.student_verifications;
create policy sv_update_admin on public.student_verifications for update using (public.is_admin());
create index if not exists sv_status_idx on public.student_verifications(status);

-- ============================================================================
-- ONBOARDING QUIZ ANSWERS (exact shape the SPA upserts)
-- ============================================================================
create table if not exists public.quiz_answers (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  income      numeric,
  country     text,
  freq        jsonb,
  spend       jsonb,
  subs        jsonb,
  frustrate   text,
  reduce      text,
  bankcheck   text,
  challenge   text,
  personality text,
  extras      jsonb,
  updated_at  timestamptz not null default now()
);
alter table public.quiz_answers enable row level security;
drop policy if exists quiz_own on public.quiz_answers;
create policy quiz_own on public.quiz_answers for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
select public._attach_updated_at('public.quiz_answers');

-- ============================================================================
-- DASHBOARD CACHE + ANALYTICS SNAPSHOTS
-- ============================================================================
create table if not exists public.dashboard_cache (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}',    -- savings, expenses, income, balance, charts, activity, streak, xp
  updated_at timestamptz not null default now()
);
alter table public.dashboard_cache enable row level security;
drop policy if exists dash_own on public.dashboard_cache;
create policy dash_own on public.dashboard_cache for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
select public._attach_updated_at('public.dashboard_cache');

create table if not exists public.analytics_snapshots (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  period     text not null check (period in ('weekly','monthly','yearly')),
  period_start date not null,
  income     numeric not null default 0,
  expenses   numeric not null default 0,
  savings    numeric not null default 0,
  category_breakdown jsonb not null default '{}',
  spending_trend jsonb,
  saving_trend jsonb,
  receipt_accuracy numeric,
  premium_usage jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, period, period_start)
);
alter table public.analytics_snapshots enable row level security;
drop policy if exists analytics_own on public.analytics_snapshots;
create policy analytics_own on public.analytics_snapshots for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists analytics_user_idx on public.analytics_snapshots(user_id, period, period_start desc);

-- ============================================================================
-- SQUADS (accountability groups — live feature)
-- ============================================================================
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
drop policy if exists squad_member_read on public.squads;
create policy squad_member_read on public.squads for select
  using (exists (select 1 from public.squad_members m where m.squad_id = id and m.user_id = auth.uid()) or auth.uid() = owner);
drop policy if exists squad_owner_all on public.squads;
create policy squad_owner_all on public.squads for all
  using (auth.uid() = owner) with check (auth.uid() = owner);
drop policy if exists members_self on public.squad_members;
create policy members_self on public.squad_members for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- AI USAGE (Edge Function via service role)
-- ============================================================================
create table if not exists public.ai_usage (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default current_date,
  count   integer not null default 0,
  unique (user_id, day)
);
alter table public.ai_usage enable row level security;
drop policy if exists ai_usage_select_own_or_admin on public.ai_usage;
create policy ai_usage_select_own_or_admin on public.ai_usage for select
  using (auth.uid() = user_id or public.is_admin());

create table if not exists public.demo_ai_usage (day date primary key, count int not null default 0);
alter table public.demo_ai_usage enable row level security;

-- ============================================================================
-- ADMIN / XP RPCs (used by the SPA)
-- ============================================================================
create or replace function public.award_xp(p_amount integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set xp = greatest(0, xp + p_amount),
         level = greatest(1, floor((greatest(0, xp + p_amount))/100.0)::int + 1),
         updated_at = now()
   where id = auth.uid();
end; $$;
grant execute on function public.award_xp(integer) to authenticated;

create or replace function public.approve_student(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_user uuid;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  update public.student_verifications
     set status='approved', reviewed_by=auth.uid(),
         free_pro_until = now() + interval '2 years'
   where id=p_id returning user_id into v_user;
  update public.profiles set plan='pro', updated_at=now() where id=v_user;
  insert into public.subscriptions(user_id, plan, status, is_student, current_period_end)
    values (v_user, 'pro', 'student', true, now() + interval '2 years');
end; $$;
grant execute on function public.approve_student(uuid) to authenticated;

create or replace function public.reject_student(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  update public.student_verifications set status='rejected', reviewed_by=auth.uid() where id=p_id;
end; $$;
grant execute on function public.reject_student(uuid) to authenticated;

create or replace function public.admin_set_plan(p_user uuid, p_plan text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  update public.profiles set plan=p_plan, updated_at=now() where id=p_user;
end; $$;
grant execute on function public.admin_set_plan(uuid, text) to authenticated;

-- ============================================================================
-- CATALOG TABLES — enable RLS with public read (non-sensitive lookup data).
-- Keeps Supabase's "RLS disabled in public" advisor clean.
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array['goal_categories','transaction_categories','badges','achievements','plans'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t||'_read', t);
    execute format('create policy %I on public.%I for select using (true)', t||'_read', t);
  end loop;
end $$;

-- ============================================================================
-- AUTOMATION — provision a full account row-set on signup
-- ============================================================================
create or replace function public.provision_user(p_id uuid, p_email text, p_meta jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name, username, dob, country,
                               tos_accepted, marketing_optin, language)
  values (p_id, p_email,
          p_meta->>'first_name', p_meta->>'last_name', p_meta->>'username',
          nullif(p_meta->>'dob','')::date, p_meta->>'country',
          ((p_meta ? 'privacy_accepted_at') or coalesce((p_meta->>'tos_accepted')::boolean, false)),
          coalesce((p_meta->>'marketing_opt_in')::boolean, (p_meta->>'marketing_optin')::boolean, false),
          coalesce(p_meta->>'language','en'))
  on conflict (id) do nothing;

  insert into public.user_settings (user_id) values (p_id) on conflict do nothing;
  insert into public.onboarding_progress (user_id) values (p_id) on conflict do nothing;
  insert into public.streaks (user_id) values (p_id) on conflict do nothing;
  insert into public.dashboard_cache (user_id) values (p_id) on conflict do nothing;
  -- GC balance is derived from coin_ledger (no row needed at zero balance)
end; $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.provision_user(new.id, new.email, coalesce(new.raw_user_meta_data,'{}'::jsonb));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Called by the client on load: guarantees an existing/older user gets their
-- rows if the trigger never ran for them (satisfies "create on sign-in if missing").
create or replace function public.ensure_bootstrap()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  perform public.provision_user(
    auth.uid(),
    (select email from auth.users where id = auth.uid()),
    coalesce((select raw_user_meta_data from auth.users where id = auth.uid()),'{}'::jsonb));
end; $$;
grant execute on function public.ensure_bootstrap() to authenticated;

-- ============================================================================
-- STORAGE BUCKETS + POLICIES
-- ============================================================================
insert into storage.buckets (id, name, public) values
  ('goal-images','goal-images', true),
  ('avatars','avatars', true),
  ('banners','banners', true),
  ('documents','documents', false),
  ('receipts','receipts', false)
on conflict (id) do nothing;

-- public-read buckets: owner writes under <uid>/... folder
do $$
declare b text;
begin
  foreach b in array array['goal-images','avatars','banners'] loop
    execute format('drop policy if exists %I on storage.objects', b||'_read');
    execute format('create policy %I on storage.objects for select using (bucket_id = %L)', b||'_read', b);
    execute format('drop policy if exists %I on storage.objects', b||'_write');
    execute format('create policy %I on storage.objects for insert with check (bucket_id = %L and auth.uid()::text = (storage.foldername(name))[1])', b||'_write', b);
    execute format('drop policy if exists %I on storage.objects', b||'_update');
    execute format('create policy %I on storage.objects for update using (bucket_id = %L and auth.uid()::text = (storage.foldername(name))[1])', b||'_update', b);
    execute format('drop policy if exists %I on storage.objects', b||'_delete');
    execute format('create policy %I on storage.objects for delete using (bucket_id = %L and auth.uid()::text = (storage.foldername(name))[1])', b||'_delete', b);
  end loop;
end $$;

-- private buckets: owner (or admin) read; owner write
do $$
declare b text;
begin
  foreach b in array array['documents','receipts'] loop
    execute format('drop policy if exists %I on storage.objects', b||'_read');
    execute format('create policy %I on storage.objects for select using (bucket_id = %L and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin()))', b||'_read', b);
    execute format('drop policy if exists %I on storage.objects', b||'_write');
    execute format('create policy %I on storage.objects for insert with check (bucket_id = %L and auth.uid()::text = (storage.foldername(name))[1])', b||'_write', b);
    execute format('drop policy if exists %I on storage.objects', b||'_delete');
    execute format('create policy %I on storage.objects for delete using (bucket_id = %L and auth.uid()::text = (storage.foldername(name))[1])', b||'_delete', b);
  end loop;
end $$;

-- ============================================================================
-- BACKFILL — provision every EXISTING auth user (no data loss, no logout)
-- ============================================================================
insert into public.profiles (id, email)
  select u.id, u.email from auth.users u
  on conflict (id) do nothing;

insert into public.user_settings (user_id)      select id from auth.users on conflict do nothing;
insert into public.onboarding_progress (user_id) select id from auth.users on conflict do nothing;
insert into public.streaks (user_id)            select id from auth.users on conflict do nothing;
insert into public.dashboard_cache (user_id)    select id from auth.users on conflict do nothing;

-- ============================================================================
-- POST-INSTALL: make yourself admin AFTER signing up once:
--   update public.profiles set role='admin' where email='YOUR_EMAIL_HERE';
-- ============================================================================

-- ============================================================================
-- HARDENING (applied after advisor review) — 0 security ERRORs remain.
-- ============================================================================
-- Views run as the querying user (no cross-user leakage)
alter view public.coin_balance set (security_invoker = on);
alter view public.public_profiles set (security_invoker = on);
alter view public.leaderboard set (security_invoker = on);
-- Pin search_path on trigger helpers
alter function public.set_updated_at() set search_path = public;
alter function public._attach_updated_at(regclass) set search_path = public;
-- Lock down EXECUTE. is_admin/is_member/is_public_profile stay executable because
-- RLS policy expressions call them on behalf of the querying role.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public._attach_updated_at(regclass) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.provision_user(uuid, text, jsonb) from public, anon, authenticated;
revoke execute on function public.award_xp(integer) from public, anon;
revoke execute on function public.credit_coins(text, text, integer) from public, anon;
revoke execute on function public.spend_coins(text, text, integer) from public, anon;
revoke execute on function public.approve_student(uuid) from public, anon;
revoke execute on function public.reject_student(uuid) from public, anon;
revoke execute on function public.admin_set_plan(uuid, text) from public, anon;
revoke execute on function public.ensure_bootstrap() from public, anon;
grant execute on function public.award_xp(integer) to authenticated;
grant execute on function public.credit_coins(text, text, integer) to authenticated;
grant execute on function public.spend_coins(text, text, integer) to authenticated;
grant execute on function public.approve_student(uuid) to authenticated;
grant execute on function public.reject_student(uuid) to authenticated;
grant execute on function public.admin_set_plan(uuid, text) to authenticated;
grant execute on function public.ensure_bootstrap() to authenticated;
-- Public buckets serve via public object URL; no listing policy needed
drop policy if exists "avatars_read" on storage.objects;
drop policy if exists "banners_read" on storage.objects;
drop policy if exists "goal-images_read" on storage.objects;

-- ============================================================================
-- FK COVERING INDEXES (every foreign key gets a leading index)
-- ============================================================================
create index if not exists budgets_category_idx on public.budgets(category_id);
create index if not exists conversations_created_by_idx on public.conversations(created_by);
create index if not exists friendships_high_idx on public.friendships(user_high);
create index if not exists future_scenarios_user_idx on public.future_scenarios(user_id);
create index if not exists goal_contributions_user_idx on public.goal_contributions(user_id);
create index if not exists goal_milestones_user_idx on public.goal_milestones(user_id);
create index if not exists goal_reminders_goal_idx on public.goal_reminders(goal_id);
create index if not exists message_attachments_msg_idx on public.message_attachments(message_id);
create index if not exists message_attachments_user_idx on public.message_attachments(user_id);
create index if not exists message_reactions_user_idx on public.message_reactions(user_id);
create index if not exists messages_sender_idx on public.messages(sender_id);
create index if not exists missions_goal_idx on public.missions(goal_id);
create index if not exists notifications_actor_idx on public.notifications(actor_id);
create index if not exists premium_gifts_sender_idx on public.premium_gifts(sender_id);
create index if not exists premium_gifts_recipient_idx on public.premium_gifts(recipient_id);
create index if not exists premium_gifts_plan_idx on public.premium_gifts(plan);
create index if not exists profile_visitors_visitor_idx on public.profile_visitors(visitor_id);
create index if not exists receipt_items_user_idx on public.receipt_items(user_id);
create index if not exists receipt_scans_tx_idx on public.receipt_scans(transaction_id);
create index if not exists squad_members_user_idx on public.squad_members(user_id);
create index if not exists squads_owner_idx on public.squads(owner);
create index if not exists store_purchases_product_idx on public.store_purchases(product_id);
create index if not exists student_verifications_user_idx on public.student_verifications(user_id);
create index if not exists student_verifications_reviewer_idx on public.student_verifications(reviewed_by);
create index if not exists subscriptions_plan_idx on public.subscriptions(plan);
create index if not exists transactions_category_idx on public.transactions(category_id);
create index if not exists transactions_receipt_idx on public.transactions(receipt_id);
create index if not exists user_achievements_ach_idx on public.user_achievements(achievement_id);
create index if not exists user_badges_badge_idx on public.user_badges(badge_id);
create index if not exists user_inventory_product_idx on public.user_inventory(product_id);

-- ============================================================
-- GROUP GOALS — collaborative savings (added 2026-07-08)
-- RBAC (owner/admin/contributor/viewer) via SECURITY DEFINER helpers + RLS.
-- Applied live as migrations group_goals_feature + group_goals_harden_grants.
-- ============================================================
create table if not exists public.group_goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, emoji text default '🎯',
  target_amount numeric not null check (target_amount > 0),
  saved_amount numeric not null default 0,
  currency text not null default 'EUR', target_date date,
  privacy text not null default 'invite' check (privacy in ('invite','friends','public')),
  invite_code text unique not null default encode(gen_random_bytes(5),'hex'),
  status text not null default 'active' check (status in ('active','completed','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.group_members (
  group_id uuid not null references public.group_goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'contributor' check (role in ('owner','admin','contributor','viewer')),
  joined_at timestamptz not null default now(), primary key (group_id, user_id)
);
create table if not exists public.group_contributions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.group_goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount <> 0), note text,
  created_at timestamptz not null default now()
);
create index if not exists group_members_user_idx on public.group_members(user_id);
create index if not exists group_contrib_group_idx on public.group_contributions(group_id, created_at desc);
create index if not exists group_goals_code_idx on public.group_goals(invite_code);
-- SECURITY DEFINER helpers avoid RLS recursion; grants restricted to authenticated (see harden migration)
create or replace function public.is_group_member(gid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.group_members where group_id=gid and user_id=auth.uid()); $$;
create or replace function public.group_role(gid uuid) returns text language sql stable security definer set search_path=public as $$
  select role from public.group_members where group_id=gid and user_id=auth.uid(); $$;
alter table public.group_goals enable row level security;
alter table public.group_members enable row level security;
alter table public.group_contributions enable row level security;
create policy gg_select on public.group_goals for select using (privacy='public' or public.is_group_member(id));
create policy gg_insert on public.group_goals for insert with check (owner_id=auth.uid());
create policy gg_update on public.group_goals for update using (public.group_role(id) in ('owner','admin')) with check (public.group_role(id) in ('owner','admin'));
create policy gg_delete on public.group_goals for delete using (owner_id=auth.uid());
create policy gm_select on public.group_members for select using (public.is_group_member(group_id));
create policy gm_delete on public.group_members for delete using (user_id=auth.uid() or public.group_role(group_id) in ('owner','admin'));
create policy gc_select on public.group_contributions for select using (public.is_group_member(group_id));
create policy gc_insert on public.group_contributions for insert with check (user_id=auth.uid() and public.group_role(group_id) in ('owner','admin','contributor'));
create policy gc_delete on public.group_contributions for delete using (user_id=auth.uid() or public.group_role(group_id) in ('owner','admin'));
-- saved_amount + completion kept in sync from contributions (trigger fn: not REST-exposed)
create or replace function public.recompute_group_saved() returns trigger language plpgsql security definer set search_path=public as $$
declare gid uuid; tot numeric; begin
  gid := coalesce(new.group_id, old.group_id);
  select coalesce(sum(amount),0) into tot from public.group_contributions where group_id=gid;
  update public.group_goals set saved_amount=tot, status=case when tot>=target_amount then 'completed' else 'active' end, updated_at=now() where id=gid and status<>'archived';
  return null; end $$;
create trigger trg_group_saved after insert or delete or update on public.group_contributions for each row execute function public.recompute_group_saved();
-- RPCs (create + server-validated join). Grants: authenticated only.
create or replace function public.create_group_goal(p_name text, p_emoji text, p_target numeric, p_currency text, p_target_date date, p_privacy text)
returns public.group_goals language plpgsql security definer set search_path=public as $$
declare g public.group_goals; begin
  if auth.uid() is null then raise exception 'auth required'; end if;
  if coalesce(p_target,0) <= 0 then raise exception 'target must be positive'; end if;
  insert into public.group_goals(owner_id,name,emoji,target_amount,currency,target_date,privacy)
    values (auth.uid(), left(coalesce(nullif(p_name,''),'Group goal'),80), coalesce(nullif(p_emoji,''),'🎯'), p_target,
            coalesce(nullif(p_currency,''),'EUR'), p_target_date, case when p_privacy in ('invite','friends','public') then p_privacy else 'invite' end)
    returning * into g;
  insert into public.group_members(group_id,user_id,role) values (g.id, auth.uid(), 'owner');
  return g; end $$;
create or replace function public.join_group_by_code(p_code text)
returns uuid language plpgsql security definer set search_path=public as $$
declare g public.group_goals; begin
  if auth.uid() is null then raise exception 'auth required'; end if;
  select * into g from public.group_goals where invite_code=lower(trim(p_code)) and status<>'archived';
  if g.id is null then raise exception 'Invalid or expired invite code'; end if;
  insert into public.group_members(group_id,user_id,role) values (g.id, auth.uid(), 'contributor') on conflict do nothing;
  return g.id; end $$;
revoke all on function public.recompute_group_saved() from anon, authenticated, public;
grant execute on function public.create_group_goal(text,text,numeric,text,date,text) to authenticated;
grant execute on function public.join_group_by_code(text) to authenticated;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.group_role(uuid) to authenticated;
