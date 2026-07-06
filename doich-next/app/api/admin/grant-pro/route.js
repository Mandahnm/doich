import { NextResponse } from 'next/server';
import { PRICING } from '@/lib/plans';
import { requireAdmin } from '@/lib/adminAuth';

// POST /api/admin/grant-pro  { email, planId }  -> { found, pro_expires_at }
export async function POST(request) {
  const { error, supabase } = await requireAdmin(request);
  if (error) return error;

  const { email, planId } = await request.json();
  if (!email) return NextResponse.json({ error: 'Имэйл оруулна уу' }, { status: 400 });

  const plan = PRICING.find(p => p.id === planId);
  if (!plan) return NextResponse.json({ error: 'Тариф буруу' }, { status: 400 });

  const { data, error: rpcError } = await supabase.rpc('admin_grant_pro', {
    p_email:  email,
    p_months: plan.months,
  });
  if (rpcError) {
    console.error('admin_grant_pro error:', rpcError.message);
    return NextResponse.json({ error: 'Идэвхжүүлэлт амжилтгүй' }, { status: 500 });
  }
  return NextResponse.json(data);
}
