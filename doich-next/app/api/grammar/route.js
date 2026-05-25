import { NextResponse } from 'next/server';

const SYS = `You are a precise German grammar checker for Mongolian learners. Analyze for ALL errors (articles, case/Kasus, verb conjugation, word order, prepositions, spelling).
Respond ONLY with valid JSON, no markdown, no code blocks, just raw JSON:
{"corrected":"fully corrected text","hasErrors":true,"errors":[{"wrong":"exact wrong snippet","right":"corrected","rule":"grammar rule in German","explanation":"тайлбар монгол кирилл үсгээр"}],"feedback":"ерөнхий үнэлгэлт монгол кирилл үсгээр"}
If correct: {"corrected":"...","hasErrors":false,"errors":[],"feedback":"Маш сайн! Алдаа олдсонгүй. Таны герман хэл зөв байна ✓"}`;

export async function POST(request) {
  try {
    const { text } = await request.json();

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model:      'gpt-4o-mini',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: SYS },
          { role: 'user',   content: `German text to check: "${text}"` },
        ],
      }),
    });

    if (!r.ok) {
      return NextResponse.json({ error: await r.text() }, { status: r.status });
    }

    const d   = await r.json();
    const raw = d.choices?.[0]?.message?.content || '{}';

    try {
      return NextResponse.json(JSON.parse(raw.replace(/```json|```/g, '').trim()));
    } catch {
      return NextResponse.json({ corrected: text, hasErrors: null, errors: [], feedback: raw });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
