import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request) {
  // Auth check (no rate limit — each request is ~$0.0003)
  const token = request.headers.get('authorization')?.replace(/^Bearer /i, '');
  if (!token) {
    return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
  }
  const { data: { user }, error: authError } = await getServerSupabase().auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
  }

  const formData = await request.formData();
  const audio = formData.get('audio');
  if (!audio) {
    return NextResponse.json({ error: 'Аудио файл байхгүй байна' }, { status: 400 });
  }

  const whisperForm = new FormData();
  whisperForm.append('file', audio, 'recording.webm');
  whisperForm.append('model', 'whisper-1');
  whisperForm.append('language', 'de');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    body: whisperForm,
  });

  if (!res.ok) {
    console.error('Whisper error:', await res.text());
    return NextResponse.json({ error: 'Таних боломжгүй байна' }, { status: 502 });
  }

  const { text } = await res.json();
  return NextResponse.json({ transcript: text ?? '' });
}
