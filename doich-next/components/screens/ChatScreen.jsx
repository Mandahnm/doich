'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Trash2, Bot } from 'lucide-react';
import { WithSkeleton, ChatSkeleton } from '@/components/shared/ScreenSkeleton';

const EXAMPLES = [
  { t: 'Akkusativ ба Dativ ялгаа юу вэ?',  e: '🔤' },
  { t: 'Modalverben хэрхэн ашиглах вэ?',   e: '📖' },
  { t: 'der/die/das яаж тогтоох вэ?',       e: '🎯' },
  { t: 'Perfekt ба Präteritum ялгаа?',      e: '⏳' },
  { t: 'Герман үг цээжлэх арга?',           e: '💡' },
  { t: 'Харьцуулах өгүүлбэр яаж үүсгэх?',  e: '📝' },
];

// ── Inline parser: **bold** and `code` ───────────────────────────────────
function parseInline(text, isDark) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: isDark ? '#f1c100' : '#745b00', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <span key={i} style={{ background: isDark ? '#002a44' : '#dceeff', color: isDark ? '#9ccaff' : '#0062a1', padding: '1px 7px', borderRadius: 6, fontWeight: 700, fontSize: '0.9em' }}>{part.slice(1, -1)}</span>;
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

function RichMessage({ content, isDark }) {
  const lines = content.split('\n');
  const elems = [];
  let bullets = [];
  let key = 0;
  const flushBullets = () => {
    if (!bullets.length) return;
    elems.push(
      <ul key={key++} style={{ margin: '6px 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
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
    if (!line) { flushBullets(); elems.push(<div key={key++} style={{ height: 6 }} />); continue; }
    if (/^#{2,3} /.test(line)) {
      flushBullets();
      elems.push(<div key={key++} style={{ fontWeight: 800, fontSize: 14, marginTop: 10, marginBottom: 4, paddingBottom: 4, borderBottom: `2px solid ${isDark ? '#f1c10030' : '#ffcc0050'}` }}>{parseInline(line.replace(/^#{2,3} /, ''), isDark)}</div>);
      continue;
    }
    if (/^[-•] /.test(line)) { bullets.push(line.slice(2)); continue; }
    const calloutKey = Object.keys(CALLOUT_STYLES).find(e => line.startsWith(e));
    if (calloutKey) {
      flushBullets();
      const cs = CALLOUT_STYLES[calloutKey];
      elems.push(<div key={key++} style={{ background: isDark ? cs.bg[0] : cs.bg[1], border: `1px solid ${cs.border}40`, borderLeft: `3px solid ${cs.border}`, borderRadius: 10, padding: '8px 12px', margin: '4px 0', fontSize: 13, lineHeight: 1.6 }}>{parseInline(line, isDark)}</div>);
      continue;
    }
    flushBullets();
    elems.push(<p key={key++} style={{ margin: '2px 0', lineHeight: 1.7, fontSize: 14 }}>{parseInline(line, isDark)}</p>);
  }
  flushBullets();
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>{elems}</div>;
}

// ── Stable sub-components (defined outside to prevent remount on every keystroke) ──

function AiAvatar({ isDark, t }) {
  return (
    <div style={{ width: 32, height: 32, borderRadius: 10, background: isDark ? '#2e2600' : '#fff8d4', border: `1.5px solid ${isDark ? '#c9a00040' : '#ffcc0060'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end' }}>
      <Bot size={16} color={isDark ? '#f1c100' : '#745b00'} />
    </div>
  );
}

function LoadingBubble({ isDark, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      <AiAvatar isDark={isDark} t={t} />
      <div style={{ display: 'flex', gap: 5, padding: '14px 18px', background: t.bgCard, borderRadius: '20px 20px 20px 6px', boxShadow: t.shadow, border: `1px solid ${t.border}` }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: isDark ? '#f1c100' : '#ffcc00', animation: `pulse 0.9s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ showQuestions, isDark, t, onSend }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: showQuestions ? 16 : 24, padding: showQuestions ? '16px 0' : '48px 0', flex: 1, justifyContent: showQuestions ? 'flex-start' : 'center' }}>
      <div style={{ width: showQuestions ? 56 : 72, height: showQuestions ? 56 : 72, borderRadius: showQuestions ? 18 : 22, background: isDark ? '#2e2600' : '#fff8d4', border: `2px solid ${isDark ? '#c9a00040' : '#ffcc0060'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isDark ? 'none' : '0 8px 24px rgba(255,180,0,0.18)' }}>
        <Sparkles size={showQuestions ? 26 : 32} color={isDark ? '#f1c100' : '#745b00'} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="fd" style={{ fontSize: showQuestions ? 18 : 22, fontWeight: 800, color: t.text, marginBottom: 6 }}>AI багш бэлэн байна</div>
        <div style={{ color: t.textSoft, fontSize: 13, lineHeight: 1.6 }}>Герман хэлний асуултаа асуугаарай</div>
      </div>
      {showQuestions && (
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {EXAMPLES.map((q, i) => (
            <button key={i} onClick={() => onSend(q.t)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 14, background: t.bgCard, border: `1px solid ${t.border}`, cursor: 'pointer', textAlign: 'left', boxShadow: t.shadow, transition: 'border-color 0.2s', gridColumn: i === 4 ? '1 / -1' : 'auto' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{q.e}</span>
              <span style={{ color: t.text, fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{q.t}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Messages({ msgs, loading, isDark, t, endRef }) {
  return (
    <>
      {msgs.map((m, i) => (
        <div key={i} className="au" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
          {m.role === 'assistant' && <AiAvatar isDark={isDark} t={t} />}
          <div style={{
            maxWidth: m.role === 'user' ? '72%' : '88%',
            padding: m.role === 'user' ? '10px 16px' : '14px 18px',
            borderRadius: m.role === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
            background: m.role === 'user' ? t.pinkBtn : t.bgCard,
            color: m.role === 'user' ? t.pinkBtnText : t.text,
            fontSize: 14, lineHeight: 1.6,
            boxShadow: t.shadow,
            border: m.role === 'assistant' ? `1px solid ${t.border}` : 'none',
          }}>
            {m.role === 'assistant' ? <RichMessage content={m.content} isDark={isDark} /> : m.content}
          </div>
        </div>
      ))}
      {loading && <LoadingBubble isDark={isDark} t={t} />}
      <div ref={endRef} />
    </>
  );
}

export default function ChatScreen({ t, state, onUpdateHistory }) {
  return <WithSkeleton ms={250} skeleton={<ChatSkeleton t={t} />}><ChatScreenInner t={t} state={state} onUpdateHistory={onUpdateHistory} /></WithSkeleton>;
}

function ChatScreenInner({ t, state, onUpdateHistory }) {
  const [msgs,     setMsgs]     = useState(() => state.chatHistory || []);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const ref      = useRef(null);
  const inputRef = useRef(null);
  const isDark   = t.darkMode;

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  useEffect(() => { onUpdateHistory(msgs); }, [msgs]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    const userMsg = { role: 'user', content: msg };
    setMsgs(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ level: state.userLevel, message: msg, history: msgs }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'API error');
      setMsgs(m => [...m, { role: 'assistant', content: d.text }]);
    } catch (e) {
      setMsgs(m => [...m, { role: 'assistant', content: `Алдаа: ${e.message}` }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // InputBar JSX is inlined in both returns below (not a sub-component)
  // so the <input> element is never unmounted on re-render → keyboard stays open on mobile

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="af" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, height: 'calc(100vh - 48px)' }}>

        {/* Left sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          {/* AI info card */}
          <div style={{ background: isDark ? '#2e2600' : '#fff8d4', borderRadius: 20, padding: '20px 18px', border: `1.5px solid ${isDark ? '#c9a00040' : '#ffcc0060'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: isDark ? '#3d3000' : '#ffcc00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={22} color={isDark ? '#f1c100' : '#241a00'} />
              </div>
              <div>
                <div className="fd" style={{ fontWeight: 800, fontSize: 15, color: t.text }}>AI Багш</div>
                <div style={{ fontSize: 12, color: t.textSoft }}>Герман хэлний туслагч</div>
              </div>
            </div>
            <div style={{ background: isDark ? '#00000030' : '#ffffff80', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: t.textMid, lineHeight: 1.6 }}>
              Дүрэм, үгсийн сан, өгүүлбэр зохиох болон бусад асуултаа асуугаарай.
            </div>
          </div>

          {/* Level badge */}
          <div style={{ background: t.bgCard, borderRadius: 16, padding: '12px 16px', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: t.textMid, fontWeight: 600 }}>Таны түвшин</span>
            <span style={{ background: isDark ? '#2e2600' : '#fff8d4', color: isDark ? '#f1c100' : '#745b00', fontWeight: 800, fontSize: 13, padding: '3px 10px', borderRadius: 10 }}>{state.userLevel}</span>
          </div>

          {/* Suggested questions */}
          <div>
            <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', marginBottom: 10 }}>САНАЛ БОЛГОХ АСУУЛТ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {EXAMPLES.map((q, i) => (
                <button key={i} onClick={() => send(q.t)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: t.bgCard, border: `1px solid ${t.border}`, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s, background 0.2s' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{q.e}</span>
                  <span style={{ color: t.text, fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{q.t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clear button */}
          {msgs.length > 0 && (
            <button onClick={() => setMsgs([])}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 14, background: t.bgCard, border: `1px solid ${t.border}`, cursor: 'pointer', color: t.textMid, fontSize: 13, fontWeight: 700, marginTop: 'auto' }}>
              <Trash2 size={14} /> Чат цэвэрлэх
            </button>
          )}
        </div>

        {/* Right chat panel */}
        <div style={{ display: 'flex', flexDirection: 'column', background: t.bgCard, borderRadius: 24, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
          {/* Chat header */}
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e80' }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>AI Багш онлайн байна</span>
            </div>
            {msgs.length > 0 && (
              <button onClick={() => setMsgs([])}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: 'transparent', border: `1px solid ${t.border}`, cursor: 'pointer', color: t.textMid, fontSize: 12, fontWeight: 600 }}>
                <Trash2 size={13} /> Цэвэрлэх
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {msgs.length === 0 ? <EmptyState showQuestions={false} isDark={isDark} t={t} onSend={send} /> : <Messages msgs={msgs} loading={loading} isDark={isDark} t={t} endRef={ref} />}
          </div>

          {/* Input */}
          <div style={{ padding: '0 22px 20px' }}>
            <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: t.bgCard, border: `1.5px solid ${input ? (isDark ? '#f1c100' : '#ffcc00') : t.border}`, borderRadius: 20, padding: '0 6px 0 18px', boxShadow: t.shadow, transition: 'border-color 0.2s' }}>
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Герман хэлний асуулт..."
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: t.text, padding: '13px 0' }} />
                <button onClick={() => send()} disabled={!input.trim() || loading}
                  style={{ width: 38, height: 38, borderRadius: 14, background: input.trim() && !loading ? t.pinkBtn : t.bgTag, border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                  <Send size={16} color={input.trim() && !loading ? t.pinkBtnText : t.textSoft} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MOBILE ────────────────────────────────────────────────────────────────
  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 98px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: isDark ? '#2e2600' : '#fff8d4', border: `1.5px solid ${isDark ? '#c9a00040' : '#ffcc0060'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={18} color={isDark ? '#f1c100' : '#745b00'} />
          </div>
          <div>
            <div className="fd" style={{ fontWeight: 800, fontSize: 16, color: t.text, lineHeight: 1 }}>AI Багш</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: 11, color: t.textSoft, fontWeight: 600 }}>Онлайн · {state.userLevel} түвшин</span>
            </div>
          </div>
        </div>
        {msgs.length > 0 && (
          <button onClick={() => setMsgs([])}
            style={{ width: 34, height: 34, borderRadius: 10, background: t.bgCard, border: `1px solid ${t.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={14} color={t.textMid} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 4 }}>
        {msgs.length === 0 ? <EmptyState showQuestions={true} isDark={isDark} t={t} onSend={send} /> : <Messages msgs={msgs} loading={loading} isDark={isDark} t={t} endRef={ref} />}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: t.bgCard, border: `1.5px solid ${input ? (isDark ? '#f1c100' : '#ffcc00') : t.border}`, borderRadius: 20, padding: '0 6px 0 18px', boxShadow: t.shadow, transition: 'border-color 0.2s' }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Герман хэлний асуулт..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: t.text, padding: '13px 0' }} />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            style={{ width: 38, height: 38, borderRadius: 14, background: input.trim() && !loading ? t.pinkBtn : t.bgTag, border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
            <Send size={16} color={input.trim() && !loading ? t.pinkBtnText : t.textSoft} />
          </button>
        </div>
      </div>
    </div>
  );
}
