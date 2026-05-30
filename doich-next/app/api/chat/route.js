import { NextResponse } from 'next/server';
import { checkAuthAndLimit } from '@/lib/rateLimit';

const MAX_MESSAGE_LENGTH = 500;   // chars per user message
const MAX_HISTORY_TURNS  = 10;    // last N messages kept from history

export async function POST(request) {
  try {
    // Auth + rate limit
    const { user, error: limitError } = await checkAuthAndLimit(request);
    if (limitError) return limitError;

    const { level, message, history = [] } = await request.json();

    // Input caps
    const safeMessage = String(message || '').slice(0, MAX_MESSAGE_LENGTH);
    const safeHistory = history
      .slice(-MAX_HISTORY_TURNS)
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content).slice(0, 1000) }));

    const sys = `Та монгол хүмүүст герман хэл заадаг туслах багш. Хэрэглэгч ${level} түвшинд байна. Үргэлж монгол хэлээр (кирилл) хариулна уу. Герман жишээг герман хэлээр, тайлбарыг монголоор бич.

Форматлах дүрэм (заавал дагах):
- Чухал герман үг, дүрмийн нэр томьёог **ингэж** тодруул (double asterisk)
- Герман жишээ өгүүлбэр, үгийг \`ингэж\` бич (backtick)
- Жагсаалт үед - тэмдэгтээр эхэл
- Чухал зөвлөмж өгөхдөө 💡 тэмдэгтээр эхэл
- Анхааруулга эсвэл нийтлэг алдаа заахдаа ⚠️ тэмдэгтээр эхэл
- Дүрмийн тайлбар хэсэгт ## гарчиг ашигла
- Жишээ хэсэгт 📌 тэмдэгтээр эхэл`;

    const messages = [
      { role: 'system', content: sys },
      ...safeHistory,
      { role: 'user', content: safeMessage },
    ];

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 600, messages }),
    });

    if (!r.ok) {
      console.error('OpenAI error:', await r.text());
      return NextResponse.json({ error: 'AI үйлчилгээ түр дараа ажиллахгүй байна.' }, { status: 502 });
    }

    const d    = await r.json();
    const text = d.choices?.[0]?.message?.content || '';
    return NextResponse.json({ text: text || 'Хариулт хоосон байна.' });
  } catch (err) {
    return NextResponse.json({ error: 'Дотоод алдаа гарлаа.' }, { status: 500 });
  }
}
