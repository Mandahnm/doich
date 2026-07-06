-- Security verification — run in Supabase SQL editor and check results.
-- Everything should match the EXPECTED comments.

-- 1) RLS must be ENABLED on all app tables.
--    EXPECTED: rowsecurity = true for payments, user_plans, user_progress, api_usage (if exists)
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- 2) Policies: payments/user_plans should have ONLY a SELECT policy (cmd = SELECT).
--    EXPECTED: no INSERT/UPDATE/DELETE policies on payments or user_plans.
--    user_progress needs policies restricted to auth.uid() = id.
select tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, cmd;

-- 3) Admin functions must NOT be executable by app roles.
--    EXPECTED: no rows where grantee IN ('anon', 'authenticated') for admin_%.
select routine_name, grantee, privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name like 'admin\_%'
  and grantee in ('anon', 'authenticated');

-- 4) Admin views must NOT be readable by app roles.
--    EXPECTED: zero rows.
select table_name, grantee, privilege_type
from information_schema.table_privileges
where table_schema = 'public'
  and table_name like 'admin\_%'
  and grantee in ('anon', 'authenticated');

-- 5) No user should have plan='pro' without either a paid payment or a deliberate manual grant.
--    Review any rows this returns — they are grants with no payment behind them.
select u.email, up.plan, up.pro_expires_at, up.updated_at
from public.user_plans up
join auth.users u on u.id = up.user_id
where up.plan = 'pro'
  and not exists (
    select 1 from public.payments p
    where p.user_id = up.user_id and p.status = 'paid'
  );
