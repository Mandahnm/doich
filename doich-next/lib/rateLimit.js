import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { FREE_AI_TUTOR_DAILY, PRO_AI_TUTOR_DAILY } from './plans';

function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function getUserPlan(supabase, userId) {
  try {
    const { data } = await supabase
      .from('user_plans')
      .select('plan, pro_expires_at')
      .eq('user_id', userId)
      .single();
    if (!data || data.plan !== 'pro') return 'free';
    if (data.pro_expires_at && new Date(data.pro_expires_at) <= new Date()) return 'free';
    return 'pro';
  } catch {
    return 'free'; // graceful fallback if table doesn't exist yet
  }
}

/**
 * Pro-only gate: verifies JWT, then blocks free users with 403.
 * Use for grammar and pronunciation routes.
 */
export async function requirePro(request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer /i, '');
  if (!token) {
    return { error: NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 }) };
  }
  const supabase = getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 }) };
  }
  const plan = await getUserPlan(supabase, user.id);
  if (plan !== 'pro') {
    return {
      error: NextResponse.json(
        { error: 'Pro эрх шаардлагатай. Үнэ тарифаа шалгана уу.', upgradeRequired: true },
        { status: 403 }
      ),
    };
  }
  return { user };
}

/**
 * AI chat gate: verifies JWT + enforces plan-aware daily rate limit.
 * Free users: 5 requests/day. Pro users: 500 requests/day.
 */
export async function checkAuthAndLimit(request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer /i, '');
  if (!token) {
    return { error: NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 }) };
  }

  const supabase = getServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 }) };
  }

  const plan  = await getUserPlan(supabase, user.id);
  const limit = plan === 'pro' ? PRO_AI_TUTOR_DAILY : FREE_AI_TUTOR_DAILY;
  const today = new Date().toISOString().slice(0, 10);

  const { data, error: usageError } = await supabase.rpc('increment_api_usage', {
    p_user_id: user.id,
    p_date:    today,
    p_limit:   limit,
  });

  if (usageError) {
    console.error('Rate limit RPC error:', usageError.message);
    return { user, plan }; // fail open
  }

  if (data === false) {
    const msg = plan === 'pro'
      ? `Өдрийн хязгаар (${limit} хүсэлт) хэтэрсэн байна. Маргааш дахин оролдоно уу.`
      : `Өдрийн ${FREE_AI_TUTOR_DAILY} чатын хязгаар дүүрлээ. 👑 Pro авснаар хязгааргүй чат хийнэ үү.`;
    return {
      error: NextResponse.json(
        { error: msg, upgradeRequired: plan !== 'pro', limitReached: true },
        { status: 429 }
      ),
    };
  }

  return { user, plan };
}
