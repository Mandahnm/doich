import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PRICING } from '@/lib/plans';
import { createInvoice } from '@/lib/bonum';
import { getServerSupabase, getUserFromRequest } from '@/lib/supabaseServer';

// POST /api/payments/bonum/create  { planId: 'monthly' | '3month' | 'annual' }
// Creates a Bonum invoice for the selected plan and returns { followUpLink }.
export async function POST(request) {
  try {
    const supabase = getServerSupabase();

    const user = await getUserFromRequest(request, supabase);
    if (!user) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }

    const { planId } = await request.json();
    const plan = PRICING.find(p => p.id === planId);   // price comes from server, never the client
    if (!plan) {
      return NextResponse.json({ error: 'Тариф олдсонгүй' }, { status: 400 });
    }

    // Anti-spam: max 3 open invoices per user per 15 min (Bonum invoices live 15 min).
    const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: openCount } = await supabase
      .from('payments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gte('created_at', windowStart);
    if ((openCount ?? 0) >= 3) {
      return NextResponse.json(
        { error: 'Хэт олон төлбөрийн хүсэлт. Түр хүлээгээд дахин оролдоно уу.' },
        { status: 429 }
      );
    }

    // Unique per-invoice id (≤80 chars) that ties the webhook back to this user + plan.
    const transactionId = `doich-${crypto.randomUUID()}`;

    // Record the pending payment BEFORE hitting Bonum, so a webhook can never arrive
    // for a transaction we don't know about.
    const { error: insertError } = await supabase.from('payments').insert({
      user_id:        user.id,
      plan_id:        plan.id,
      transaction_id: transactionId,
      amount:         plan.price,
      status:         'pending',
    });
    if (insertError) {
      console.error('payments insert failed:', insertError.message);
      return NextResponse.json({ error: 'Төлбөр эхлүүлэхэд алдаа гарлаа' }, { status: 500 });
    }

    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const callback = `${siteUrl}/?pay=return&tx=${transactionId}`;

    const { invoiceId, followUpLink } = await createInvoice({
      amount:        plan.price,
      transactionId,
      callback,
      expiresIn:     900,   // 15 min to complete payment
    });

    // Store Bonum's invoiceId for reconciliation.
    await supabase.from('payments')
      .update({ invoice_id: invoiceId })
      .eq('transaction_id', transactionId);

    return NextResponse.json({ followUpLink, invoiceId, transactionId });
  } catch (err) {
    console.error('Bonum create error:', err);
    return NextResponse.json({ error: 'Төлбөрийн систем түр ажиллахгүй байна' }, { status: 502 });
  }
}
