'use client';

import { useState } from 'react';
import { Crown, Check, ArrowLeft, Zap } from 'lucide-react';
import { PRICING, PRO_FEATURES, FREE_AI_TUTOR_DAILY, FREE_STAGES_PER_LEVEL } from '@/lib/plans';

export default function PricingScreen({ t, onBack }) {
  const [selected, setSelected] = useState('annual');
  const selectedPlan = PRICING.find(p => p.id === selected);

  const FREE_PERKS = [
    `A1–C1 бүх үг (үгийн сан бүтэн)`,
    'Өдөр тутмын дасгал',
    'SRS давталт',
    `Тоглоом — шат бүрт эхний ${FREE_STAGES_PER_LEVEL} шат`,
    'CEFR бүр нэг өгүүллэг унших',
    `AI Багшт өдөрт ${FREE_AI_TUTOR_DAILY} чат`,
  ];

  return (
    <div className="af" style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button onClick={onBack}
          style={{ width: 38, height: 38, borderRadius: 14, background: t.bgCard, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: t.shadow, flexShrink: 0 }}>
          <ArrowLeft size={18} color={t.textMid} />
        </button>
        <div>
          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em' }}>ТАРИФИЙН ТӨЛӨВЛӨГӨӨ</div>
          <div className="fd" style={{ fontSize: 20, fontWeight: 800, color: t.text }}>Doich Pro</div>
        </div>
      </div>

      {/* Hero badge */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'linear-gradient(135deg, #FF6FA8, #A78BFA)',
          borderRadius: 20, padding: '14px 28px',
          boxShadow: '0 8px 28px rgba(255,111,168,0.35)',
        }}>
          <Crown size={22} color="#fff" />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>Pro эрхтэй болж герман хэлээ улам сайжруулаарай</span>
        </div>
      </div>

      {/* Free vs Pro comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {/* Free column */}
        <div style={{ background: t.bgCard, borderRadius: 20, padding: '18px 16px', border: `1px solid ${t.border}` }}>
          <div style={{ fontWeight: 800, color: t.text, fontSize: 15, marginBottom: 14 }}>Үнэгүй</div>
          {FREE_PERKS.map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 8 }}>
              <Check size={13} color="#22C55E" strokeWidth={3} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: t.textMid, lineHeight: 1.4 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Pro column */}
        <div style={{
          background: 'linear-gradient(160deg, rgba(255,111,168,0.12), rgba(167,139,250,0.12))',
          borderRadius: 20, padding: '18px 16px',
          border: `2px solid rgba(255,111,168,0.4)`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -12, right: -12, width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6FA880, #A78BFA80)',
          }} />
          <div style={{ fontWeight: 800, color: t.text, fontSize: 15, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Crown size={15} color="#FF6FA8" /> Pro
          </div>
          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 700, marginBottom: 14 }}>Үнэгүйн бүгдийг + доорхыг:</div>
          {PRO_FEATURES.map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 8 }}>
              <Zap size={13} color="#A78BFA" strokeWidth={3} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: t.text, lineHeight: 1.4, fontWeight: 600 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing options */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 12 }}>
          ТӨЛБӨРИЙН ХУГАЦАА СОНГОНО УУ
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PRICING.map(plan => {
            const isActive = selected === plan.id;
            return (
              <button key={plan.id} onClick={() => setSelected(plan.id)}
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(255,111,168,0.15), rgba(167,139,250,0.15))'
                    : t.bgCard,
                  border: `2px solid ${isActive ? '#FF6FA8' : t.border}`,
                  borderRadius: 16, padding: '14px 18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: isActive ? '0 4px 20px rgba(255,111,168,0.2)' : t.shadow,
                }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: t.text }}>{plan.labelMn}</div>
                  <div style={{ fontSize: 12, color: t.textMid, marginTop: 2 }}>
                    Сарын {plan.perMonth.toLocaleString()}₮
                    {plan.saving > 0 && (
                      <span style={{ marginLeft: 8, background: '#22C55E', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
                        {plan.saving}% хэмнэлт
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: isActive ? '#FF6FA8' : t.text }}>
                    {plan.price.toLocaleString()}₮
                  </div>
                  {plan.months > 1 && (
                    <div style={{ fontSize: 11, color: t.textSoft }}>{plan.months} сар</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA Button */}
      <div style={{ marginBottom: 16 }}>
        {/* TODO: Bonum HMAC-SHA256 webhook integration — wire up real payment here */}
        <button
          disabled
          style={{
            width: '100%', padding: '18px', borderRadius: 18,
            fontWeight: 800, fontSize: 16, border: 'none',
            background: t.bgTag, color: t.textMid,
            cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
          <Crown size={18} />
          Боловсруулж байна — удахгүй нэмэгдэнэ
        </button>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: t.textSoft }}>
          QPay / Bonum төлбөр удахгүй нэмэгдэнэ
        </div>
      </div>

      {/* Fine print */}
      <div style={{ background: t.bgCard, borderRadius: 16, padding: '14px 16px', border: `1px solid ${t.border}`, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: t.textSoft, lineHeight: 1.7 }}>
          • Одоо Pro эрх авахыг хүсвэл <span style={{ color: t.text, fontWeight: 700 }}>doichapp@gmail.com</span>-р холбоо барина уу<br />
          • Pro эрх нь автоматаар сунгагдахгүй<br />
          • Асуух зүйл байвал холбоо барина уу
        </div>
      </div>

      {/* Refund policy link */}
      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <a href="/terms" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: t.textSoft, textDecoration: 'underline', cursor: 'pointer' }}>
          Буцаан олголтын бодлого
        </a>
      </div>
    </div>
  );
}
