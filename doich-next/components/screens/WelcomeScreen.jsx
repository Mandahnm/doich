'use client';

import { useState } from 'react';
import { Sun, Moon, Check } from 'lucide-react';
import { LEVELS, CEFR_META } from '@/lib/vocab';

const LEVEL_DESC = {
  A1: 'Анхан шатны үг, өгүүлбэр',
  A2: 'Энгийн харилцаа',
  B1: 'Өдөр тутмын яриа',
  B2: 'Нарийн сэдвүүд',
  C1: 'Чөлөөтэй ярих',
};

export default function WelcomeScreen({ t, onSelect, isDark, onToggle }) {
  const [sel, setSel] = useState(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(160deg,#1E1530,#15121E)'
        : 'linear-gradient(160deg,#FFF0F7,#FFF8F3,#F0EAFF)',
      position: 'relative', overflow: 'hidden',
    }}>
      <button onClick={onToggle}
        style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: 20, background: t.bgCard, border: `1px solid ${t.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadow }}>
        {isDark ? <Sun size={17} color={t.textMid} /> : <Moon size={17} color={t.textMid} />}
      </button>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '60px 22px 30px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-block', background: isDark ? t.pinkBg : '#FFE4F0', color: t.pink, padding: '4px 16px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 14 }}>
            DEUTSCH · МОНГОЛ
          </div>
          <div className="fd" style={{ fontSize: 68, fontWeight: 800, color: t.text, lineHeight: 1 }}>Дойч</div>
          <div style={{ color: t.textMid, fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>
            Монгол хэлээр герман хэл сурах хөгжилтэй апп 🎓
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 12, textAlign: 'center' }}>
            ТА ЯМАР ТҮВШИНД БАЙНА?
          </div>
          {LEVELS.map((lv, i) => {
            const m      = CEFR_META[lv];
            const active = sel === lv;
            return (
              <button key={lv} onClick={() => setSel(lv)} className="au"
                style={{ width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 18, border: `2px solid ${active ? t.pink : t.border}`, background: active ? (isDark ? t.bgTag : m.soft) : t.bgCard, boxShadow: t.shadow, cursor: 'pointer', marginBottom: 10, animationDelay: `${i * 55}ms` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="fd" style={{ width: 50, height: 50, borderRadius: 14, background: isDark ? t.bgTag : m.pill, color: isDark ? t.pink : m.pillTxt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, flexShrink: 0 }}>
                    {lv}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: t.text, fontSize: 14 }}>{m.title}</div>
                    <div style={{ color: t.textMid, fontSize: 12, marginTop: 2 }}>{LEVEL_DESC[lv]}</div>
                  </div>
                  {active && (
                    <div style={{ marginLeft: 'auto', width: 26, height: 26, borderRadius: 13, background: t.pink, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="ap">
                      <Check size={15} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={() => sel && onSelect(sel)} disabled={!sel}
          style={{ marginTop: 16, width: '100%', padding: '16px', borderRadius: 18, fontWeight: 800, fontSize: 15, border: 'none', cursor: sel ? 'pointer' : 'not-allowed', background: sel ? t.pinkBtn : t.border, color: sel ? t.pinkBtnText : t.textSoft, boxShadow: sel ? t.shadowLg : 'none' }}>
          Эхлэх →
        </button>
      </div>
    </div>
  );
}
