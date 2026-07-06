-- ════════════════════════════════════════════════════════════════════════
-- Support playbook: "I paid but didn't get Pro"
-- Replace user@example.com with the customer's login email everywhere.
-- ════════════════════════════════════════════════════════════════════════

-- 1) See the customer's payment attempts (newest first).
--    status 'paid'  -> webhook succeeded, they SHOULD be pro (check query 2)
--    status 'pending' -> webhook never processed (checksum/network) — investigate
select p.status, p.plan_id, p.amount, p.transaction_id, p.invoice_id,
       p.created_at, p.paid_at
from public.payments p
join auth.users u on u.id = p.user_id
where u.email = 'user@example.com'
order by p.created_at desc;

-- 2) See the customer's current plan.
select up.plan, up.pro_expires_at, up.updated_at
from public.user_plans up
join auth.users u on u.id = up.user_id
where u.email = 'user@example.com';


-- ════════════════════════════════════════════════════════════════════════
-- GRANT / EXTEND PRO manually (only after confirming payment in Bonum portal).
-- Pick the interval for the plan they bought:
--   monthly -> '1 month'   |   3-month -> '3 months'   |   annual -> '1 year'
-- This stacks onto any remaining time, exactly like the webhook does.
-- ════════════════════════════════════════════════════════════════════════
insert into public.user_plans (user_id, plan, pro_expires_at)
select u.id, 'pro',
       greatest(coalesce(up.pro_expires_at, now()), now()) + interval '1 month'
from auth.users u
left join public.user_plans up on up.user_id = u.id
where u.email = 'user@example.com'
on conflict (user_id) do update
  set plan           = 'pro',
      pro_expires_at = excluded.pro_expires_at,
      updated_at     = now();

-- OPTIONAL: mark their payment row as paid so records stay consistent.
-- Copy the transaction_id from query 1 above.
-- update public.payments
--    set status = 'paid', paid_at = now()
--  where transaction_id = 'doich-....';
