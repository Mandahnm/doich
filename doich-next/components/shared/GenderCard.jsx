'use client';

import { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import { speak } from '@/lib/speak';
import SessionHeader from './SessionHeader';
import SpeakButton from './SpeakButton';

export default function GenderCard({ t, stage, word, progress, onContinue, onQuit }) {
  const [sel, setSel]             = useState(null);
  const [revealed, setRevealed]   = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [clueShown, setClueShown] = useState(false);

  useEffect(() => {
    setSel(null); setRevealed(false); setIsCorrect(null); setClueShown(false);
    speak(word.de);
  }, [word]);

  const choose = g => {
    if (revealed) return;
    const ok = g === word.gender;
    setSel(g); setRevealed(true); setIsCorrect(ok);
  };

  const arts = [
    { v: 'der', color: t.sky,  bg: t.skyBg  },
    { v: 'die', color: t.rose, bg: t.roseBg },
    { v: 'das', color: t.mint, bg: t.mintBg },
  ];

  return (
    <div className="af">
      <SessionHeader t={t} progress={progress} idx={stage.idx} total={stage.words.length} onQuit={onQuit} cefr={stage.id.split('-')[1]} />

      <div style={{ background: t.bgCard, borderRadius: 24, padding: '32px 22px', marginBottom: 10, textAlign: 'center', boxShadow: t.shadowLg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <div className="fd" style={{ fontSize: word.de.length > 12 ? 28 : 48, fontWeight: 800, color: t.text, lineHeight: 1 }}>
            {word.de}
          </div>
          <SpeakButton text={word.de} t={t} size={22} />
        </div>
        <div style={{ color: t.textMid, fontSize: 14, fontWeight: 600 }}>{word.mn}</div>
        {(clueShown || revealed) && (
          <div className="af" style={{ marginTop: 12 }}>
            <div style={{ color: t.textMid, fontSize: 13, padding: '10px 14px', background: t.bgTag, borderRadius: 14, lineHeight: 1.6, fontStyle: 'italic' }}>
              {word.example}
            </div>
          </div>
        )}
        {revealed && (
          <div className="af" style={{ marginTop: 10, fontWeight: 800, fontSize: 14, color: t.correct }}>
            Зөв хариулт: <span style={{ fontSize: 18 }}>{word.gender} {word.de}</span>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        {arts.map(a => {
          const isOk    = a.v === word.gender;
          const isWrong = revealed && sel === a.v && !isOk;
          const showOk  = revealed && isOk;
          return (
            <button key={a.v} onClick={() => choose(a.v)} disabled={revealed}
              className={showOk ? 'ap' : isWrong ? 'as' : ''}
              style={{
                padding: '22px 0', borderRadius: 20,
                border: `2px solid ${showOk ? a.color : isWrong ? t.wrong : 'transparent'}`,
                background: showOk
                  ? a.bg
                  : isWrong
                  ? (t.darkMode ? t.wrongBg : '#FFEEEE')
                  : a.bg,
                cursor: revealed ? 'default' : 'pointer',
                boxShadow: t.shadow,
              }}>
              <div className="fd" style={{ fontSize: 24, fontWeight: 800, color: showOk ? a.color : isWrong ? t.wrong : a.color }}>
                {a.v}
              </div>
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
