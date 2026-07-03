import { createClient } from '@supabase/supabase-js';

// Service-role client for server-side routes. Bypasses RLS — never expose to the client.
export function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Resolve the authenticated user from a request's Bearer token, or null.
export async function getUserFromRequest(request, supabase) {
  const token = request.headers.get('authorization')?.replace(/^Bearer /i, '');
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}
