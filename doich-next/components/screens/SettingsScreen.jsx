'use client';

import { LogOut } from 'lucide-react';
import { LEVELS } from '@/lib/vocab';

export default function SettingsScreen({ t, state, update }) {
  const totalDone = Object.keys(state.completedStages || {}).length;

  const STATS = [
    { e: '🎯', l: 'Үг таах',      v: `${state.stats.flashcardsCorrect}/${state.stats.flashcardsTotal}` },
    { e: '🏷️', l: 'Артикль',      v: `${state.stats.genderCorrect}/${state.stats.genderTotal}` },
    { e: '💖', l: 'Сурсан үг',    v: state.learnedWords.length },
    { e: '🏆', l: 'Дууссан шат',  v: totalDone },
  ];

  const handleReset = () => {
    if (confirm('Бүх өгөгдлийг устгах уу?')) {
      update({
        userLevel: null, learnedWords: [], completedStages: {}, mistakes: {},
        stats: { flashcardsCorrect: 0, flashcardsTotal: 0, genderCorrect: 0, genderTotal: 0 },
      });
    }
  };

  return (
    <div className="af">
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 4 }}>ТОХИРГОО ⚙️</div>
        <div className="fd" style={{ fontSize: 28, fontWeight: 800, color: t.text }}>Settings</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: t.bgCard, borderRadius: 20, padding: 16, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>Өдрийн / харанхуй горим</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[{ d: false, label: '☀️ Цагаан' }, { d: true, label: '🌙 Харанхуй' }].map(o => (
              <button key={String(o.d)} onClick={() => update({ darkMode: o.d })}
                style={{ padding: '12px', borderRadius: 14, border: `2px solid ${state.darkMode === o.d ? t.pink : t.border}`, background: state.darkMode === o.d ? t.pinkBg : t.bgTag, color: state.darkMode === o.d ? t.pink : t.textMid, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: t.bgCard, borderRadius: 20, padding: 16, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>Миний түвшин</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
            {LEVELS.map(l => {
              const a = state.userLevel === l;
              return (
                <button key={l} onClick={() => update({ userLevel: l })}
                  style={{ padding: '12px 0', borderRadius: 14, border: `2px solid ${a ? t.pink : t.border}`, background: a ? t.pinkBg : t.bgTag, color: a ? t.pink : t.textMid, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ background: t.bgCard, borderRadius: 20, padding: 16, boxShadow: t.shadow }}>
          <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>Статистик 📊</div>
          {STATS.map(s => (
            <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.bgTag, borderRadius: 12, padding: '10px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.textMid, fontWeight: 600, fontSize: 14 }}>
                <span>{s.e}</span>{s.l}
              </div>
              <div style={{ fontWeight: 800, color: t.text, fontSize: 14 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <button onClick={handleReset}
          style={{ width: '100%', padding: '14px', borderRadius: 18, background: t.bgCard, border: `2px solid ${t.darkMode ? '#4A1F25' : '#FFD0D5'}`, color: '#E53E4D', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: t.shadow }}>
          <LogOut size={16} /> Бүх өгөгдлийг устгах
        </button>
      </div>
    </div>
  );
}
