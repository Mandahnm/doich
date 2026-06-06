'use client';

import { useEffect, useState } from 'react';

// Reusable shimmer block
export function Sk({ w = '100%', h = 16, r = 8, style = {} }) {
  return <div className="sk" style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...style }} />;
}

// Wraps any screen — shows skeleton for `ms` milliseconds on first mount
export function WithSkeleton({ skeleton, ms = 250, children }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, []);
  return ready ? children : skeleton;
}

// ── Per-screen skeletons ──────────────────────────────────────────────────

export function HomeSkeleton({ t }) {
  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <Sk w={44} h={44} r={16} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Sk w={120} h={12} />
          <Sk w={160} h={22} />
        </div>
      </div>
      {/* Streak card */}
      <Sk h={110} r={20} />
      {/* Stats 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Sk h={88} r={16} />
        <Sk h={88} r={16} />
      </div>
      {/* Daily button */}
      <Sk h={68} r={16} />
      {/* Review button */}
      <Sk h={60} r={16} />
      {/* Word of day */}
      <Sk h={140} r={20} />
      {/* Tools */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Sk w={58} h={58} r={18} />
            <Sk w={44} h={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function VocabSkeleton({ t }) {
  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Sk w={100} h={10} />
      <Sk h={46} r={14} />
      <div style={{ display: 'flex', gap: 8 }}>
        {[80,70,60,70,60].map((w, i) => <Sk key={i} w={w} h={32} r={20} />)}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[60,70,80,60].map((w, i) => <Sk key={i} w={w} h={32} r={20} />)}
      </div>
      {[0,1,2,3,4,5,6].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.bgCard, borderRadius: 14, padding: '11px 14px', border: `1px solid ${t.border}` }}>
          <Sk w={42} h={42} r={11} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Sk w="60%" h={13} />
            <Sk w="40%" h={11} />
          </div>
          <Sk w={32} h={32} r={16} />
        </div>
      ))}
    </div>
  );
}

export function GamesSkeleton({ t }) {
  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Sk w={80} h={10} />
      {/* Level pills */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[50,50,50,50,50].map((w, i) => <Sk key={i} w={w} h={36} r={22} />)}
      </div>
      {/* Game cards 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[0,1,2,3,4,5,6,7].map(i => <Sk key={i} h={90} r={18} />)}
      </div>
    </div>
  );
}

export function ProfileSkeleton({ t }) {
  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* User card */}
      <div style={{ background: t.bgCard, borderRadius: 24, padding: '24px 20px', border: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <Sk w={80} h={80} r={40} />
        <Sk w={140} h={16} />
        <Sk w={100} h={12} />
      </div>
      {/* Level card */}
      <Sk h={80} r={20} />
      {/* Stats 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[0,1,2,3].map(i => <Sk key={i} h={88} r={18} />)}
      </div>
      {/* Achievements */}
      <Sk h={180} r={20} />
    </div>
  );
}

export function ChatSkeleton({ t }) {
  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Sk w={80} h={10} />
      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}><Sk w="70%" h={52} r={16} /></div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Sk w="55%" h={40} r={16} /></div>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}><Sk w="80%" h={72} r={16} /></div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Sk w="45%" h={40} r={16} /></div>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}><Sk w="65%" h={56} r={16} /></div>
      </div>
      {/* Input */}
      <Sk h={52} r={14} style={{ marginTop: 'auto' }} />
    </div>
  );
}

export function ReadingSkeleton({ t }) {
  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Sk w={80}  h={10} />
      <Sk w={180} h={28} r={8} />
      <Sk w={120} h={12} />
      {/* Level chips */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[50, 50, 50, 50, 50].map((w, i) => <Sk key={i} w={w} h={32} r={20} />)}
      </div>
      {/* Section label */}
      <Sk w={140} h={10} style={{ marginTop: 6 }} />
      {/* Story cards */}
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          background: t.bgCard, borderRadius: 20,
          border: `1px solid ${t.border}`,
          padding: '14px 14px 14px 20px',
          display: 'flex', flexDirection: 'column', gap: 10,
          overflow: 'hidden', position: 'relative',
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: t.border }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Sk w={90} h={20} r={6} />
            <Sk w={18} h={18} r={9} />
          </div>
          <Sk w="65%" h={16} />
          <div style={{ display: 'flex', gap: 12 }}>
            <Sk w={52} h={12} />
            <Sk w={64} h={12} />
          </div>
        </div>
      ))}
    </div>
  );
}
