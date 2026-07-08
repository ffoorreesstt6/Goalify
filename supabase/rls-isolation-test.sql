-- RLS isolation test — run via Supabase SQL editor / MCP execute_sql after EVERY migration.
-- Auto-discovers every public table with a user_id column (so future tables —
-- receipts, referrals, gifts, AI coach, etc. — are covered automatically),
-- impersonates the two oldest real users, and FAILS if User A can read any
-- row owned by User B. Party-scoped tables (messages, friend_requests, follows,
-- premium_gifts) are excluded: shared visibility there is intentional.
do $$
declare a uuid; b uuid; t record; cnt bigint; leaks text:=''; checked int:=0;
begin
  select id into a from auth.users order by created_at limit 1;
  select id into b from auth.users where id<>a order by created_at desc limit 1;
  if a is null or b is null then raise exception 'Need 2 users in auth.users to test'; end if;

  perform set_config('role','authenticated',true);
  perform set_config('request.jwt.claims', json_build_object('sub',a,'role','authenticated')::text, true);

  for t in
    select c.table_name from information_schema.columns c
    join pg_tables p on p.tablename=c.table_name and p.schemaname='public'
    where c.table_schema='public' and c.column_name='user_id'
      and c.table_name not in ('messages','friend_requests','follows','premium_gifts',
                               'friendships','conversation_members','message_reactions',
                               'message_attachments','squad_members','profile_visitors')
  loop
    execute format('select count(*) from public.%I where user_id=$1', t.table_name) into cnt using b;
    checked:=checked+1;
    if cnt>0 then leaks:=leaks||' '||t.table_name||'('||cnt||')'; end if;
  end loop;

  execute 'select count(*) from public.profiles where id=$1' into cnt using b;
  checked:=checked+1;
  if cnt>0 then leaks:=leaks||' profiles('||cnt||')'; end if;

  if leaks<>'' then raise exception 'RLS LEAK — user % can read rows of % in:%', a, b, leaks; end if;
  raise notice 'RLS isolation OK — % tables checked, zero cross-account rows visible', checked;
end $$;
