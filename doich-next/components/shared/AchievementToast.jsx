'use client';

import { useEffect, useState } from 'react';

export default function AchievementToast({ achievement, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!achievement) return;
    // Slide in
    const t1 = setTimeout(() => setVisible(true), 20);
    // Slide out after 3.2s
    const t2 = setTimeout(() => setVisible(false), 3200);
    // Notify parent after animation
    const t3 = setTimeout(() => onDone?.(), 3700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [achievement]);

  if (!achievement) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 100, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 80}px)`,
      transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease',
      opacity: visible ? 1 : 0,
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'linear-gradient(135deg,#FF6FA8,#A78BFA)',
        borderRadius: 20,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 12px 40px rgba(167,139,250,0.45)',
        minWidth: 240, maxWidth: 320,
        whiteSpace: 'nowrap',
      }}>
        <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{achievement.icon}</div>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 1 }}>
            АМЖИЛТ НЭЭГДЛЭЭ 🎉
          </div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>{achievement.title}</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 1 }}>{achievement.desc}</div>
        </div>
      </div>
    </div>
  );
}
