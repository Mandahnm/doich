'use client';

import { useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { VOCAB, LEVELS, CEFR_META } from '@/lib/vocab';
import MultiChips from '@/components/shared/MultiChips';
import PlayButton from '@/components/shared/PlayButton';

const TYPE_LABEL = { noun: 'Нэр үг', verb: 'Үйл үг', adj: 'Тэмдэг нэр', adv: 'Дайвар үг' };
const TYPES      = ['noun', 'verb', 'adj', 'adv'];

// Colored article badges matching the design system
const ARTICLE_STYLE = {
  der: { bg: '#dceeff', text: '#0062a1', emojiBg: '#dceeff' },
  die: { bg: '#ffdad4', text: '#bc0000', emojiBg: '#ffdad4' },
  das: { bg: '#fff8d4', text: '#745b00', emojiBg: '#fff8d4' },
};
const TYPE_EMOJI_BG = {
  verb: '#ede9fe',
  adj:  '#d6f5e5',
  adv:  '#f0eded',
};

function toggle(arr, item) {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

export default function VocabScreen({ t, state, toggleLearned }) {
  const [lF,    setLF]    = useState([]);
  const [tF,    setTF]    = useState([]);
  const [stF,   setStF]   = useState('all');
  const [query, setQuery] = useState('');

  const filtered = VOCAB.filter(w => {
    if (lF.length > 0 && !lF.includes(w.level)) return false;
    if (tF.length > 0 && !tF.includes(w.type))  return false;
    const learned = state.learnedWords.includes(w.id);
    if (stF === 'learned' && !learned) return false;
    if (stF === 'new'     && learned)  return false;
    if (query) {
      const q = query.toLowerCase();
      if (!w.de.toLowerCase().includes(q) && !w.mn.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="af">
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em' }}>ҮГСИЙН САН 📖</div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={16} color={t.textSoft} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Үг хайх... (герман эсвэл монгол)"
          style={{ width: '100%', boxSizing: 'border-box', background: t.bgCard, border: `1.5px solid ${query ? t.pink : t.border}`, borderRadius: 14, padding: '11px 40px 11px 38px', fontSize: 14, color: t.text, outline: 'none' }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
            <X size={16} color={t.textSoft} />
          </button>
        )}
      </div>

      <MultiChips label="ТҮВШИН" t={t} opts={LEVELS} selected={lF} onToggle={v => setLF(toggle(lF, v))} onClear={() => setLF([])} rLabel={v => v} />
      <MultiChips label="ТӨРӨЛ"  t={t} opts={TYPES}  selected={tF} onToggle={v => setTF(toggle(tF, v))} onClear={() => setTF([])} rLabel={v => TYPE_LABEL[v] || v} />

      {/* Status filter */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all','Бүгд'], ['learned','✓ Сурсан'], ['new','✨ Шинэ']].map(([val, label]) => (
            <button key={val} onClick={() => setStF(val)}
              style={{ padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12, border: `1.5px solid ${stF === val ? t.pink : t.border}`, cursor: 'pointer', whiteSpace: 'nowrap', background: stF === val ? t.pinkBg : t.bgCard, color: stF === val ? t.pink : t.textMid }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Word list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        {filtered.map((w, i) => {
          const m        = CEFR_META[w.level];
          const learned  = state.learnedWords.includes(w.id);
          const artStyle = w.gender ? ARTICLE_STYLE[w.gender] : null;
          const emojiBg  = artStyle ? artStyle.emojiBg : (TYPE_EMOJI_BG[w.type] || t.bgTag);

          return (
            <div key={w.id} className="au"
              style={{ background: t.bgCard, borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${t.border}`, animationDelay: `${Math.min(i * 12, 280)}ms` }}>

              {/* Colored emoji square */}
              <div style={{ width: 48, height: 48, borderRadius: 12, background: emojiBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                {w.emoji}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                  {/* Article or type badge */}
                  {artStyle ? (
                    <span style={{ background: artStyle.bg, color: artStyle.text, fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 6, letterSpacing: '0.04em' }}>
                      {w.gender.toUpperCase()}
                    </span>
                  ) : (
                    <span style={{ background: t.bgTag, color: t.textSoft, fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6 }}>
                      {(TYPE_LABEL[w.type] || w.type).toUpperCase().slice(0, 4)}
                    </span>
                  )}
                  <span className="fd" style={{ fontWeight: 800, color: t.text, fontSize: 15 }}>{w.de}</span>
                  <PlayButton wordId={w.id} size={14} color={t.textSoft} />
                </div>
                <div style={{ color: t.textMid, fontSize: 13 }}>{w.mn}</div>
              </div>

              {/* Learned checkmark */}
              <button onClick={() => toggleLearned(w.id)}
                style={{ width: 36, height: 36, borderRadius: 18, background: learned ? t.pinkBg : t.bgTag, border: `1.5px solid ${learned ? t.pink : t.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                className={learned ? 'ap' : ''}>
                <Check size={16} color={learned ? t.pink : t.textSoft} strokeWidth={learned ? 2.5 : 2} />
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
