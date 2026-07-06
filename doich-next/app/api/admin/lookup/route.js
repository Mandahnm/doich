import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

// POST /api/admin/lookup  { email }  -> { found, plan, payments }
export async function POST(request) {
  const { error, supabase } = await requireAdmin(request);
  if (error) return error;

  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: 'Имэйл оруулна уу' }, { status: 400 });

  const { data, error: rpcError } = await supabase.rpc('admin_lookup', { p_email: email });
  if (rpcError) {
    console.error('admin_lookup error:', rpcError.message);
    return NextResponse.json({ error: 'Хайлт амжилтгүй' }, { status: 500 });
  }
  return NextResponse.json(data);
}
