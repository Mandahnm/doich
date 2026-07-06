import { NextResponse } from 'next/server';
import { PRICING } from '@/lib/plans';
import { verifyChecksum } from '@/lib/bonum';
import { getServerSupabase } from '@/lib/supabaseServer';

// POST /api/payments/bonum/webhook
// Bonum calls this when a payment completes or fails. Register this URL on
// merchant.bonum.mn:  https://doich.online/api/payments/bonum/webhook
export async function POST(request) {
  // 1. Read the RAW body first — checksum must run over the exact bytes.
  const rawBody = await request.text();
  const checksum = request.headers.get('x-checksum-v2');

  if (!verifyChecksum(rawBody, checksum)) {
    console.warn('Bonum webhook: invalid checksum');
    return NextResponse.json({ error: 'invalid checksum' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  // We only handle one-time payment notifications here.
  if (payload.type !== 'PAYMENT') {
    return NextResponse.json({ ok: true, ignored: payload.type });
  }

  const body          = payload.body || {};
  const transactionId = body.transactionId;
  if (!transactionId) {
    return NextResponse.json({ error: 'no transactionId' }, { status: 400 });
  }

  const supabase = getServerSupabase();

  // 2. Look up the pending payment we created.
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('transaction_id', transactionId)
    .single();

  if (!payment) {
    console.warn('Bonum webhook: unknown transactionId', transactionId);
    return NextResponse.json({ ok: true, unknown: true }); // 200 so Bonum stops retrying
  }

  // 3. Idempotency — already processed.
  if (payment.status === 'paid') {
    return NextResponse.json({ ok: true, already: true });
  }

  const isSuccess = payload.status === 'SUCCESS';

  // Always store the raw payload for debugging.
  const baseUpdate = { raw_webhook: payload };

  if (!isSuccess) {
    // Never downgrade a paid row — only a still-pending one can become failed.
    await supabase.from('payments')
      .update({ ...baseUpdate, status: 'failed' })
      .eq('transaction_id', transactionId)
      .eq('status', 'pending');
    return NextResponse.json({ ok: true, status: 'failed' });
  }

  // 4. Guard: amount must match the plan we recorded (never trust the wire amount alone).
  if (Math.round(Number(body.amount)) !== Math.round(Number(payment.amount))) {
    console.error('Bonum webhook: amount mismatch', body.amount, 'vs', payment.amount);
    await supabase.from('payments')
      .update({ ...baseUpdate, status: 'failed' })
      .eq('transaction_id', transactionId)
      .eq('status', 'pending');
    return NextResponse.json({ ok: true, status: 'amount_mismatch' });
  }

  // 5. Atomically claim the payment: pending → paid. The status filter makes this
  // a compare-and-set, so concurrent/replayed SUCCESS webhooks can't double-grant —
  // exactly one request wins the transition, the rest see zero claimed rows.
  const now = new Date();
  const { data: claimed } = await supabase.from('payments')
    .update({ ...baseUpdate, status: 'paid', paid_at: now.toISOString() })
    .eq('transaction_id', transactionId)
    .in('status', ['pending', 'failed'])
    .select('user_id, plan_id');

  if (!claimed || claimed.length === 0) {
    return NextResponse.json({ ok: true, already: true });
  }

  // 6. Grant/extend Pro (only the single claiming request reaches this point).
  const plan   = PRICING.find(p => p.id === claimed[0].plan_id);
  const months = plan?.months || 1;

  const { data: existing } = await supabase
    .from('user_plans')
    .select('pro_expires_at')
    .eq('user_id', claimed[0].user_id)
    .single();

  const base = existing?.pro_expires_at && new Date(existing.pro_expires_at) > now
    ? new Date(existing.pro_expires_at)   // stack onto remaining time
    : now;
  const newExpiry = new Date(base);
  newExpiry.setMonth(newExpiry.getMonth() + months);

  await supabase.from('user_plans').upsert({
    user_id:        claimed[0].user_id,
    plan:           'pro',
    pro_expires_at: newExpiry.toISOString(),
    updated_at:     now.toISOString(),
  });

  return NextResponse.json({ ok: true, status: 'paid' });
}
