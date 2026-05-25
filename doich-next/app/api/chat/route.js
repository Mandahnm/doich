import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { level, message, history = [] } = await request.json();

    const sys = `Та монгол хүмүүст герман хэл заадаг туслах багш. Хэрэглэгч ${level} түвшинд байна. Үргэлж монгол хэлээр (кирилл) хариулна уу. Герман жишээг герман хэлээр, тайлбарыг монголоор бич. Богино тодорхой байна.`;

    const messages = [
      { role: 'system', content: sys },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 1000, messages }),
    });

    if (!r.ok) {
      return NextResponse.json({ error: await r.text() }, { status: r.status });
    }

    const d    = await r.json();
    const text = d.choices?.[0]?.message?.content || '';
    return NextResponse.json({ text: text || 'Хариулт хоосон байна.' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
