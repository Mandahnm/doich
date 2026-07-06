-- Admin helper functions for the /admin page. Run once in Supabase SQL editor.
-- SECURITY DEFINER so they can read auth.users; execute granted only to service_role
-- (the API routes use the service-role key and additionally check the caller's email).

-- Look up a user's plan + recent payments by email.
create or replace function public.admin_lookup(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_plan jsonb;
  v_payments jsonb;
begin
  select id into v_uid from auth.users where lower(email) = lower(p_email) limit 1;
  if v_uid is null then
    return jsonb_build_object('found', false);
  end if;

  select to_jsonb(up) into v_plan
  from (select plan, pro_expires_at, updated_at from user_plans where user_id = v_uid) up;

  select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc), '[]'::jsonb)
  into v_payments
  from (
    select status, plan_id, amount, transaction_id, invoice_id, created_at, paid_at
    from payments where user_id = v_uid
    order by created_at desc limit 20
  ) x;

  return jsonb_build_object('found', true, 'user_id', v_uid, 'plan', v_plan, 'payments', v_payments);
end;
$$;

-- Grant / extend Pro by N months. Stacks onto remaining time (like the webhook).
create or replace function public.admin_grant_pro(p_email text, p_months int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_new timestamptz;
begin
  select id into v_uid from auth.users where lower(email) = lower(p_email) limit 1;
  if v_uid is null then
    return jsonb_build_object('found', false);
  end if;

  insert into user_plans (user_id, plan, pro_expires_at)
  values (v_uid, 'pro', now() + make_interval(months => p_months))
  on conflict (user_id) do update
    set plan           = 'pro',
        pro_expires_at = greatest(coalesce(user_plans.pro_expires_at, now()), now())
                         + make_interval(months => p_months),
        updated_at     = now()
  returning pro_expires_at into v_new;

  return jsonb_build_object('found', true, 'pro_expires_at', v_new);
end;
$$;

revoke all on function public.admin_lookup(text)          from anon, authenticated;
revoke all on function public.admin_grant_pro(text, int)  from anon, authenticated;
grant  execute on function public.admin_lookup(text)         to service_role;
grant  execute on function public.admin_grant_pro(text, int) to service_role;
