'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

const EXAMPLES = [
  { t: 'Akkusativ ба Dativ ялгаа юу вэ?', e: '🤔' },
  { t: 'Modalverben хэрхэн ашиглах вэ?',  e: '📚' },
  { t: 'der/die/das яаж тогтоох вэ?',      e: '🎯' },
];

// ── Inline parser: **bold** and `code` ────────────────────────────────────
function parseInline(text, isDark) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: isDark ? '#f1c100' : '#745b00', fontWeight: 800 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <span key={i} style={{
          background: isDark ? '#002a44' : '#dceeff',
          color: isDark ? '#9ccaff' : '#0062a1',
          padding: '1px 7px', borderRadius: 6,
          fontWeight: 700, fontSize: '0.9em',
          letterSpacing: '0.01em',
        }}>
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const CALLOUT_STYLES = {
  '💡': { bg: ['#2a2400', '#fffde7'], border: '#ffcc00' },
  '⚠️': { bg: ['#2a1000', '#fff3e0'], border: '#ff9800' },
  '📌': { bg: ['#001a2a', '#e3f2fd'], border: '#0062a1' },
  '✅': { bg: ['#001a0a', '#e8f5e9'], border: '#006d3a' },
  '❌': { bg: ['#2a0000', '#ffebee'], border: '#bc0000' },
  '🎯': { bg: ['#1a0a00', '#fff8d4'], border: '#745b00' },
  '📝': { bg: ['#001a1a', '#e0f7fa'], border: '#006d3a' },
};

// ── Full message renderer ─────────────────────────────────────────────────
function RichMessage({ content, isDark, t }) {
  const lines   = content.split('\n');
  const elems   = [];
  let bullets   = [];
  let key       = 0;

  const flushBullets = () => {
    if (!bullets.length) return;
    elems.push(
      <ul key={key++} style={{ margin: '6px 0 6px 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: isDark ? '#f1c100' : '#745b00', fontWeight: 800, fontSize: 16, lineHeight: 1.5, flexShrink: 0 }}>•</span>
            <span style={{ lineHeight: 1.6 }}>{parseInline(b, isDark)}</span>
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  for (const raw of lines) {
    const line = raw.trim();

    // Empty line → spacing
    if (!line) {
      flushBullets();
      elems.push(<div key={key++} style={{ height: 6 }} />);
      continue;
    }

    // ## or ### Heading
    if (/^#{2,3} /.test(line)) {
      flushBullets();
      const text = line.replace(/^#{2,3} /, '');
      elems.push(
        <div key={key++} style={{
          fontWeight: 800, fontSize: 14, color: isDark ? '#e4e2e1' : '#1b1c1c',
          marginTop: 10, marginBottom: 4,
          paddingBottom: 4,
          borderBottom: `2px solid ${isDark ? '#f1c10030' : '#ffcc0050'}`,
        }}>
          {parseInline(text, isDark)}
        </div>
      );
      continue;
    }

    // Bullet
    if (/^[-•] /.test(line)) {
      bullets.push(line.slice(2));
      continue;
    }

    // Callout (💡 ⚠️ 📌 etc.)
    const calloutKey = Object.keys(CALLOUT_STYLES).find(e => line.startsWith(e));
    if (calloutKey) {
      flushBullets();
      const cs = CALLOUT_STYLES[calloutKey];
      elems.push(
        <div key={key++} style={{
          background: isDark ? cs.bg[0] : cs.bg[1],
          border: `1px solid ${cs.border}40`,
          borderLeft: `3px solid ${cs.border}`,
          borderRadius: 10, padding: '8px 12px', margin: '4px 0',
          fontSize: 13, lineHeight: 1.6,
        }}>
          {parseInline(line, isDark)}
        </div>
      );
      continue;
    }

    // Normal paragraph
    flushBullets();
    elems.push(
      <p key={key++} style={{ margin: '2px 0', lineHeight: 1.7, fontSize: 14 }}>
        {parseInline(line, isDark)}
      </p>
    );
  }

  flushBullets();
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>{elems}</div>;
}

// ── Screen ────────────────────────────────────────────────────────────────
export default function ChatScreen({ t, state, onUpdateHistory }) {
  const [msgs,    setMsgs]    = useState(() => state.chatHistory || []);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const isDark = t.darkMode;

  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  useEffect(() => { onUpdateHistory(msgs); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMsgs(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ level: state.userLevel, message: input, history: msgs }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'API error');
      setMsgs(m => [...m, { role: 'assistant', content: d.text }]);
    } catch (e) {
      setMsgs(m => [...m, { role: 'assistant', content: `Алдаа: ${e.message}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 98px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 4 }}>AI БАГШ 💬</div>
          <div className="fd" style={{ fontSize: 26, fontWeight: 800, color: t.text }}>Юу асуух вэ?</div>
        </div>
        {msgs.length > 0 && (
          <button onClick={() => setMsgs([])}
            style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: t.textMid, cursor: 'pointer' }}>
            Цэвэрлэх
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
        {msgs.length === 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 10 }}>ЖИШЭЭ АСУУЛТУУД</div>
            {EXAMPLES.map((q, i) => (
              <button key={i} onClick={() => setInput(q.t)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 16, background: t.bgCard, border: `1px solid ${t.border}`, cursor: 'pointer', marginBottom: 8, boxShadow: t.shadow }}>
                <span style={{ fontSize: 20 }}>{q.e}</span>
                <span style={{ color: t.text, fontSize: 14, fontWeight: 600 }}>{q.t}</span>
              </button>
            ))}
          </div>
        )}

        {msgs.map((m, i) => (
          <div key={i} className="au" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'user' ? (
              /* User bubble */
              <div style={{
                maxWidth: '78%', padding: '11px 16px',
                borderRadius: '20px 20px 6px 20px',
                background: t.pinkBtn, color: t.pinkBtnText,
                fontSize: 14, lineHeight: 1.6,
                boxShadow: t.shadow,
              }}>
                {m.content}
              </div>
            ) : (
              /* AI rich message */
              <div style={{
                maxWidth: '90%', padding: '14px 18px',
                borderRadius: '20px 20px 20px 6px',
                background: t.bgCard,
                color: t.text,
                boxShadow: t.shadow,
                border: `1px solid ${t.border}`,
              }}>
                <RichMessage content={m.content} isDark={isDark} t={t} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 6, padding: '14px 18px', background: t.bgCard, borderRadius: '20px 20px 20px 6px', width: 'fit-content', boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: t.pink, animation: `pulse 0.9s infinite ${i * 0.15}s` }} />
            ))}
          </div>
        )}
        <div ref={ref} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Герман хэлний асуулт..."
          style={{ flex: 1, background: t.bgCard, border: `2px solid ${t.border}`, borderRadius: 16, padding: '12px 16px', fontSize: 14, color: t.text, outline: 'none', boxShadow: t.shadow }} />
        <button onClick={send} disabled={!input.trim() || loading}
          style={{ width: 48, height: 48, borderRadius: 16, background: t.pinkBtn, border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', opacity: input.trim() && !loading ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadow }}>
          <Send size={18} color={t.pinkBtnText} />
        </button>
      </div>
    </div>
  );
}
