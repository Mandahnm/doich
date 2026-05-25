'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { VOCAB, LEVELS, CEFR_META } from '@/lib/vocab';
import MultiChips from '@/components/shared/MultiChips';
import SpeakButton from '@/components/shared/SpeakButton';

const TYPE_LABEL = { noun: 'Нэр үг', verb: 'Үйл үг', adj: 'Тэмдэг нэр', adv: 'Дайвар үг' };
const TYPES      = ['noun', 'verb', 'adj', 'adv'];

function toggle(arr, item) {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

export default function VocabScreen({ t, state, toggleLearned }) {
  const [lF,  setLF]  = useState([]);
  const [tF,  setTF]  = useState([]);
  const [stF, setStF] = useState('all');

  const filtered = VOCAB.filter(w => {
    if (lF.length > 0 && !lF.includes(w.level)) return false;
    if (tF.length > 0 && !tF.includes(w.type))  return false;
    const learned = state.learnedWords.includes(w.id);
    if (stF === 'learned' && !learned) return false;
    if (stF === 'new'     && learned)  return false;
    return true;
  });

  const StatusChips = () => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 6 }}>СТАТУС</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[['all','Бүгд'], ['learned','💖 Сурсан'], ['new','✨ Шинэ']].map(([val, label]) => (
          <button key={val} onClick={() => setStF(val)}
            style={{ padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: stF === val ? t.pinkBtn : t.bgCard, color: stF === val ? '#fff' : t.textMid, boxShadow: t.shadow }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="af">
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 4 }}>ҮГСИЙН САН 📖</div>
        <div className="fd" style={{ fontSize: 30, fontWeight: 800, color: t.text }}>{filtered.length} үг</div>
      </div>

      <MultiChips label="ТҮВШИН" t={t} opts={LEVELS} selected={lF} onToggle={v => setLF(toggle(lF, v))} onClear={() => setLF([])} rLabel={v => v} />
      <MultiChips label="ТӨРӨЛ"  t={t} opts={TYPES}  selected={tF} onToggle={v => setTF(toggle(tF, v))} onClear={() => setTF([])} rLabel={v => TYPE_LABEL[v] || v} />
      <StatusChips />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        {filtered.map((w, i) => {
          const m       = CEFR_META[w.level];
          const learned = state.learnedWords.includes(w.id);
          return (
            <div key={w.id} className="au" style={{ background: t.bgCard, borderRadius: 18, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: t.shadow, animationDelay: `${Math.min(i * 12, 280)}ms` }}>
              <div style={{ fontSize: 22, flexShrink: 0 }}>{w.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                  {w.gender && <span style={{ color: t.pink, fontSize: 13, fontWeight: 800 }}>{w.gender}</span>}
                  <span style={{ fontWeight: 800, color: t.text, fontSize: 15 }}>{w.de}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, background: m.pill, color: m.pillTxt, padding: '2px 8px', borderRadius: 10 }}>{w.level}</span>
                </div>
                <div style={{ color: t.textMid, fontSize: 13, marginTop: 2 }}>{w.mn}</div>
              </div>
              <SpeakButton text={w.de} t={t} size={18} />
              <button onClick={() => toggleLearned(w.id)}
                style={{ width: 40, height: 40, borderRadius: 20, background: learned ? t.pinkBg : t.bgTag, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                className={learned ? 'ap' : ''}>
                <Heart size={18} color={learned ? t.pink : t.textSoft} fill={learned ? t.pink : 'none'} />
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: t.textMid, padding: '48px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🌸</div>
            Энэ шүүлтүүрт үг олдсонгүй
          </div>
        )}
      </div>
    </div>
  );
}
