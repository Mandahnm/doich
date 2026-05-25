'use client';

import { useState } from 'react';
import { Star, RefreshCw } from 'lucide-react';
import { VOCAB } from '@/lib/vocab';
import FlashCard from '@/components/shared/FlashCard';

const GAME_LABEL = { flashcard: 'Үг таах', gender: 'Der Die Das', review: 'Давталт' };

export default function MistakeScreen({ t, state, setTab, recordMistake, clearMistake }) {
  const mistakePool = Object.entries(state.mistakes || {})
    .sort((a, b) => b[1].count - a[1].count)
    .map(([id]) => VOCAB.find(w => w.id === parseInt(id)))
    .filter(Boolean);

  const [session, setSession] = useState(() =>
    mistakePool.length > 0 ? { words: mistakePool, idx: 0, score: 0, cleared: 0 } : null
  );
  const [view, setView] = useState('session');

  const handleContinue = isCorrect => {
    const cur = session.words[session.idx];
    if (isCorrect) clearMistake(cur.id); else recordMistake(cur.id, 'review');
    const newScore   = session.score   + (isCorrect ? 1 : 0);
    const newCleared = session.cleared + (isCorrect ? 1 : 0);
    const newIdx     = session.idx + 1;
    if (newIdx >= session.words.length) {
      setSession(s => ({ ...s, score: newScore, cleared: newCleared, idx: newIdx })); setView('result');
    } else {
      setSession(s => ({ ...s, score: newScore, cleared: newCleared, idx: newIdx }));
    }
  };

  const restart = () => {
    const pool = Object.entries(state.mistakes || {})
      .sort((a, b) => b[1].count - a[1].count)
      .map(([id]) => VOCAB.find(w => w.id === parseInt(id)))
      .filter(Boolean);
    setSession({ words: pool, idx: 0, score: 0, cleared: 0 });
    setView('session');
  };

  if (mistakePool.length === 0 && !session) {
    return (
      <div className="af" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <div className="fd" style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 8 }}>Алдаа алга!</div>
        <div style={{ color: t.textMid, fontSize: 14, lineHeight: 1.6, marginBottom: 24, padding: '0 32px' }}>
          Одоогоор алдаа бүртгэгдээгүй байна. Тоглоомуудыг тогло!
        </div>
        <button onClick={() => setTab('home')} style={{ padding: '14px 32px', borderRadius: 18, background: t.pinkBtn, color: '#fff', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: t.shadowLg }}>
          ← Буцах
        </button>
      </div>
    );
  }

  if (view === 'result' && session) {
    const total   = session.words.length;
    const cleared = session.cleared;
    const pct     = cleared / total;
    const stars   = pct >= 0.87 ? 3 : pct >= 0.5 ? 2 : 1;
    return (
      <div className="af" style={{ textAlign: 'center', paddingTop: 24 }}>
        <div style={{ fontSize: 72, marginBottom: 8 }} className="ap">{stars === 3 ? '🏆' : stars === 2 ? '🎉' : '💪'}</div>
        <div className="fd" style={{ fontSize: 24, fontWeight: 800, color: t.text, marginBottom: 6 }}>Давталт дууслаа!</div>
        <div style={{ color: t.textMid, fontSize: 13, marginBottom: 20 }}>{cleared}/{total} алдааг засав</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 22 }}>
          {[1, 2, 3].map(s => <Star key={s} size={36} color={s <= stars ? '#FFAA00' : t.border} fill={s <= stars ? '#FFAA00' : t.border} />)}
        </div>
        <div style={{ background: t.bgCard, borderRadius: 24, padding: '22px', boxShadow: t.shadowLg, marginBottom: 18 }}>
          <div className="fd" style={{ fontSize: 48, fontWeight: 800, color: t.text }}>{cleared}<span style={{ fontSize: 22, color: t.textMid }}>/{total}</span></div>
          <div style={{ color: t.textMid, fontSize: 13, marginTop: 4 }}>алдаа засагдлаа</div>
          <div style={{ marginTop: 14, height: 10, background: t.bgTag, borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct * 100}%`, background: 'linear-gradient(90deg,#FF6B6B,#E53E3E)', borderRadius: 5 }} />
          </div>
          <div style={{ color: t.textMid, fontSize: 13, marginTop: 10, lineHeight: 1.5 }}>
            {stars === 3 && 'Гайхалтай! Бүх алдааг засав 🔥'}
            {stars === 2 && 'Сайн байна! Үлдсэн алдааг дахин давт 💪'}
            {stars === 1 && 'Цаашид дадлага хийгээрэй 📖'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setTab('home')} style={{ flex: 1, padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 13, border: `2px solid ${t.border}`, background: 'transparent', color: t.textMid, cursor: 'pointer' }}>← Буцах</button>
          {Object.keys(state.mistakes || {}).length > 0 && (
            <button onClick={restart} style={{ flex: 2, padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 14, border: 'none', background: 'linear-gradient(135deg,#FF6B6B,#E53E3E)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 10px 30px rgba(229,62,62,0.25)' }}>
              <RefreshCw size={16} /> Дахин давтах
            </button>
          )}
        </div>
      </div>
    );
  }

  if (view === 'session' && session) {
    const word  = session.words[session.idx];
    const stage = { id: 'mistake-x', words: session.words, idx: session.idx };
    const info  = (state.mistakes || {})[word?.id];
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ color: '#FF6B6B', fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', display: 'flex', alignItems: 'center', gap: 6 }}>
            ❌ АЛДСАН ҮГС ДАВТАХ
          </div>
          {info && (
            <div style={{ background: t.darkMode ? '#3A1818' : '#FFF0F0', color: '#E53E3E', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
              {info.count}× алдсан
            </div>
          )}
        </div>
        {info?.gameTypes?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {info.gameTypes.map(gt => (
              <div key={gt} style={{ background: t.bgTag, color: t.textMid, padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
                {GAME_LABEL[gt] || gt}
              </div>
            ))}
          </div>
        )}
        <FlashCard t={t} stage={stage} word={word} progress={session.idx / session.words.length} onContinue={handleContinue} onQuit={() => setTab('home')} />
      </div>
    );
  }

  return null;
}
