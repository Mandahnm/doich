'use client';

import { useState, useEffect } from 'react';
import { Check, X, Key } from 'lucide-react';
import { VOCAB } from '@/lib/vocab';
import { speak } from '@/lib/speak';
import SessionHeader from './SessionHeader';
import SpeakButton from './SpeakButton';

const TYPE_LABEL = { noun: 'нэр үг', verb: 'үйл үг', adj: 'тэмдэг нэр', adv: 'дайвар үг' };

export default function FlashCard({ t, stage, word, progress, onContinue, onQuit }) {
  const [opts, setOpts]         = useState([]);
  const [sel, setSel]           = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [clueShown, setClueShown] = useState(false);

  useEffect(() => {
    const wrongs = VOCAB.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3);
    setOpts([word, ...wrongs].sort(() => Math.random() - 0.5));
    setSel(null); setRevealed(false); setIsCorrect(null); setClueShown(false);
    speak(word.de);
  }, [word]);

  const choose = opt => {
    if (revealed) return;
    const ok = opt.id === word.id;
    setSel(opt); setRevealed(true); setIsCorrect(ok);
  };

  return (
    <div className="af">
      <SessionHeader t={t} progress={progress} idx={stage.idx} total={stage.words.length} onQuit={onQuit} cefr={stage.id.split('-')[1]} />

      <div style={{ background: t.bgCard, borderRadius: 24, padding: '28px 22px', marginBottom: 10, textAlign: 'center', boxShadow: t.shadowLg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div className="fd" style={{ fontSize: word.de.length > 12 ? 28 : 42, fontWeight: 800, color: t.text, lineHeight: 1.1 }}>
            {word.gender && <span style={{ color: t.pink }}>{word.gender} </span>}
            {word.de}
          </div>
          <SpeakButton text={word.de} t={t} size={22} />
        </div>
        {(clueShown || revealed) && (
          <div className="af" style={{ marginTop: 14 }}>
            <div style={{ display: 'inline-block', background: t.bgTag, color: t.textMid, fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20, marginBottom: 10 }}>
              {TYPE_LABEL[word.type]} · {word.level}
            </div>
            <div style={{ color: t.textMid, fontSize: 13, padding: '10px 14px', background: t.bgTag, borderRadius: 14, lineHeight: 1.6, fontStyle: 'italic' }}>
              {word.example}
            </div>
          </div>
        )}
      </div>

      {!revealed && (
        <button onClick={() => setClueShown(s => !s)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto 10px',
            padding: '8px 20px', borderRadius: 20,
            background: clueShown ? t.pinkBg : t.bgCard,
            border: `1.5px solid ${clueShown ? t.pink : t.border}`,
            color: clueShown ? t.pink : t.textMid,
            fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: t.shadow,
          }}>
          <Key size={14} /> {clueShown ? 'Сэжүүр нуух' : 'Сэжүүр'}
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {opts.map(opt => {
          const isOk    = opt.id === word.id;
          const isWrong = revealed && sel?.id === opt.id && !isOk;
          const showOk  = revealed && isOk;
          return (
            <button key={opt.id} onClick={() => choose(opt)} disabled={revealed}
              className={showOk ? 'ap' : isWrong ? 'as' : ''}
              style={{
                padding: '15px 18px', borderRadius: 16,
                border: `2px solid ${showOk ? t.correct : isWrong ? t.wrong : t.border}`,
                background: showOk
                  ? (t.darkMode ? t.correctBg : '#EDFAF5')
                  : isWrong
                  ? (t.darkMode ? t.wrongBg : '#FFEEEE')
                  : t.bgCard,
                cursor: revealed ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: t.shadow,
              }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: showOk ? t.correct : isWrong ? t.wrong : t.text }}>
                {opt.mn}
              </span>
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
