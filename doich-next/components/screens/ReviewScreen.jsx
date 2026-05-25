'use client';

import { useState, useEffect } from 'react';
import { Settings, X, RefreshCw, Star } from 'lucide-react';
import { VOCAB, CEFR_META } from '@/lib/vocab';
import FlashCard from '@/components/shared/FlashCard';

const TYPE_LABELS = { noun: 'Нэр үг', verb: 'Үйл үг', adj: 'Тэмдэг нэр', adv: 'Дайвар үг' };

export default function ReviewScreen({ t, state, setTab, recordStat, recordMistake, clearMistake }) {
  const learnedPool = VOCAB.filter(w => state.learnedWords.includes(w.id));

  const [levelFilters, setLevelFilters] = useState([]);
  const [typeFilters,  setTypeFilters]  = useState([]);
  const [showFilter,   setShowFilter]   = useState(false);
  const [session,      setSession]      = useState(null);
  const [view,         setView]         = useState('session');
  const [tmpLevels,    setTmpLevels]    = useState([]);
  const [tmpTypes,     setTmpTypes]     = useState([]);

  useEffect(() => {
    if (learnedPool.length > 0) {
      setSession({ words: [...learnedPool].sort(() => Math.random() - 0.5), idx: 0, score: 0 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initSession = pool => {
    if (!pool || pool.length === 0) return;
    setSession({ words: [...pool].sort(() => Math.random() - 0.5), idx: 0, score: 0 });
    setView('session');
  };

  const filteredPool = learnedPool.filter(w => {
    if (levelFilters.length > 0 && !levelFilters.includes(w.level)) return false;
    if (typeFilters.length  > 0 && !typeFilters.includes(w.type))  return false;
    return true;
  });
  const toggle = (arr, item) => arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const handleContinue = isCorrect => {
    recordStat('flashcards', isCorrect);
    const cur = session?.words[session?.idx];
    if (cur) { if (isCorrect) clearMistake(cur.id); else recordMistake(cur.id, 'review'); }
    const newScore = session.score + (isCorrect ? 1 : 0);
    const newIdx   = session.idx + 1;
    if (newIdx >= session.words.length) {
      setSession(s => ({ ...s, score: newScore, idx: newIdx })); setView('result');
    } else {
      setSession(s => ({ ...s, score: newScore, idx: newIdx }));
    }
  };

  const applyFilter = (lvArr, tpArr) => {
    setLevelFilters(lvArr); setTypeFilters(tpArr); setShowFilter(false);
    const pool = learnedPool.filter(w => {
      if (lvArr.length > 0 && !lvArr.includes(w.level)) return false;
      if (tpArr.length > 0 && !tpArr.includes(w.type))  return false;
      return true;
    });
    initSession(pool.length > 0 ? pool : learnedPool);
  };

  const availLevels = [...new Set(learnedPool.map(w => w.level))].sort();
  const availTypes  = [...new Set(learnedPool.map(w => w.type))];
  const isFiltered  = levelFilters.length > 0 || typeFilters.length > 0;

  if (learnedPool.length === 0) {
    return (
      <div className="af" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>💖</div>
        <div className="fd" style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 8 }}>Сурсан үг алга байна</div>
        <div style={{ color: t.textMid, fontSize: 14, lineHeight: 1.6, marginBottom: 24, padding: '0 32px' }}>
          Эхлээд "Үгсийн сан" хэсгээс үгсийг 💖 Сурсан гэж тэмдэглэнэ үү
        </div>
        <button onClick={() => setTab('vocab')}
          style={{ padding: '14px 32px', borderRadius: 18, background: t.pinkBtn, color: '#fff', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: t.shadowLg }}>
          Үгсийн сан руу очих →
        </button>
      </div>
    );
  }

  if (view === 'result' && session) {
    const total = session.words.length;
    const pct   = session.score / total;
    const stars = pct >= 0.87 ? 3 : pct >= 0.6 ? 2 : 1;
    return (
      <div className="af" style={{ textAlign: 'center', paddingTop: 24 }}>
        <div style={{ fontSize: 72, marginBottom: 8 }} className="ap">{stars === 3 ? '🏆' : stars === 2 ? '🎉' : '✨'}</div>
        <div className="fd" style={{ fontSize: 24, fontWeight: 800, color: t.text, marginBottom: 6 }}>Давталт дууслаа!</div>
        <div style={{ color: t.textMid, fontSize: 13, marginBottom: 20 }}>{total} үг давтлаа</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 22 }}>
          {[1, 2, 3].map(s => <Star key={s} size={36} color={s <= stars ? '#FFAA00' : t.border} fill={s <= stars ? '#FFAA00' : t.border} />)}
        </div>
        <div style={{ background: t.bgCard, borderRadius: 24, padding: '22px', boxShadow: t.shadowLg, marginBottom: 18 }}>
          <div className="fd" style={{ fontSize: 48, fontWeight: 800, color: t.text }}>{session.score}<span style={{ fontSize: 22, color: t.textMid }}>/{total}</span></div>
          <div style={{ color: t.textMid, fontSize: 13, marginTop: 4 }}>зөв хариулт</div>
          <div style={{ marginTop: 14, height: 10, background: t.bgTag, borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct * 100}%`, background: t.pinkBtn, borderRadius: 5 }} />
          </div>
          <div style={{ color: t.textMid, fontSize: 13, marginTop: 10, lineHeight: 1.5 }}>
            {stars === 3 && 'Гайхалтай! Сурсан үгсээ маш сайн санаж байна 🔥'}
            {stars === 2 && 'Сайн байна! Цаашид давтан хийгээрэй 💪'}
            {stars === 1 && 'Зарим үгсээ дахин харах хэрэгтэй 📖'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setTab('home')} style={{ flex: 1, padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 13, border: `2px solid ${t.border}`, background: 'transparent', color: t.textMid, cursor: 'pointer' }}>← Буцах</button>
          <button onClick={() => initSession(filteredPool.length > 0 ? filteredPool : learnedPool)}
            style={{ flex: 2, padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 14, border: 'none', background: t.pinkBtn, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: t.shadowLg }}>
            <RefreshCw size={16} /> Дахин давтах
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;
  const word  = session.words[session.idx];
  const stage = { id: 'review-x', words: session.words, idx: session.idx };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ color: t.pink, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={12} /> СУРСАН ҮГС ДАВТАХ
        </div>
        <button onClick={() => { setTmpLevels([...levelFilters]); setTmpTypes([...typeFilters]); setShowFilter(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, background: isFiltered ? t.pinkBg : t.bgCard, border: `1.5px solid ${isFiltered ? t.pink : t.border}`, color: isFiltered ? t.pink : t.textMid, fontWeight: 700, fontSize: 12, cursor: 'pointer', boxShadow: t.shadow, position: 'relative' }}>
          <Settings size={13} /> Шүүлтүүр
          {isFiltered && <div style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: 4, background: t.pink, border: `2px solid ${t.bgMain}` }} />}
        </button>
      </div>

      {isFiltered && (
        <div className="af" style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          {levelFilters.map(lv => { const m = CEFR_META[lv] || {}; return (
            <div key={lv} style={{ display: 'flex', alignItems: 'center', gap: 4, background: m.pill || t.pinkBg, color: m.pillTxt || t.pink, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
              {lv}
              <button onClick={() => applyFilter(levelFilters.filter(x => x !== lv), typeFilters)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', fontSize: 14, lineHeight: 1, marginLeft: 2 }}>×</button>
            </div>
          ); })}
          {typeFilters.map(tp => (
            <div key={tp} style={{ display: 'flex', alignItems: 'center', gap: 4, background: t.pinkBg, color: t.pink, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
              {TYPE_LABELS[tp] || tp}
              <button onClick={() => applyFilter(levelFilters, typeFilters.filter(x => x !== tp))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', fontSize: 14, lineHeight: 1, marginLeft: 2 }}>×</button>
            </div>
          ))}
        </div>
      )}

      <FlashCard t={t} stage={stage} word={word} progress={session.idx / session.words.length} onContinue={handleContinue} onQuit={() => setTab('home')} />

      {showFilter && (
        <div className="af" style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={() => setShowFilter(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div className="su" style={{ position: 'relative', background: t.bgCard, borderRadius: '24px 24px 0 0', padding: '24px 20px 44px', boxShadow: '0 -8px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: t.border, margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="fd" style={{ fontSize: 18, fontWeight: 800, color: t.text }}>Шүүлтүүр</div>
              <button onClick={() => setShowFilter(false)} style={{ width: 32, height: 32, borderRadius: 16, background: t.bgTag, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color={t.textMid} />
              </button>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 10 }}>ТҮВШИН</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => setTmpLevels([])} style={{ padding: '8px 16px', borderRadius: 20, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', background: tmpLevels.length === 0 ? t.pinkBtn : t.bgTag, color: tmpLevels.length === 0 ? '#fff' : t.textMid }}>Бүгд</button>
                {availLevels.map(lv => { const m = CEFR_META[lv] || {}; const active = tmpLevels.includes(lv); return (
                  <button key={lv} onClick={() => setTmpLevels(toggle(tmpLevels, lv))} style={{ padding: '8px 16px', borderRadius: 20, fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', background: active ? (m.pill || t.pinkBtn) : t.bgTag, color: active ? (m.pillTxt || '#fff') : t.textMid }}>{lv}</button>
                ); })}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 10 }}>ҮГИЙН ТӨРӨЛ</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => setTmpTypes([])} style={{ padding: '8px 16px', borderRadius: 20, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', background: tmpTypes.length === 0 ? t.pinkBtn : t.bgTag, color: tmpTypes.length === 0 ? '#fff' : t.textMid }}>Бүгд</button>
                {availTypes.map(tp => { const active = tmpTypes.includes(tp); return (
                  <button key={tp} onClick={() => setTmpTypes(toggle(tmpTypes, tp))} style={{ padding: '8px 16px', borderRadius: 20, fontWeight: 700, fontSize: 13, border: `2px solid ${active ? t.pink : 'transparent'}`, cursor: 'pointer', background: active ? t.pinkBtn : t.bgTag, color: active ? '#fff' : t.textMid }}>{TYPE_LABELS[tp] || tp}</button>
                ); })}
              </div>
            </div>
            <button onClick={() => applyFilter(tmpLevels, tmpTypes)}
              style={{ width: '100%', padding: '15px', borderRadius: 16, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', background: t.pinkBtn, color: '#fff', boxShadow: t.shadowLg }}>
              Хэрэглэх →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
