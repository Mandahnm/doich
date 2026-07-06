-- Convenience views that show the user's email alongside plans/payments,
-- joined LIVE from auth.users (never stale, no data duplication).
-- Admin-only: access revoked from anon/authenticated so emails aren't exposed
-- via the public API. Browse them in the SQL editor or Table Editor (service role).

create or replace view public.admin_pro_users as
select u.email, up.plan, up.pro_expires_at, up.updated_at, up.user_id
from public.user_plans up
join auth.users u on u.id = up.user_id;

create or replace view public.admin_payments as
select u.email, p.status, p.plan_id, p.amount, p.transaction_id,
       p.invoice_id, p.created_at, p.paid_at, p.user_id
from public.payments p
join auth.users u on u.id = p.user_id
order by p.created_at desc;

revoke all on public.admin_pro_users from anon, authenticated;
revoke all on public.admin_payments  from anon, authenticated;
