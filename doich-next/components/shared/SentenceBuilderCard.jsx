'use client';

import { useState, useEffect } from 'react';
import SessionHeader from './SessionHeader';

// Split sentence into uniquely-indexed tokens (handles duplicate words)
function tokenize(sentence) {
  return sentence.split(' ').map((word, idx) => ({ word, idx }));
}

export default function SentenceBuilderCard({ t, stage, word, progress, onContinue, onQuit }) {
  const [tokens,    setTokens]    = useState([]);
  const [pool,      setPool]      = useState([]);
  const [placed,    setPlaced]    = useState([]);
  const [revealed,  setRevealed]  = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const toks = tokenize(word.example);
    setTokens(toks);
    setPool([...toks].sort(() => Math.random() - 0.5));
    setPlaced([]);
    setRevealed(false);
    setIsCorrect(null);
  }, [word]);

  const pickWord = tok => {
    if (revealed) return;
    setPool(p => p.filter(tk => tk.idx !== tok.idx));
    setPlaced(p => [...p, tok]);
  };

  const removeWord = tok => {
    if (revealed) return;
    setPlaced(p => p.filter(tk => tk.idx !== tok.idx));
    setPool(p => [...p, tok]);
  };

  const check = () => {
    if (revealed || placed.length !== tokens.length) return;
    const answer  = placed.map(tk => tk.word).join(' ').toLowerCase();
    const correct = tokens.map(tk => tk.word).join(' ').toLowerCase();
    setRevealed(true);
    setIsCorrect(answer === correct);
  };

  const allPlaced = placed.length === tokens.length;

  return (
    <div className="af">
      <SessionHeader t={t} progress={progress} idx={stage.idx} total={stage.words.length} onQuit={onQuit} cefr={stage.id.split('-')[1]} />

      {/* Prompt card */}
      <div style={{ background: t.bgCard, borderRadius: 24, padding: '20px 22px', marginBottom: 16, textAlign: 'center', boxShadow: t.shadowLg }}>
        <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 12 }}>
          ӨГҮҮЛБЭР ЗОХИО
        </div>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{word.emoji}</div>
        <div style={{ color: t.textMid, fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>
          {word.mn}
        </div>
      </div>

      {/* Answer zone */}
      <div style={{
        minHeight: 58, background: t.bgCard, borderRadius: 18, padding: '10px 14px',
        marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
        border: `2px solid ${
          revealed
            ? isCorrect ? t.correct : t.wrong
            : placed.length > 0 ? t.pink : t.border
        }`,
        transition: 'border-color 0.2s',
        boxShadow: t.shadow,
      }}>
        {placed.length === 0 && (
          <span style={{ color: t.textSoft, fontSize: 13, fontStyle: 'italic', userSelect: 'none' }}>
            Үгсийг дарж байрлуул...
          </span>
        )}
        {placed.map(tok => (
          <button key={tok.idx} onClick={() => removeWord(tok)} disabled={revealed}
            style={{
              padding: '7px 13px', borderRadius: 20, border: 'none',
              fontWeight: 700, fontSize: 14, cursor: revealed ? 'default' : 'pointer',
              background: revealed
                ? isCorrect
                  ? (t.darkMode ? '#14532D55' : '#D1FAE5')
                  : (t.darkMode ? '#7F1D1D55' : '#FEE2E2')
                : t.pinkBg,
              color: revealed
                ? isCorrect ? t.correct : t.wrong
                : t.pink,
              transition: 'background 0.15s',
            }}>
            {tok.word}
          </button>
        ))}
      </div>

      {/* Correct sentence (shown on wrong answer) */}
      {revealed && !isCorrect && (
        <div style={{
          background: t.bgTag, borderRadius: 14, padding: '10px 16px', marginBottom: 12,
        }}>
          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 4 }}>
            ЗӨВ ӨГҮҮЛБЭР
          </div>
          <div style={{ color: t.text, fontSize: 15, fontWeight: 700 }}>
            {tokens.map(tk => tk.word).join(' ')}
          </div>
        </div>
      )}

      {/* Word pool */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16,
        minHeight: 48, padding: '4px 0',
      }}>
        {pool.map(tok => (
          <button key={tok.idx} onClick={() => pickWord(tok)} disabled={revealed}
            style={{
              padding: '9px 15px', borderRadius: 20,
              border: `1.5px solid ${t.border}`,
              background: t.bgCard, color: t.text,
              fontWeight: 700, fontSize: 14,
              cursor: revealed ? 'default' : 'pointer',
              boxShadow: t.shadow,
              opacity: revealed ? 0.35 : 1,
              transition: 'opacity 0.2s',
            }}>
            {tok.word}
          </button>
        ))}
      </div>

      {/* Check button */}
      {!revealed && (
        <button onClick={check} disabled={!allPlaced}
          style={{
            width: '100%', padding: '15px', borderRadius: 16, border: 'none',
            fontWeight: 800, fontSize: 15,
            background: allPlaced ? t.pinkBtn : t.bgTag,
            color: allPlaced ? '#fff' : t.textSoft,
            cursor: allPlaced ? 'pointer' : 'not-allowed',
            boxShadow: allPlaced ? t.shadowLg : 'none',
            transition: 'all 0.2s', marginBottom: 14,
          }}>
          Шалгах ✓
        </button>
      )}

      {/* Result + continue */}
      {revealed && (
        <>
          <div style={{
            fontWeight: 800, fontSize: 15, textAlign: 'center',
            color: isCorrect ? '#22C55E' : '#EF4444',
            background: isCorrect
              ? (t.darkMode ? '#14532D44' : '#F0FDF4')
              : (t.darkMode ? '#7F1D1D44' : '#FEF2F2'),
            borderRadius: 12, padding: '10px 16px', marginBottom: 12,
          }}>
            {isCorrect ? '✓ Зөв! Гайхалтай!' : '✗ Буруу!'}
          </div>
          <button onClick={() => onContinue(isCorrect)} className="su"
            style={{
              width: '100%', padding: '16px', borderRadius: 18,
              fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer',
              background: t.pinkBtn, color: '#fff', boxShadow: t.shadowLg,
            }}>
            Үргэлжлүүлэх →
          </button>
        </>
      )}
    </div>
  );
}
