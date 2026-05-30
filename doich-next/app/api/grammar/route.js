import { NextResponse } from 'next/server';
import { checkAuthAndLimit } from '@/lib/rateLimit';

const MAX_TEXT_LENGTH = 500;

const SYS = `You are a precise German grammar checker for Mongolian learners. Analyze for ALL errors (articles, case/Kasus, verb conjugation, word order, prepositions, spelling).
Respond ONLY with valid JSON, no markdown, no code blocks, just raw JSON:
{"corrected":"fully corrected text","hasErrors":true,"errors":[{"wrong":"exact wrong snippet","right":"corrected","rule":"grammar rule in German","explanation":"тайлбар монгол кирилл үсгээр"}],"feedback":"ерөнхий үнэлгэлт монгол кирилл үсгээр"}
If correct: {"corrected":"...","hasErrors":false,"errors":[],"feedback":"Маш сайн! Алдаа олдсонгүй. Таны герман хэл зөв байна ✓"}`;

export async function POST(request) {
  try {
    // Auth + rate limit (shared pool with /api/chat)
    const { error: limitError } = await checkAuthAndLimit(request);
    if (limitError) return limitError;

    const { text } = await request.json();
    const safeText = String(text || '').slice(0, MAX_TEXT_LENGTH);

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model:      'gpt-4o-mini',
        max_tokens: 600,
        messages: [
          { role: 'system', content: SYS },
          { role: 'user',   content: `German text to check: "${safeText}"` },
        ],
      }),
    });

    if (!r.ok) {
      console.error('OpenAI grammar error:', await r.text());
      return NextResponse.json({ error: 'AI үйлчилгээ түр дараа ажиллахгүй байна.' }, { status: 502 });
    }

    const d   = await r.json();
    const raw = d.choices?.[0]?.message?.content || '{}';

    try {
      return NextResponse.json(JSON.parse(raw.replace(/```json|```/g, '').trim()));
    } catch {
      return NextResponse.json({ corrected: safeText, hasErrors: null, errors: [], feedback: raw });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Дотоод алдаа гарлаа.' }, { status: 500 });
  }
}
