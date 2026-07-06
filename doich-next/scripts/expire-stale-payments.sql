-- Auto-expire abandoned invoices. Bonum invoices live 15 min (expiresIn=900s),
-- so any row still 'pending' after 30 min can never be paid — mark it 'expired'.
-- Run once in the Supabase SQL editor. Requires the pg_cron extension.

create extension if not exists pg_cron;

-- Remove any previous version of the job, then (re)schedule it.
select cron.unschedule('expire-stale-payments')
where exists (select 1 from cron.job where jobname = 'expire-stale-payments');

select cron.schedule(
  'expire-stale-payments',
  '*/30 * * * *',                       -- every 30 minutes
  $$update public.payments
       set status = 'expired'
     where status = 'pending'
       and created_at < now() - interval '30 minutes'$$
);

-- One-off cleanup of existing stale rows right now:
update public.payments
   set status = 'expired'
 where status = 'pending'
   and created_at < now() - interval '30 minutes';
