-- ============================================================
-- GOALIFY migration — run ONLY if you already ran schema.sql before
-- (adds the new "bio" column used by Profile Settings + ensures
--  language is captured from signup). Safe to run multiple times.
-- Supabase Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

alter table public.profiles add column if not exists bio text;

-- refresh the signup trigger so it also stores language + bio from metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name, username, dob, country, language, tos_accepted, marketing_optin)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'username',
    nullif(new.raw_user_meta_data->>'dob','')::date,
    new.raw_user_meta_data->>'country',
    coalesce(nullif(new.raw_user_meta_data->>'language',''), 'en'),
    coalesce((new.raw_user_meta_data->>'tos_accepted')::boolean, false),
    coalesce((new.raw_user_meta_data->>'marketing_optin')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end; $$;
