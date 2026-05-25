'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CEFR_META } from '@/lib/vocab';

export default function MatchCard({ t, stage, words, onComplete, onQuit }) {
  const cefr = stage.id.split('-')[1];
  const m    = CEFR_META[cefr] || {};

  const [rightItems]    = useState(() => [...words].sort(() => Math.random() - 0.5));
  const [selLeft,  setSelLeft]  = useState(null);
  const [matchedIds,   setMatchedIds]   = useState(new Set());
  const [shakePair,    setShakePair]    = useState(null);
  const [triedWrong,   setTriedWrong]   = useState(new Set());
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const tapLeft = i => {
    if (matchedIds.has(words[i].id) || shakePair) return;
    setSelLeft(i);
  };

  const tapRight = i => {
    if (matchedIds.has(rightItems[i].id) || shakePair) return;
    if (selLeft === null) return;

    const lWord = words[selLeft];
    const rWord = rightItems[i];

    if (lWord.id === rWord.id) {
      const isFirst    = !triedWrong.has(lWord.id);
      const newMatched = new Set([...matchedIds, lWord.id]);
      setMatchedIds(newMatched);
      setCorrectCount(c => c + (isFirst ? 1 : 0));
      setSelLeft(null);
      if (newMatched.size === words.length) setDone(true);
    } else {
      setShakePair({ l: selLeft, r: i });
      setTriedWrong(s => new Set([...s, lWord.id]));
      setTimeout(() => { setShakePair(null); setSelLeft(null); }, 600);
    }
  };

  const matched  = id => matchedIds.has(id);
  const progress = matchedIds.size / words.length;

  const leftStyle = (i, id) => {
    const isMatched  = matched(id);
    const isSelected = selLeft === i;
    const isShaking  = shakePair?.l === i;
    return {
      padding: '0 10px', borderRadius: 14, minHeight: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', textAlign: 'center',
      border: `2px solid ${isMatched ? t.correct : isSelected ? t.pink : isShaking ? t.wrong : t.border}`,
      background: isMatched ? (t.darkMode ? t.correctBg : '#EDFAF5') : isSelected ? t.pinkBg : t.bgCard,
      color: isMatched ? t.correct : isSelected ? t.pink : isShaking ? t.wrong : t.text,
      fontWeight: 700, fontSize: 13,
      cursor: isMatched ? 'default' : 'pointer',
      opacity: isMatched ? 0.55 : 1,
      boxShadow: t.shadow,
      transition: 'border-color 0.15s, background 0.15s',
    };
  };

  const rightStyle = (i, id) => {
    const isMatched  = matched(id);
    const isShaking  = shakePair?.r === i;
    return {
      padding: '0 10px', borderRadius: 14, minHeight: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center',
      border: `2px solid ${isMatched ? t.correct : isShaking ? t.wrong : t.border}`,
      background: isMatched ? (t.darkMode ? t.correctBg : '#EDFAF5') : t.bgCard,
      color: isMatched ? t.correct : isShaking ? t.wrong : t.text,
      fontWeight: 700, fontSize: 13,
      cursor: isMatched ? 'default' : 'pointer',
      opacity: isMatched ? 0.55 : 1,
      boxShadow: t.shadow,
      transition: 'border-color 0.15s, background 0.15s',
    };
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
            {matchedIds.size}/{words.length}
          </div>
        </div>
        <div style={{ height: 10, background: t.bgTag, borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: t.pinkBtn, borderRadius: 5, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ color: t.textMid, fontSize: 12, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
        Герман үгийг Монгол орчуулгатай нь тааруулаарай
      </div>

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {/* Left column — German */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {words.map((word, i) => (
            <button key={word.id} onClick={() => tapLeft(i)}
              className={shakePair?.l === i ? 'as' : matched(word.id) ? 'ap' : ''}
              disabled={matched(word.id)}
              style={leftStyle(i, word.id)}>
              {word.gender && (
                <span style={{ color: t.pink, fontSize: 11, fontWeight: 800 }}>{word.gender}</span>
              )}
              <span>{word.de}</span>
            </button>
          ))}
        </div>

        {/* Right column — Mongolian (shuffled) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rightItems.map((word, i) => (
            <button key={word.id} onClick={() => tapRight(i)}
              className={shakePair?.r === i ? 'as' : matched(word.id) ? 'ap' : ''}
              disabled={matched(word.id)}
              style={rightStyle(i, word.id)}>
              {word.mn}
            </button>
          ))}
        </div>
      </div>

      {done && (
        <button onClick={() => onComplete(correctCount, words.length)} className="su"
          style={{ width: '100%', marginTop: 20, padding: '16px', borderRadius: 18, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', background: t.pinkBtn, color: '#fff', boxShadow: t.shadowLg }}>
          Үргэлжлүүлэх →
        </button>
      )}
    </div>
  );
}
