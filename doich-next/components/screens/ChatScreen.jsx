'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

const EXAMPLES = [
  { t: 'Akkusativ ба Dativ ялгаа юу вэ?',    e: '🤔' },
  { t: 'Modalverben хэрхэн ашиглах вэ?',      e: '📚' },
  { t: 'der/die/das яаж тогтоох вэ?',         e: '🎯' },
];

export default function ChatScreen({ t, state }) {
  const [msgs, setMsgs]     = useState([]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMsgs(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 4 }}>AI БАГШ 💬</div>
        <div className="fd" style={{ fontSize: 26, fontWeight: 800, color: t.text }}>Юу асуух вэ?</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
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
            <div style={{ maxWidth: '85%', padding: '12px 16px', borderRadius: m.role === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px', background: m.role === 'user' ? t.pinkBtn : t.bgCard, color: m.role === 'user' ? '#fff' : t.text, fontSize: 14, lineHeight: 1.65, boxShadow: t.shadow, whiteSpace: 'pre-wrap' }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 6, padding: '12px 16px', background: t.bgCard, borderRadius: '20px 20px 20px 6px', width: 'fit-content', boxShadow: t.shadow }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: t.pink, animation: `pulse 0.9s infinite ${i * 0.15}s` }} />)}
          </div>
        )}
        <div ref={ref} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Герман хэлний асуулт..."
          style={{ flex: 1, background: t.bgCard, border: `2px solid ${t.border}`, borderRadius: 16, padding: '12px 16px', fontSize: 14, color: t.text, outline: 'none', boxShadow: t.shadow }} />
        <button onClick={send} disabled={!input.trim() || loading}
          style={{ width: 48, height: 48, borderRadius: 16, background: t.pinkBtn, border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', opacity: input.trim() && !loading ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadow }}>
          <Send size={18} color="#fff" />
        </button>
      </div>
    </div>
  );
}
