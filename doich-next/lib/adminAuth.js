import { NextResponse } from 'next/server';
import { getServerSupabase, getUserFromRequest } from './supabaseServer';

// Verify the caller is an authenticated admin (email in ADMIN_EMAILS, comma-separated).
// Returns { user, supabase } on success, or { error } as a NextResponse to return.
export async function requireAdmin(request) {
  const supabase = getServerSupabase();
  const user = await getUserFromRequest(request, supabase);
  if (!user) {
    return { error: NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 }) };
  }
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!admins.includes((user.email || '').toLowerCase())) {
    return { error: NextResponse.json({ error: 'Хандах эрхгүй' }, { status: 403 }) };
  }
  return { user, supabase };
}
