'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, X, ArrowLeft } from 'lucide-react';

export default function AdjectiveDeclensionCard({ t, exercise, idx, total, onContinue, onQuit }) {
  const [artInput,   setArtInput]  = useState('');
  const [endInput,   setEndInput]  = useState('');
  const [revealed,   setRevealed]  = useState(false);
  const [artOk,      setArtOk]     = useState(null);
  const [endOk,      setEndOk]     = useState(null);
  const [showHint,   setShowHint]  = useState(false);
  const artRef = useRef(null);
  const endRef = useRef(null);

  const hasArticle = !!exercise.articleHint;

  useEffect(() => {
    setArtInput(''); setEndInput('');
    setRevealed(false); setArtOk(null); setEndOk(null); setShowHint(false);
    setTimeout(() => (hasArticle ? artRef : endRef).current?.focus(), 80);
  }, [exercise]);

  const check = () => {
    if (revealed) return;
    const ao = !hasArticle || artInput.trim().toLowerCase() === exercise.articleRest.toLowerCase();
    const eo = endInput.trim().toLowerCase() === exercise.ending.toLowerCase();
    setArtOk(ao); setEndOk(eo); setRevealed(true);
  };

  const isCorrect = revealed && (!hasArticle || artOk) && endOk;

  const { pre, articleHint, articleRest, articleFull, stem, ending, post, grammarLabel } = exercise;

  // Inline blanks use non-breaking spaces so the underline is visible when empty
  const artDisplay = revealed ? articleRest : (artInput || '   ');
  const endDisplay = revealed ? ending       : (endInput  || '  ');

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
        <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 14 }}>
          {hasArticle ? 'АРТИКЛ БА ТЭМДЭГ НЭРИЙН ТӨГСГӨЛИЙГ БИЧНЭ ҮҮ' : 'ТОДОРХОЙЛОГЧГҮЙ ХЭЛБЭР · NULLARTIKEL'}
        </div>

        {/* Inline sentence with blanks */}
        <div style={{ fontSize: 17, fontWeight: 600, color: t.text, lineHeight: 2.2, textAlign: 'center' }}>
          {pre && <span>{pre} </span>}

          {hasArticle ? (
            <>
              {/* Article: hint letter + blank */}
              <span style={{ fontWeight: 800 }}>{articleHint}</span>
              <span style={{
                display: 'inline-block',
                borderBottom: `2.5px solid ${revealed ? (artOk ? t.correct : t.wrong) : t.pink}`,
                minWidth: 34, margin: '0 1px', padding: '0 3px', textAlign: 'center',
                fontWeight: 800,
                color: revealed ? (artOk ? t.correct : t.wrong) : t.text,
              }}>
                {artDisplay}
              </span>
              {' '}
              {/* Adjective: stem + ending blank */}
              <span style={{ fontWeight: 800 }}>{stem}</span>
              <span style={{
                display: 'inline-block',
                borderBottom: `2.5px solid ${revealed ? (endOk ? t.correct : t.wrong) : '#a78bfa'}`,
                minWidth: 26, margin: '0 1px', padding: '0 3px', textAlign: 'center',
                fontWeight: 800,
                color: revealed ? (endOk ? t.correct : t.wrong) : t.text,
              }}>
                {endDisplay}
              </span>
            </>
          ) : (
            /* Nullartikel: single full-form blank */
            <span style={{
              display: 'inline-block',
              borderBottom: `2.5px solid ${revealed ? (endOk ? t.correct : t.wrong) : t.pink}`,
              minWidth: 72, margin: '0 1px', padding: '0 3px', textAlign: 'center',
              fontWeight: 800,
              color: revealed ? (endOk ? t.correct : t.wrong) : t.text,
            }}>
              {endDisplay}
            </span>
          )}

          {' '}<span>{post}</span>
        </div>

        {/* Word + hint button */}
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          <span style={{ background: t.bgTag, color: t.textSoft, fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20 }}>
            {exercise.de} · {exercise.mn}
          </span>
          {!revealed && (
            <button onClick={() => setShowHint(h => !h)}
              style={{
                background: showHint ? t.pinkBg : t.bgTag,
                color: showHint ? t.pink : t.textSoft,
                border: `1.5px solid ${showHint ? t.pink : 'transparent'}`,
                fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20,
                cursor: 'pointer',
              }}>
              💡 Сэжүүр
            </button>
          )}
          {showHint && !revealed && (
            <span style={{ background: t.pinkBg, color: t.pink, fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 20, width: '100%', textAlign: 'center' }}>
              {grammarLabel}
            </span>
          )}
        </div>
      </div>

      {/* Input row */}
      {!revealed && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'stretch' }}>
          {hasArticle && (
            <div style={{
              display: 'flex', alignItems: 'center',
              background: t.bgCard, borderRadius: 16,
              border: `2px solid ${artInput ? t.pink : t.border}`,
              padding: '0 10px', boxShadow: t.shadow, minWidth: 88,
            }}>
              <span style={{ color: t.pink, fontWeight: 800, fontSize: 17, flexShrink: 0 }}>{articleHint}</span>
              <input
                ref={artRef}
                value={artInput}
                onChange={e => setArtInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); endRef.current?.focus(); }
                }}
                placeholder="___"
                style={{
                  width: 54, border: 'none', background: 'transparent', outline: 'none',
                  fontSize: 17, fontWeight: 800, color: t.text, fontFamily: 'inherit',
                  padding: '14px 0 14px 2px',
                }}
              />
            </div>
          )}

          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: t.bgCard, borderRadius: 16,
            border: `2px solid ${endInput ? '#a78bfa' : t.border}`,
            padding: '0 14px', boxShadow: t.shadow,
          }}>
            {stem && (
              <span style={{ color: t.textMid, fontWeight: 800, fontSize: 16, marginRight: 2, flexShrink: 0 }}>{stem}</span>
            )}
            <input
              ref={endRef}
              value={endInput}
              onChange={e => setEndInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && check()}
              placeholder={stem ? '___' : 'бүтэн хэлбэрийг бич…'}
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontSize: 17, fontWeight: 800, color: t.text, fontFamily: 'inherit',
                padding: '14px 0',
              }}
            />
          </div>

          <button onClick={check}
            style={{
              padding: '0 20px', borderRadius: 16, fontWeight: 800, fontSize: 18,
              border: 'none', cursor: 'pointer', background: t.pinkBtn, color: '#fff',
              boxShadow: t.shadowLg, flexShrink: 0,
            }}>
            ✓
          </button>
        </div>
      )}

      {/* Feedback */}
      {revealed && (
        <div style={{
          padding: '14px 18px', borderRadius: 16, marginBottom: 14,
          background: isCorrect
            ? (t.darkMode ? t.correctBg : '#EDFAF5')
            : (t.darkMode ? t.wrongBg   : '#FFEEEE'),
          border: `2px solid ${isCorrect ? t.correct : t.wrong}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 16, flexShrink: 0,
            background: isCorrect ? t.correct : t.wrong,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isCorrect
              ? <Check size={18} color="#fff" strokeWidth={3} />
              : <X     size={18} color="#fff" strokeWidth={3} />
            }
          </div>
          <div>
            {isCorrect
              ? <div style={{ fontWeight: 800, color: t.correct, fontSize: 15 }}>Зөв! 🎉</div>
              : <>
                  <div style={{ fontWeight: 800, color: t.wrong, fontSize: 15 }}>Буруу байна</div>
                  <div style={{ color: t.textMid, fontSize: 13, marginTop: 3 }}>
                    Зөв хэлбэр:{' '}
                    <strong style={{ color: t.text }}>
                      {hasArticle
                        ? `${articleFull} ${stem}${ending}`
                        : ending
                      }
                    </strong>
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
