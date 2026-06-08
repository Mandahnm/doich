'use client';

import { Star, RefreshCw, ChevronRight, Crown } from 'lucide-react';

export default function ResultScreen({ t, stage, score, xpEarned = 0, onReplay, onBack, onNext, onUpgrade }) {
  const total = stage?.words?.length || 1;
  const pct   = score / total;
  const stars = pct >= 0.87 ? 3 : pct >= 0.6 ? 2 : 1;

  return (
    <div className="af" style={{ textAlign: 'center', paddingTop: 24 }}>
      <div style={{ fontSize: 72, marginBottom: 8 }} className="ap">
        {stars === 3 ? '🏆' : stars === 2 ? '🎉' : '✨'}
      </div>
      <div className="fd" style={{ fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 20 }}>
        Шат дууслаа!
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3].map(s => (
          <Star key={s} size={36} color={s <= stars ? '#FFAA00' : t.border} fill={s <= stars ? '#FFAA00' : t.border} />
        ))}
      </div>
      <div style={{ background: t.bgCard, borderRadius: 24, padding: '24px', boxShadow: t.shadowLg, marginBottom: 20 }}>
        <div className="fd" style={{ fontSize: 52, fontWeight: 800, color: t.text }}>
          {score}<span style={{ fontSize: 24, color: t.textMid }}>/{total}</span>
        </div>
        <div style={{ color: t.textMid, fontSize: 14, marginTop: 4 }}>зөв хариулт</div>
        <div style={{ marginTop: 16, height: 10, background: t.bgTag, borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct * 100}%`, background: t.pinkBtn, borderRadius: 5 }} />
        </div>
        <div style={{ color: t.textMid, fontSize: 13, marginTop: 10, lineHeight: 1.5 }}>
          {stars === 3 && 'Гайхалтай! Та бүх үгийг мэднэ! 🔥'}
          {stars === 2 && 'Маш сайн! Цаашид дадлага хийгээрэй 💪'}
          {stars === 1 && 'Сайн! Дахин давтан хийгээрэй 📖'}
        </div>
        {xpEarned > 0 && (
          <div className="ap" style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(90deg,#FF6FA8,#A78BFA)', borderRadius: 20, padding: '8px 20px' }}>
            <span style={{ fontSize: 16 }}>⭐</span>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>+{xpEarned} XP</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
        {onNext && (
          <button onClick={onNext}
            style={{ width: '100%', padding: '16px', borderRadius: 16, fontWeight: 800, fontSize: 15, border: 'none', background: t.pinkBtn, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: t.shadowLg }}>
            Дараагийн шат <ChevronRight size={18} />
          </button>
        )}
        {!onNext && onUpgrade && (
          <button onClick={onUpgrade}
            style={{ width: '100%', padding: '16px', borderRadius: 16, fontWeight: 800, fontSize: 15, border: 'none', background: 'linear-gradient(135deg, #FF6FA8, #A78BFA)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(255,111,168,0.35)' }}>
            <Crown size={18} /> Pro авах — шат нээх
          </button>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onBack}
            style={{ flex: 1, padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 14, border: `2px solid ${t.border}`, background: 'transparent', color: t.textMid, cursor: 'pointer' }}>
            ← Буцах
          </button>
          <button onClick={onReplay}
            style={{ flex: 1, padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 14, border: `2px solid ${t.border}`, background: 'transparent', color: t.textMid, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <RefreshCw size={15} /> Дахин
          </button>
        </div>
      </div>
    </div>
  );
}
