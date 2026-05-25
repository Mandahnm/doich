'use client';

import { Heart, Trophy, ChevronRight, RefreshCw, Check } from 'lucide-react';
import { CEFR_META } from '@/lib/vocab';
import { getLevelInfo } from '@/lib/xp';

const CARDS = [
  { tab: 'chat',    bg: '#F9709A22', icon: '💬', title: 'AI багш',      sub: 'Монголоор тайлбар авах' },
  { tab: 'grammar', bg: '#A78BFA22', icon: '✏️', title: 'Засагч',       sub: 'Герман хэлний алдааг засах' },
  { tab: 'games',   bg: '#FF9F5A22', icon: '🎮', title: 'Тоглоомууд',   sub: 'Үг таах · Der Die Das' },
  { tab: 'vocab',   bg: '#34D39922', icon: '📖', title: 'Үгсийн сан',   sub: 'Шүүлтүүр болон сурсан үгс' },
];

export default function HomeScreen({ t, state, setTab }) {
  const isDoneToday = state.lastDailyDate === new Date().toDateString();
  const h        = new Date().getHours();
  const greeting = h < 12 ? 'Guten Morgen ☀️' : h < 18 ? 'Guten Tag 🌤️' : 'Guten Abend 🌙';
  const m        = CEFR_META[state.userLevel];
  const totalDone = Object.keys(state.completedStages || {}).length;

  const xp     = state.xp || 0;
  const streak = state.streak || 0;
  const { level, xpInLevel, xpToNext, progress } = getLevelInfo(xp);

  return (
    <div className="af">
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: t.textMid, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 4 }}>{greeting}</div>
        <div className="fd" style={{ fontSize: 30, fontWeight: 800, color: t.text }}>Сурцгаая!</div>
      </div>

      {/* Streak + XP level bar */}
      <div style={{ background: t.bgCard, borderRadius: 20, padding: '16px 18px', marginBottom: 16, boxShadow: t.shadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 28, lineHeight: 1 }}>{streak > 0 ? '🔥' : '💤'}</div>
            <div>
              <div className="fd" style={{ fontSize: 22, fontWeight: 800, color: streak > 0 ? '#FF6FA8' : t.textMid, lineHeight: 1 }}>{streak}</div>
              <div style={{ color: t.textMid, fontSize: 11, marginTop: 2 }}>Тасралтгүй өдрүүд/Streak</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>ТҮВШИН</div>
            <div className="fd" style={{ fontSize: 22, fontWeight: 800, color: t.pink, lineHeight: 1 }}>{level}</div>
            <div style={{ color: t.textMid, fontSize: 11 }}>{xp.toLocaleString()} XP</div>
          </div>
        </div>
        <div style={{ height: 8, background: t.bgTag, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: 'linear-gradient(90deg,#FF6FA8,#A78BFA)', borderRadius: 4, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ color: t.textMid, fontSize: 11, marginTop: 5, textAlign: 'right' }}>
          {xpInLevel} / {xpToNext} XP
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: t.bgCard, borderRadius: 20, padding: 16, boxShadow: t.shadow }}>
          <Heart size={16} color={t.pink} fill={t.pink} style={{ marginBottom: 8 }} />
          <div className="fd" style={{ fontSize: 30, fontWeight: 800, color: t.text }}>{state.learnedWords.length}</div>
          <div style={{ color: t.textMid, fontSize: 12, marginTop: 2 }}>сурсан үг</div>
        </div>
        <div style={{ background: t.darkMode ? t.bgTag : m.soft, borderRadius: 20, padding: 16, boxShadow: t.shadow }}>
          <Trophy size={16} color={t.pink} style={{ marginBottom: 8 }} />
          <div className="fd" style={{ fontSize: 30, fontWeight: 800, color: t.text }}>{totalDone}</div>
          <div style={{ color: t.textMid, fontSize: 12, marginTop: 2 }}>дууссан шат</div>
        </div>
      </div>

      {Object.keys(state.mistakes || {}).length > 0 && (
        <button onClick={() => setTab('mistakes')} className="au"
          style={{ width: '100%', background: 'linear-gradient(135deg,#FF6B6B,#E53E3E)', border: 'none', borderRadius: 20, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', boxShadow: '0 10px 30px rgba(229,62,62,0.25)', marginBottom: 12, color: '#fff', textAlign: 'left' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>❌</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Алдсан үгс {Object.keys(state.mistakes || {}).length}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Алдсан үгсийг давтан хий</div>
          </div>
          <ChevronRight size={18} color="rgba(255,255,255,0.85)" />
        </button>
      )}

      {state.learnedWords.length > 0 && (
        <button onClick={() => setTab('review')} className="au"
          style={{ width: '100%', background: t.pinkBtn, border: 'none', borderRadius: 20, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', boxShadow: t.shadowLg, marginBottom: 22, color: '#fff', textAlign: 'left' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RefreshCw size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Сурсан үгс давтах</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>{state.learnedWords.length} үг бэлэн</div>
          </div>
          <ChevronRight size={18} color="rgba(255,255,255,0.85)" />
        </button>
      )}

      {/* Daily Practice */}
      <button onClick={() => !isDoneToday && setTab('daily')}
        className={isDoneToday ? '' : 'au'}
        style={{
          width: '100%', border: 'none', borderRadius: 20, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 14, cursor: isDoneToday ? 'default' : 'pointer',
          marginBottom: 22, textAlign: 'left',
          background: isDoneToday ? t.bgCard : 'linear-gradient(135deg,#FF6FA8,#A78BFA)',
          boxShadow: isDoneToday ? t.shadow : '0 10px 30px rgba(255,111,168,0.30)',
          opacity: isDoneToday ? 0.75 : 1,
        }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: isDoneToday ? t.bgTag : 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📅</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: isDoneToday ? t.text : '#fff' }}>Өдөр тутмын дасгал</div>
          <div style={{ fontSize: 12, marginTop: 2, color: isDoneToday ? t.textMid : 'rgba(255,255,255,0.85)' }}>
            {isDoneToday ? 'Өнөөдөр дууссан ✓' : '6 төрлийн тоглоом · хэрэглэгчийн түвшинд тохирсон'}
          </div>
        </div>
        {isDoneToday
          ? <Check size={18} color={t.textSoft} />
          : <ChevronRight size={18} color="rgba(255,255,255,0.85)" />
        }
      </button>

      <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 12 }}>ДАСГАЛУУД</div>
      {CARDS.map((c, i) => (
        <button key={c.tab} onClick={() => setTab(c.tab)} className="au"
          style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: '14px 16px', cursor: 'pointer', boxShadow: t.shadow, width: '100%', textAlign: 'left', marginBottom: 10, animationDelay: `${i * 55}ms` }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{c.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: t.text, fontSize: 14 }}>{c.title}</div>
            <div style={{ color: t.textMid, fontSize: 12, marginTop: 2 }}>{c.sub}</div>
          </div>
          <ChevronRight size={18} color={t.textSoft} />
        </button>
      ))}
    </div>
  );
}
