'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, X, ArrowLeft } from 'lucide-react';

function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

export default function ConjugationCard({ t, exercise, idx, total, onContinue, onQuit, label = 'ҮЙЛ ҮГИЙН ТӨГСГӨЛИЙГ БИЧНЭ ҮҮ' }) {
  const [input,     setInput]     = useState('');
  const [revealed,  setRevealed]  = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInput(''); setRevealed(false); setIsCorrect(null);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [exercise]);

  // Build display sentence: replace conjugated form with "stem___"
  const displayParts = exercise.example
    .replace(new RegExp(escRe(exercise.conjugatedForm), 'i'), '|||')
    .split('|||');
  const hasSplit = displayParts.length === 2;

  const check = () => {
    if (revealed || !input.trim()) return;
    const ok = input.trim().toLowerCase() === exercise.ending.toLowerCase();
    setIsCorrect(ok); setRevealed(true);
  };

  return (
    <div className="af">
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <button onClick={onQuit}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: t.textMid, fontWeight: 700, fontSize: 13, padding: 0 }}>
            <ArrowLeft size={16} /> Гарах
          </button>
          <div style={{ background: t.bgTag, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 800, color: t.text }}>
            {idx + 1}/{total}
          </div>
        </div>
        <div style={{ height: 10, background: t.bgTag, borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(idx / total) * 100}%`, background: t.pinkBtn, borderRadius: 5, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Sentence card */}
      <div style={{ background: t.bgCard, borderRadius: 24, padding: '24px 20px', marginBottom: 14, boxShadow: t.shadowLg, textAlign: 'center' }}>
        <div style={{ fontSize: 22, marginBottom: 10 }}>{exercise.emoji}</div>
        <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 12 }}>
          {label}
        </div>

        <div style={{ fontSize: 17, fontWeight: 600, color: t.text, lineHeight: 2, textAlign: 'center' }}>
          {hasSplit ? (
            <>
              {displayParts[0]}
              <span style={{
                display: 'inline-block',
                borderBottom: `2.5px solid ${revealed ? (isCorrect ? t.correct : t.wrong) : t.pink}`,
                minWidth: 48, margin: '0 2px', textAlign: 'center',
                fontWeight: 800,
                color: revealed ? (isCorrect ? t.correct : t.wrong) : t.text,
              }}>
                {exercise.stem}
                {revealed
                  ? <span style={{ color: isCorrect ? t.correct : t.wrong }}>{exercise.ending}</span>
                  : <span style={{ color: t.pink }}>{input}</span>
                }
              </span>
              {displayParts[1]}
            </>
          ) : (
            <span style={{ color: t.textSoft, fontSize: 14, fontStyle: 'italic' }}>
              Зөв хэлбэрийг бич
            </span>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <span style={{ background: t.bgTag, color: t.textSoft, fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20 }}>
            {exercise.de} · {exercise.mn}
          </span>
        </div>
      </div>

      {/* Input row */}
      {!revealed && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'stretch' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: t.bgCard, borderRadius: 16, border: `2px solid ${t.border}`, padding: '0 16px', boxShadow: t.shadow }}>
            <span style={{ color: t.textMid, fontWeight: 700, fontSize: 15, marginRight: 4 }}>
              {exercise.stem}
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder={exercise.stem === '' ? 'бүтэн хэлбэрийг бич…' : '___'}
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontSize: 17, fontWeight: 800, color: t.text, fontFamily: 'inherit',
                padding: '14px 0',
              }}
            />
          </div>
          <button onClick={check}
            style={{ padding: '0 22px', borderRadius: 16, fontWeight: 800, fontSize: 18, border: 'none', cursor: 'pointer', background: t.pinkBtn, color: '#fff', boxShadow: t.shadowLg }}>
            ✓
          </button>
        </div>
      )}

      {/* Feedback */}
      {revealed && (
        <div style={{
          padding: '14px 18px', borderRadius: 16, marginBottom: 14,
          background: isCorrect ? (t.darkMode ? t.correctBg : '#EDFAF5') : (t.darkMode ? t.wrongBg : '#FFEEEE'),
          border: `2px solid ${isCorrect ? t.correct : t.wrong}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: isCorrect ? t.correct : t.wrong, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isCorrect ? <Check size={18} color="#fff" strokeWidth={3} /> : <X size={18} color="#fff" strokeWidth={3} />}
          </div>
          <div>
            {isCorrect
              ? <div style={{ fontWeight: 800, color: t.correct, fontSize: 15 }}>Зөв! 🎉</div>
              : <>
                  <div style={{ fontWeight: 800, color: t.wrong, fontSize: 15 }}>Буруу байна</div>
                  <div style={{ color: t.textMid, fontSize: 13, marginTop: 3 }}>
                    Зөв хэлбэр: <strong style={{ color: t.text }}>{exercise.stem}{exercise.ending}</strong>
                  </div>
                </>
            }
          </div>
        </div>
      )}

      {revealed && (
        <button onClick={() => onContinue(isCorrect)} className="su"
          style={{ width: '100%', padding: '16px', borderRadius: 18, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', background: t.pinkBtn, color: '#fff', boxShadow: t.shadowLg }}>
          Үргэлжлүүлэх →
        </button>
      )}
    </div>
  );
}
