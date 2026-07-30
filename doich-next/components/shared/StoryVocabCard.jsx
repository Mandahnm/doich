'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import PlayButton from './PlayButton';

/**
 * de → mn multiple-choice card for a story's new_words.
 * Story words are plain { de, mn } with no VOCAB id, so options are compared by
 * their Mongolian string — VocabQuiz dedupes them before passing them in.
 * Same instant-reveal interaction as FlashCard.
 */
export default function StoryVocabCard({ t, word, options, idx, total, vocabHit, onContinue }) {
  const [sel,       setSel]       = useState(null);
  const [revealed,  setRevealed]  = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => { setSel(null); setRevealed(false); setIsCorrect(null); }, [word]);

  const choose = opt => {
    if (revealed) return;
    const ok = opt === word.mn;
    setSel(opt); setRevealed(true); setIsCorrect(ok);
  };

  const progress = (idx / total) * 100;

  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em' }}>ҮГИЙН ТЕСТ 🗂</div>
        <div style={{ fontSize: 12, color: t.textSoft, fontWeight: 700 }}>{idx + 1} / {total}</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: t.bgTag, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: t.pinkBtn, borderRadius: 3, transition: 'width 0.3s ease' }} />
      </div>

      {/* Prompt */}
      <div style={{ background: t.bgCard, borderRadius: 24, padding: '28px 22px', textAlign: 'center', boxShadow: t.shadowLg }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: t.textSoft, letterSpacing: '0.18em', marginBottom: 10 }}>ЭНЭ ҮГ ЮУ ГЭСЭН ҮГ ВЭ?</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div className="fd" style={{ fontSize: word.de.length > 14 ? 24 : 34, fontWeight: 800, color: t.text, lineHeight: 1.15 }}>
            {word.de}
          </div>
          {vocabHit && <PlayButton wordId={vocabHit.id} size={22} color={t.textMid} />}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map(opt => {
          const isOk    = opt === word.mn;
          const isWrong = revealed && sel === opt && !isOk;
          const showOk  = revealed && isOk;
          return (
            <button key={opt} onClick={() => choose(opt)} disabled={revealed}
              className={showOk ? 'ap' : isWrong ? 'as' : ''}
              style={{
                padding: '15px 18px', borderRadius: 16, textAlign: 'left',
                border: `2px solid ${showOk ? t.correct : isWrong ? t.wrong : t.border}`,
                background: showOk ? '#EDFAF5' : isWrong ? '#FFEEEE' : t.bgCard,
                cursor: revealed ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                boxShadow: t.shadow,
              }}>
              <span style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35, color: showOk ? t.correct : isWrong ? t.wrong : t.text }}>
                {opt}
              </span>
              {showOk  && <div style={{ width: 26, height: 26, borderRadius: 13, background: t.correct, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={14} color="#fff" strokeWidth={3} /></div>}
              {isWrong && <div style={{ width: 26, height: 26, borderRadius: 13, background: t.wrong,   display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X     size={14} color="#fff" strokeWidth={3} /></div>}
            </button>
          );
        })}
      </div>

      {revealed && (
        <button onClick={() => onContinue(isCorrect)} className="su"
          style={{ width: '100%', padding: '16px', borderRadius: 18, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', background: t.pinkBtn, color: t.pinkBtnText, boxShadow: t.shadowLg }}>
          {idx + 1 === total ? 'Дүн харах →' : 'Үргэлжлүүлэх →'}
        </button>
      )}
    </div>
  );
}
