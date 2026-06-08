'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { VOCAB } from '@/lib/vocab';
import SessionHeader from './SessionHeader';

const TYPES = ['noun', 'verb', 'adj', 'adv'];

function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
const DE_ALPHA = '[A-Za-zäöüÄÖÜß]*';

// Returns { blanked, form } where:
//   blanked = sentence with the matched word replaced by '_____'
//   form    = the exact surface form found in the sentence (e.g. "esse" for "essen")
// Falls back to { blanked: sentence, form: de } for highly irregular verbs (sein→bin).
function blankWord(sentence, de) {
  const esc = escRe(de);

  // 1. Exact match
  const exact = sentence.match(new RegExp(esc, 'i'));
  if (exact) return { blanked: sentence.replace(exact[0], '_____'), form: exact[0] };

  // 2. Stem trimming — conjugations (gehen→gehe) and inflections (groß→große)
  for (let trim = 1; trim <= Math.min(4, de.length - 3); trim++) {
    const stem  = esc.slice(0, -trim);
    const match = sentence.match(new RegExp(stem + DE_ALPHA, 'i'));
    if (match) return { blanked: sentence.replace(match[0], '_____'), form: match[0] };
  }

  return { blanked: sentence, form: de };
}

function getOptions(word) {
  const otherTypes = TYPES.filter(t => t !== word.type);
  const distractors = otherTypes.map(type => {
    const sameLevel = VOCAB.filter(w => w.type === type && w.level === word.level && w.id !== word.id);
    const anyLevel  = VOCAB.filter(w => w.type === type && w.id !== word.id);
    const pool = sameLevel.length > 0 ? sameLevel : anyLevel;
    return pool[Math.floor(Math.random() * pool.length)];
  }).filter(Boolean);
  return [word, ...distractors].sort(() => Math.random() - 0.5);
}

export default function FillBlankCard({ t, stage, word, progress, onContinue, onQuit }) {
  const [opts,      setOpts]      = useState([]);
  const [sel,       setSel]       = useState(null);
  const [revealed,  setRevealed]  = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    setOpts(getOptions(word));
    setSel(null); setRevealed(false); setIsCorrect(null);
  }, [word]);

  const { blanked, form } = blankWord(word.example, word.de);
  const hasBlank = blanked !== word.example;
  const parts    = hasBlank ? blanked.split('_____') : null;

  const choose = opt => {
    if (revealed) return;
    const ok = opt.id === word.id;
    setSel(opt); setRevealed(true); setIsCorrect(ok);
  };

  return (
    <div className="af">
      <SessionHeader t={t} progress={progress} idx={stage.idx} total={stage.words.length} onQuit={onQuit} cefr={stage.id.split('-')[1]} />

      {/* Sentence card */}
      <div style={{ background: t.bgCard, borderRadius: 24, padding: '24px 20px', marginBottom: 14, boxShadow: t.shadowLg }}>
        <div style={{ fontSize: 22, textAlign: 'center', marginBottom: 10 }}>{word.emoji}</div>

        {hasBlank ? (
          <>
            <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textAlign: 'center', marginBottom: 10 }}>
              ЦООРХОЙГ ГҮЙЦЭЭГЭЭРЭЙ
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: t.text, lineHeight: 1.8, textAlign: 'center' }}>
              {parts.map((part, i) => (
                <span key={i}>
                  {part}
                  {i < parts.length - 1 && (
                    <span style={{
                      display: 'inline-block', minWidth: 88,
                      borderBottom: `2.5px solid ${revealed ? (isCorrect ? t.correct : t.wrong) : t.pink}`,
                      margin: '0 4px', textAlign: 'center',
                      fontWeight: 800, fontSize: 16,
                      color: revealed ? (isCorrect ? t.correct : t.wrong) : 'transparent',
                    }}>
                      {revealed ? form : ''}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textAlign: 'center', marginBottom: 10 }}>
              АЛЬ ҮГ ТОХИРОХ ВЭ?
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text, textAlign: 'center', lineHeight: 1.6 }}>
              {word.mn}
            </div>
          </>
        )}

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <span style={{ background: t.bgTag, color: t.textSoft, fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20 }}>
            {word.level}
          </span>
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {opts.map(opt => {
          const isOk    = opt.id === word.id;
          const isWrong = revealed && sel?.id === opt.id && !isOk;
          const showOk  = revealed && isOk;
          return (
            <button key={opt.id} onClick={() => choose(opt)} disabled={revealed}
              className={showOk ? 'ap' : isWrong ? 'as' : ''}
              style={{
                padding: '14px 18px', borderRadius: 16,
                border: `2px solid ${showOk ? t.correct : isWrong ? t.wrong : t.border}`,
                background: showOk ? (t.darkMode ? t.correctBg : '#EDFAF5') : isWrong ? (t.darkMode ? t.wrongBg : '#FFEEEE') : t.bgCard,
                cursor: revealed ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: t.shadow,
              }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: showOk ? t.correct : isWrong ? t.wrong : t.text }}>
                {opt.de}
              </div>
              {showOk  && <div style={{ width: 26, height: 26, borderRadius: 13, background: t.correct, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} color="#fff" strokeWidth={3} /></div>}
              {isWrong && <div style={{ width: 26, height: 26, borderRadius: 13, background: t.wrong,   display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X     size={14} color="#fff" strokeWidth={3} /></div>}
            </button>
          );
        })}
      </div>

      {revealed && (
        <button onClick={() => onContinue(isCorrect)} className="su"
          style={{ width: '100%', padding: '16px', borderRadius: 18, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', background: t.pinkBtn, color: '#fff', boxShadow: t.shadowLg }}>
          Үргэлжлүүлэх →
        </button>
      )}
    </div>
  );
}
