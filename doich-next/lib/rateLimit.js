import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const DAILY_LIMIT = 30; // max AI requests per user per day

// Server-side Supabase client using service role key (never exposed to browser)
function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Verifies the Bearer JWT and enforces the daily rate limit.
 * Returns { user } on success, or a NextResponse error to return immediately.
 */
export async function checkAuthAndLimit(request) {
  // 1. Require a valid Supabase JWT
  const token = request.headers.get('authorization')?.replace(/^Bearer /i, '');
  if (!token) {
    return { error: NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 }) };
  }

  const supabase = getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 }) };
  }

  // 2. Upsert today's usage row and increment atomically
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data, error: usageError } = await supabase.rpc('increment_api_usage', {
    p_user_id: user.id,
    p_date:    today,
    p_limit:   DAILY_LIMIT,
  });

  if (usageError) {
    // If the RPC doesn't exist yet, fail open (don't block the user)
    console.error('Rate limit RPC error:', usageError.message);
    return { user };
  }

  if (data === false) {
    return {
      error: NextResponse.json(
        { error: `Өдрийн хязгаар (${DAILY_LIMIT} хүсэлт) хэтэрсэн байна. Маргааш дахин оролдоно уу.` },
        { status: 429 }
      ),
    };
  }

  return { user };
}
