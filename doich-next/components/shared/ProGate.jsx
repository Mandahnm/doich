'use client';

import { Crown } from 'lucide-react';
import { PRO_FEATURES } from '@/lib/plans';

/**
 * Full-screen paywall for Pro-only features.
 * Render this instead of the locked feature content when plan !== 'pro'.
 */
export default function ProGate({ t, feature = 'Энэ функцийг', onUpgrade }) {
  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px', minHeight: 400 }}>
      {/* Crown icon */}
      <div style={{
        width: 80, height: 80, borderRadius: 28,
        background: 'linear-gradient(135deg, #FF6FA8, #A78BFA)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, boxShadow: '0 12px 32px rgba(255,111,168,0.35)',
      }}>
        <Crown size={36} color="#fff" strokeWidth={2} />
      </div>

      <div className="fd" style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 8 }}>
        Pro шаардлагатай
      </div>
      <div style={{ color: t.textMid, fontSize: 15, lineHeight: 1.6, marginBottom: 24, maxWidth: 300 }}>
        {feature} ашиглахын тулд Pro эрхтэй байх шаардлагатай.
      </div>

      {/* Feature list */}
      <div style={{
        background: t.bgCard, borderRadius: 20, padding: '18px 20px',
        marginBottom: 24, width: '100%', maxWidth: 320,
        border: `1px solid ${t.border}`, textAlign: 'left',
      }}>
        <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 12, textAlign: 'center' }}>
          PRO БАГЦАД БАГТДАГ
        </div>
        {PRO_FEATURES.map(item => (
          <div key={item} style={{ fontSize: 13, color: t.textMid, marginBottom: 7, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ color: '#22C55E', fontWeight: 800, flexShrink: 0 }}>✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button onClick={onUpgrade} style={{
        background: 'linear-gradient(135deg, #FF6FA8, #A78BFA)',
        color: '#fff', fontWeight: 800, fontSize: 16,
        border: 'none', borderRadius: 16, padding: '16px 40px',
        cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,111,168,0.35)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Crown size={18} color="#fff" />
        Pro авах
      </button>

      <div style={{ marginTop: 12, fontSize: 12, color: t.textSoft }}>
        Сарын 12,900₮-оос эхэлнэ
      </div>
    </div>
  );
}
