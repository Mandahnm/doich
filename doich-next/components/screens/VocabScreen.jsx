'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { WithSkeleton, VocabSkeleton } from '@/components/shared/ScreenSkeleton';
import { Check, Search, X } from 'lucide-react';
import { VOCAB, LEVELS, CEFR_META } from '@/lib/vocab';
import MultiChips from '@/components/shared/MultiChips';
import PlayButton from '@/components/shared/PlayButton';

const TYPE_LABEL = { noun: 'Нэр үг', verb: 'Үйл үг', adj: 'Тэмдэг нэр', adv: 'Дайвар үг' };
const TYPES      = ['noun', 'verb', 'adj', 'adv'];

const ARTICLE_STYLE = {
  der: { bg: '#dceeff', text: '#0062a1', emojiBg: '#dceeff' },
  die: { bg: '#ffdad4', text: '#bc0000', emojiBg: '#ffdad4' },
  das: { bg: '#d6f5e5', text: '#006d3a', emojiBg: '#d6f5e5' },
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
  return <WithSkeleton ms={250} skeleton={<VocabSkeleton t={t} />}><VocabScreenInner t={t} state={state} toggleLearned={toggleLearned} /></WithSkeleton>;
}

function VocabScreenInner({ t, state, toggleLearned }) {
  const [lF,          setLF]          = useState([]);
  const [tF,          setTF]          = useState([]);
  const [stF,         setStF]         = useState('all');
  const [query,       setQuery]       = useState('');
  const [isDesktop,   setIsDesktop]   = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const filtered = useMemo(() => VOCAB.filter(w => {
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
  }), [lF, tF, stF, query, state.learnedWords]);

  // Reset visible count whenever filters change
  useEffect(() => { setVisibleCount(50); }, [filtered]);

  // Load more when sentinel scrolls into view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount(n => Math.min(n + 50, filtered.length));
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [filtered]);

  const visible = filtered.slice(0, visibleCount);

  // ── Shared word card ──────────────────────────────────────────────────────
  const WordCard = ({ w, i }) => {
    const learned  = state.learnedWords.includes(w.id);
    const artStyle = w.gender ? ARTICLE_STYLE[w.gender] : null;
    const emojiBg  = artStyle ? artStyle.emojiBg : (TYPE_EMOJI_BG[w.type] || t.bgTag);

    return (
      <div key={w.id} className="au"
        style={{
          background: t.bgCard, borderRadius: 14,
          padding: '11px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          border: `1px solid ${t.border}`,
          animationDelay: `${Math.min(i * 12, 280)}ms`,
        }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: emojiBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {w.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 2 }}>
            {artStyle && (
              <span style={{ background: artStyle.bg, color: artStyle.text, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 5, letterSpacing: '0.04em' }}>
                {w.gender.toUpperCase()}
              </span>
            )}
            <span className="fd" style={{ fontWeight: 800, color: t.text, fontSize: 14 }}>{w.de}</span>
            <PlayButton wordId={w.id} size={13} color={t.textSoft} />
            <span style={{ fontSize: 11, color: t.textSoft, fontWeight: 500 }}>{TYPE_LABEL[w.type] || w.type}</span>
          </div>
          <div style={{ color: t.textMid, fontSize: 12 }}>{w.mn}</div>
        </div>
        <button onClick={() => toggleLearned(w.id)} className={learned ? 'ap' : ''}
          style={{ width: 32, height: 32, borderRadius: 16, background: learned ? t.pinkBg : t.bgTag, border: `1.5px solid ${learned ? t.pink : t.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Check size={14} color={learned ? t.pink : t.textSoft} strokeWidth={learned ? 2.5 : 2} />
        </button>
      </div>
    );
  };

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div>
        {/* Header row: title + search */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 20 }}>
          <div>
            <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 4 }}>ҮГСИЙН САН 📖</div>
            <div style={{ color: t.textSoft, fontSize: 13 }}>
              {filtered.length} үг · {state.learnedWords.length} сурсан
            </div>
          </div>
          <div style={{ position: 'relative', width: 340, flexShrink: 0 }}>
            <Search size={15} color={t.textSoft} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Үг хайх... (герман эсвэл монгол)"
              style={{ width: '100%', boxSizing: 'border-box', background: t.bgCard, border: `1.5px solid ${query ? t.pink : t.border}`, borderRadius: 12, padding: '10px 36px 10px 36px', fontSize: 14, color: t.text, outline: 'none' }} />
            {query && (
              <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <X size={15} color={t.textSoft} />
              </button>
            )}
          </div>
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>ТҮВШИН</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ v: null, label: 'Бүгд' }, ...LEVELS.map(v => ({ v, label: v }))].map(({ v, label }) => {
                const active = v === null ? lF.length === 0 : lF.includes(v);
                return (
                  <button key={label} onClick={() => v === null ? setLF([]) : setLF(toggle(lF, v))}
                    style={{ padding: '5px 12px', borderRadius: 20, fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', border: `1.5px solid ${active ? t.pink : t.border}`, background: active ? t.pinkBtn : t.bgCard, color: active ? t.pinkBtnText : t.textMid }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>ТӨРӨЛ</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ v: null, label: 'Бүгд' }, ...TYPES.map(v => ({ v, label: TYPE_LABEL[v] }))].map(({ v, label }) => {
                const active = v === null ? tF.length === 0 : tF.includes(v);
                return (
                  <button key={label} onClick={() => v === null ? setTF([]) : setTF(toggle(tF, v))}
                    style={{ padding: '5px 12px', borderRadius: 20, fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', border: `1.5px solid ${active ? t.pink : t.border}`, background: active ? t.pinkBtn : t.bgCard, color: active ? t.pinkBtnText : t.textMid }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            {[['all','Бүгд'], ['learned','✓ Сурсан'], ['new','✨ Шинэ']].map(([val, label]) => (
              <button key={val} onClick={() => setStF(val)}
                style={{ padding: '5px 12px', borderRadius: 20, fontWeight: 700, fontSize: 12, border: `1.5px solid ${stF === val ? t.pink : t.border}`, cursor: 'pointer', whiteSpace: 'nowrap', background: stF === val ? t.pinkBg : t.bgCard, color: stF === val ? t.pink : t.textMid }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-column word grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {visible.map((w, i) => <WordCard key={w.id} w={w} i={i} />)}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: t.textMid, padding: '48px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🌸</div>
              Энэ шүүлтүүрт үг олдсонгүй
            </div>
          )}
        </div>
        {visibleCount < filtered.length && <div ref={sentinelRef} style={{ height: 40 }} />}
      </div>
    );
  }

  // ── MOBILE ────────────────────────────────────────────────────────────────
  return (
    <div className="af">
      <div style={{ marginBottom: 14 }}>
        <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em' }}>ҮГСИЙН САН 📖</div>
      </div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={16} color={t.textSoft} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Үг хайх... (герман эсвэл монгол)"
          style={{ width: '100%', boxSizing: 'border-box', background: t.bgCard, border: `1.5px solid ${query ? t.pink : t.border}`, borderRadius: 14, padding: '11px 40px 11px 38px', fontSize: 14, color: t.text, outline: 'none' }} />
        {query && (
          <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
            <X size={16} color={t.textSoft} />
          </button>
        )}
      </div>

      <MultiChips label="ТҮВШИН" t={t} opts={LEVELS} selected={lF} onToggle={v => setLF(toggle(lF, v))} onClear={() => setLF([])} rLabel={v => v} />
      <MultiChips label="ТӨРӨЛ"  t={t} opts={TYPES}  selected={tF} onToggle={v => setTF(toggle(tF, v))} onClear={() => setTF([])} rLabel={v => TYPE_LABEL[v] || v} />

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        {visible.map((w, i) => <WordCard key={w.id} w={w} i={i} />)}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: t.textMid, padding: '48px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🌸</div>
            Энэ шүүлтүүрт үг олдсонгүй
          </div>
        )}
      </div>
      {visibleCount < filtered.length && <div ref={sentinelRef} style={{ height: 40 }} />}
    </div>
  );
}
