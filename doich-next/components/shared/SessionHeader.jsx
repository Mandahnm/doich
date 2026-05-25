'use client';

import { ArrowLeft } from 'lucide-react';
import { CEFR_META } from '@/lib/vocab';

export default function SessionHeader({ t, progress, idx, total, onQuit, cefr }) {
  // eslint-disable-next-line no-unused-vars
  const m = CEFR_META[cefr] || {};
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button onClick={onQuit}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: t.textMid, fontWeight: 700, fontSize: 13, padding: 0 }}>
          <ArrowLeft size={16} /> Гарах
        </button>
        <div style={{ background: t.bgTag, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 800, color: t.text }}>
          {idx + 1}/{total}
        </div>
      </div>
      <div style={{ height: 10, background: t.bgTag, borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress * 100}%`, background: t.pinkBtn, borderRadius: 5, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}
