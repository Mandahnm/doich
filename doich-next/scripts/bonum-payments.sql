-- Bonum payments schema — run in Supabase SQL editor.
-- Safe to re-run (IF NOT EXISTS / idempotent).

-- 1. user_plans: source of truth for Pro status (already read by the app).
create table if not exists public.user_plans (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  plan           text not null default 'free',           -- 'free' | 'pro'
  pro_expires_at timestamptz,                             -- null = never expires
  updated_at     timestamptz not null default now()
);

-- 2. payments: one row per invoice, for idempotency + audit.
create table if not exists public.payments (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references auth.users (id) on delete cascade,
  plan_id        text not null,                           -- 'monthly' | '3month' | 'annual'
  transaction_id text not null unique,                    -- our unique id, sent to Bonum
  invoice_id     text,                                    -- Bonum's invoiceId (filled after create)
  amount         numeric not null,                        -- MNT
  status         text not null default 'pending',         -- 'pending' | 'paid' | 'failed'
  raw_webhook    jsonb,                                   -- last webhook payload, for debugging
  created_at     timestamptz not null default now(),
  paid_at        timestamptz
);

create index if not exists payments_user_id_idx    on public.payments (user_id);
create index if not exists payments_invoice_id_idx on public.payments (invoice_id);

-- RLS: users may read their own rows; all writes happen server-side via the
-- service-role key (which bypasses RLS), so no INSERT/UPDATE policies are granted.
alter table public.user_plans enable row level security;
alter table public.payments   enable row level security;

drop policy if exists "own plan read" on public.user_plans;
create policy "own plan read" on public.user_plans
  for select using (auth.uid() = user_id);

drop policy if exists "own payments read" on public.payments;
create policy "own payments read" on public.payments
  for select using (auth.uid() = user_id);
