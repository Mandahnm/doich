'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';
import SessionHeader from './SessionHeader';

export default function ListeningCard({ t, stage, word, progress, onContinue, onQuit }) {
  const [input,     setInput]     = useState('');
  const [revealed,  setRevealed]  = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [playing,   setPlaying]   = useState(false);
  const inputRef = useRef(null);
  const audioRef = useRef(null);

  // Auto-play + reset on new word
  useEffect(() => {
    setInput(''); setRevealed(false); setIsCorrect(null);
    const timer = setTimeout(() => playAudio(), 350);
    return () => clearTimeout(timer);
  }, [word]);

  // Keep input focused while answering
  useEffect(() => {
    if (!revealed) inputRef.current?.focus();
  }, [word, revealed]);

  const playAudio = () => {
    if (playing) return;
    setPlaying(true);
    const audio = new Audio(`/audio/${word.id}.mp3`);
    audioRef.current = audio;
    audio.onended  = () => setPlaying(false);
    audio.onerror  = () => setPlaying(false);
    audio.play().catch(() => setPlaying(false));
  };

  const check = () => {
    if (revealed || !input.trim()) return;
    const typed   = input.trim().toLowerCase();
    const base    = word.de.toLowerCase();
    const withArt = word.gender ? `${word.gender} ${word.de}`.toLowerCase() : null;
    const ok = typed === base || (withArt && typed === withArt);
    setRevealed(true);
    setIsCorrect(ok);
  };

  return (
    <div className="af">
      <SessionHeader t={t} progress={progress} idx={stage.idx} total={stage.words.length} onQuit={onQuit} cefr={stage.id.split('-')[1]} />

      {/* Audio card */}
      <div style={{
        background: t.bgCard, borderRadius: 24, padding: '32px 22px',
        marginBottom: 16, textAlign: 'center', boxShadow: t.shadowLg,
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎧</div>
        <div style={{ color: t.textMid, fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
          Аудио сонсоод герман үгийг бичнэ үү
        </div>

        {/* Replay button */}
        <button onClick={playAudio} disabled={playing}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 50,
            background: playing ? t.bgTag : 'linear-gradient(135deg,#FF6FA8,#A78BFA)',
            border: 'none', cursor: playing ? 'default' : 'pointer',
            color: playing ? t.textMid : '#fff',
            fontWeight: 800, fontSize: 15,
            boxShadow: playing ? 'none' : '0 8px 24px rgba(255,111,168,0.35)',
            transition: 'all 0.2s',
          }}>
          <RefreshCw size={18} style={{ animation: playing ? 'spin 0.9s linear infinite' : 'none' }} />
          {playing ? 'Тоглож байна...' : 'Дахин сонсох'}
        </button>

        {/* CEFR badge */}
        <div style={{ marginTop: 18 }}>
          <span style={{
            background: t.bgTag, color: t.textSoft,
            fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20,
          }}>{word.level}</span>
        </div>
      </div>

      {/* Text input */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
          disabled={revealed}
          placeholder="Герман үгийг бичнэ үү..."
          style={{
            width: '100%', boxSizing: 'border-box',
            background: t.bgCard,
            border: `2px solid ${
              revealed
                ? isCorrect ? t.correct : t.wrong
                : input ? t.pink : t.border
            }`,
            borderRadius: 16, padding: '14px 48px 14px 18px',
            fontSize: 18, fontWeight: 700, color: t.text,
            outline: 'none', boxShadow: t.shadow,
            transition: 'border-color 0.2s',
          }}
        />
        {revealed && (
          <div style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            width: 28, height: 28, borderRadius: 14,
            background: isCorrect ? t.correct : t.wrong,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isCorrect
              ? <Check size={15} color="#fff" strokeWidth={3} />
              : <X     size={15} color="#fff" strokeWidth={3} />
            }
          </div>
        )}
      </div>

      {/* Check button — before reveal */}
      {!revealed && (
        <button onClick={check} disabled={!input.trim()}
          style={{
            width: '100%', padding: '15px', borderRadius: 16,
            border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
            fontWeight: 800, fontSize: 15,
            background: input.trim() ? t.pinkBtn : t.bgTag,
            color: input.trim() ? '#fff' : t.textSoft,
            boxShadow: input.trim() ? t.shadowLg : 'none',
            transition: 'all 0.2s', marginBottom: 14,
          }}>
          Шалгах ✓
        </button>
      )}

      {/* Result card */}
      {revealed && (
        <div style={{
          background: t.bgCard, borderRadius: 20, padding: '16px 18px',
          marginBottom: 14, boxShadow: t.shadow,
        }}>
          {/* Correct / wrong banner */}
          <div style={{
            fontWeight: 800, fontSize: 15, textAlign: 'center',
            color: isCorrect ? '#22C55E' : '#EF4444',
            background: isCorrect
              ? (t.darkMode ? '#14532D44' : '#F0FDF4')
              : (t.darkMode ? '#7F1D1D44' : '#FEF2F2'),
            borderRadius: 12, padding: '8px 16px', marginBottom: 12,
          }}>
            {isCorrect ? '✓ Зөв!' : '✗ Буруу!'}
          </div>

          {/* Word reveal */}
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 30, marginBottom: 4 }}>{word.emoji}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              {word.gender && (
                <span className="fd" style={{ fontSize: 22, fontWeight: 800, color: t.pink }}>{word.gender}</span>
              )}
              <span className="fd" style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{word.de}</span>
            </div>
            <div style={{ color: t.textMid, fontSize: 15, fontWeight: 600, marginTop: 4 }}>{word.mn}</div>
          </div>

          {/* Example sentence */}
          <div style={{
            color: t.textMid, fontSize: 13, fontStyle: 'italic',
            padding: '10px 14px', background: t.bgTag, borderRadius: 14, lineHeight: 1.6,
          }}>
            {word.example}
          </div>
        </div>
      )}

      {/* Continue */}
      {revealed && (
        <button onClick={() => onContinue(isCorrect)} className="su"
          style={{
            width: '100%', padding: '16px', borderRadius: 18,
            fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer',
            background: t.pinkBtn, color: '#fff', boxShadow: t.shadowLg,
          }}>
          Үргэлжлүүлэх →
        </button>
      )}
    </div>
  );
}
