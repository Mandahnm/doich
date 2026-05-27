'use client';

import { ACHIEVEMENTS } from '@/lib/achievements';

const CATEGORY_META = {
  vocab:  { label: 'Үгсийн сан 📚',  color: '#34D399' },
  streak: { label: 'Тасралтгүй 🔥',  color: '#FF6FA8' },
  games:  { label: 'Тоглоомууд 🎮',  color: '#F59E0B' },
  xp:     { label: 'Туршлага ⭐',    color: '#A78BFA' },
  daily:  { label: 'Өдрийн дасгал 📅', color: '#60A5FA' },
  stages: { label: 'Шатнууд 🗺️',     color: '#FB7185' },
};

const CATEGORIES = Object.keys(CATEGORY_META);

export default function AchievementsScreen({ t, state }) {
  const unlockedCount = ACHIEVEMENTS.filter(a => a.check(state)).length;

  return (
    <div className="af">
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 4 }}>АМЖИЛТУУД 🏅</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="fd" style={{ fontSize: 28, fontWeight: 800, color: t.text }}>{unlockedCount}</span>
          <span style={{ color: t.textMid, fontSize: 14, fontWeight: 600 }}>/ {ACHIEVEMENTS.length} нээгдсэн</span>
        </div>
        {/* Overall progress bar */}
        <div style={{ height: 8, background: t.bgTag, borderRadius: 4, overflow: 'hidden', marginTop: 10 }}>
          <div style={{
            height: '100%',
            width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`,
            background: 'linear-gradient(90deg,#FF6FA8,#A78BFA)',
            borderRadius: 4,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* Categories */}
      {CATEGORIES.map(cat => {
        const items = ACHIEVEMENTS.filter(a => a.category === cat);
        const meta  = CATEGORY_META[cat];
        return (
          <div key={cat} style={{ marginBottom: 22 }}>
            <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 10 }}>
              {meta.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(a => {
                const unlocked = a.check(state);
                const value    = a.getValue ? Math.min(a.getValue(state), a.max) : 0;
                const pct      = a.max ? value / a.max : 0;

                return (
                  <div key={a.id} className={unlocked ? 'au' : ''} style={{
                    background: t.bgCard,
                    borderRadius: 18,
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 14,
                    boxShadow: unlocked
                      ? `0 4px 20px ${meta.color}28`
                      : t.shadow,
                    border: `1.5px solid ${unlocked ? meta.color + '44' : t.border}`,
                    opacity: unlocked ? 1 : 0.55,
                    transition: 'opacity 0.2s',
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                      background: unlocked ? meta.color + '22' : t.bgTag,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26,
                      filter: unlocked ? 'none' : 'grayscale(100%)',
                    }}>
                      {a.icon}
                    </div>

                    {/* Text + progress */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, color: t.text, fontSize: 14 }}>{a.title}</span>
                        {unlocked && (
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 10,
                            background: meta.color + '22', color: meta.color,
                          }}>✓</span>
                        )}
                      </div>
                      <div style={{ color: t.textMid, fontSize: 12, marginBottom: unlocked ? 0 : 6 }}>{a.desc}</div>
                      {/* Progress bar — only shown while locked */}
                      {!unlocked && a.max && (
                        <div>
                          <div style={{ height: 5, background: t.bgTag, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${pct * 100}%`,
                              background: meta.color,
                              borderRadius: 3,
                              transition: 'width 0.4s ease',
                            }} />
                          </div>
                          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 700, marginTop: 3 }}>
                            {value} / {a.max}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
