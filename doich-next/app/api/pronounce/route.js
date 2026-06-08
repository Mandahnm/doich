import { NextResponse } from 'next/server';
import { requirePro } from '@/lib/rateLimit';

export async function POST(request) {
  // Pro-only: Whisper transcription costs per request
  const { error: authError } = await requirePro(request);
  if (authError) return authError;

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
