'use client';

import { useState } from 'react';
import { Wand2, Check, RefreshCw } from 'lucide-react';
import ProGate from '@/components/shared/ProGate';
import { isPro } from '@/lib/plans';

const EXAMPLES = [
  'Ich gehe in der Schule jeden Tag.',
  'Er hat gestern nicht gegessen nichts.',
  'Ich bin 20 Jahre alt und ich studiere Informatik.',
];

const MAX_CHARS = 500;

export default function GrammarScreen({ t, state, plan, onUpgrade }) {
  if (!isPro(plan)) {
    return <ProGate t={t} feature="Дүрмийн шалгуурыг" onUpgrade={onUpgrade} />;
  }
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const overLimit = text.length > MAX_CHARS;
  const nearLimit = text.length >= MAX_CHARS * 0.85;

  const fix = async () => {
    if (!text.trim() || loading || overLimit) return;
    setLoading(true); setResult(null);
    try {
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const r = await fetch('/api/grammar', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ text }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'API error');
      setResult(d);
    } catch (e) {
      setResult({ corrected: text, hasErrors: null, errors: [], feedback: `Алдаа: ${e.message}` });
    }
    setLoading(false);
  };

  return (
    <div className="af" style={{ paddingBottom: 24 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 4 }}>ЗАСАГЧ ✏️</div>
        <div className="fd" style={{ fontSize: 26, fontWeight: 800, color: t.text }}>Герман текст засах</div>
        <div style={{ color: t.textMid, fontSize: 13, marginTop: 4 }}>Герман өгүүлбэр бичиж алдааг тайлбарлана</div>
      </div>

      <div style={{ background: t.bgCard, borderRadius: 20, padding: 16, boxShadow: t.shadow, marginBottom: 12 }}>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Герман өгүүлбэрийг энд бич..." rows={4}
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: t.text, lineHeight: 1.6, resize: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 10, borderTop: `1px solid ${overLimit ? '#bc0000' : t.border}` }}>
          <div style={{ fontSize: 12, fontWeight: overLimit ? 700 : 400, color: overLimit ? '#bc0000' : nearLimit ? '#f59e0b' : t.textSoft }}>
            {text.length} / {MAX_CHARS}
            {overLimit && <span style={{ marginLeft: 6 }}>— хэт урт</span>}
          </div>
          <button onClick={fix} disabled={!text.trim() || loading || overLimit}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 12, fontWeight: 800, fontSize: 14, border: 'none', cursor: text.trim() && !loading && !overLimit ? 'pointer' : 'not-allowed', background: text.trim() && !loading && !overLimit ? t.pinkBtn : 'transparent', color: text.trim() && !loading && !overLimit ? '#fff' : t.textSoft, opacity: text.trim() && !loading && !overLimit ? 1 : 0.5 }}>
            <Wand2 size={15} />{loading ? 'Хүлээж байна...' : 'Засах'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', marginBottom: 8 }}>ЖИШЭЭ ТЕСТҮҮД</div>
        {EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => setText(ex)}
            style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 14, background: t.bgCard, border: `1px solid ${t.border}`, cursor: 'pointer', fontSize: 13, color: t.text, fontWeight: 500, boxShadow: t.shadow, width: '100%', marginBottom: 6 }}>
            "{ex}"
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ background: t.bgCard, borderRadius: 20, padding: 24, textAlign: 'center', boxShadow: t.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: 5, background: t.pink, animation: `pulse 0.9s infinite ${i * 0.2}s` }} />)}
          </div>
          <div style={{ color: t.textMid, fontSize: 14 }}>AI засаж байна...</div>
        </div>
      )}

      {result && !loading && (
        <div className="af">
          {result.hasErrors === false && (
            <div style={{ background: t.darkMode ? t.correctBg : '#EDFAF5', border: `2px solid ${t.correct}`, borderRadius: 20, padding: 18, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: t.correct, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={18} color="#fff" strokeWidth={3} /></div>
                <div style={{ fontWeight: 800, color: t.correct, fontSize: 15 }}>Алдаа олдсонгүй!</div>
              </div>
              <div style={{ color: t.text, fontSize: 14, lineHeight: 1.6, marginBottom: 6, background: t.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', padding: '10px 14px', borderRadius: 12, fontWeight: 600 }}>"{result.corrected}"</div>
              <div style={{ color: t.textMid, fontSize: 13, lineHeight: 1.5 }}>{result.feedback}</div>
            </div>
          )}

          {result.hasErrors && (
            <>
              <div style={{ background: t.darkMode ? t.correctBg : '#EDFAF5', border: `2px solid ${t.correct}`, borderRadius: 20, padding: 16, marginBottom: 12 }}>
                <div style={{ color: t.correct, fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 8 }}>ЗАСАГДСАН ХЭЛБЭР</div>
                <div style={{ color: t.text, fontSize: 15, fontWeight: 700, lineHeight: 1.6, marginBottom: 8 }}>"{result.corrected}"</div>
                <div style={{ color: t.textMid, fontSize: 13 }}>{result.feedback}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ background: t.darkMode ? t.wrongBg : '#FFEEEE', color: t.wrong, padding: '4px 14px', borderRadius: 20, fontWeight: 800, fontSize: 13 }}>{result.errors.length} алдаа</div>
                <div style={{ color: t.textMid, fontSize: 13 }}>дараах тайлбарыг уншина уу</div>
              </div>
              {result.errors.map((err, i) => (
                <div key={i} className="au" style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 18, padding: 16, marginBottom: 10, boxShadow: t.shadow, animationDelay: `${i * 80}ms` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ background: t.darkMode ? t.wrongBg : '#FFEEEE', color: t.wrong, padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: 13, textDecoration: 'line-through' }}>{err.wrong}</span>
                    <span style={{ color: t.textMid, fontSize: 16 }}>→</span>
                    <span style={{ background: t.darkMode ? t.correctBg : '#EDFAF5', color: t.correct, padding: '4px 12px', borderRadius: 20, fontWeight: 800, fontSize: 13 }}>{err.right}</span>
                    {err.rule && <span style={{ background: t.darkMode ? t.bgTag : '#F0EEFF', color: t.darkMode ? '#B09AFF' : '#6040D0', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{err.rule}</span>}
                  </div>
                  <div style={{ color: t.text, fontSize: 14, lineHeight: 1.6, borderLeft: `3px solid ${t.pink}`, paddingLeft: 12 }}>{err.explanation}</div>
                </div>
              ))}
            </>
          )}

          {result.hasErrors === null && (
            <div style={{ background: t.bgCard, borderRadius: 20, padding: 16, boxShadow: t.shadow }}>
              <div style={{ color: t.text, fontSize: 14, lineHeight: 1.6 }}>{result.feedback}</div>
            </div>
          )}

          <button onClick={() => { setResult(null); setText(''); }}
            style={{ width: '100%', padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 14, border: `2px solid ${t.border}`, background: 'transparent', color: t.textMid, cursor: 'pointer', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <RefreshCw size={15} /> Дахин засах
          </button>
        </div>
      )}
    </div>
  );
}
