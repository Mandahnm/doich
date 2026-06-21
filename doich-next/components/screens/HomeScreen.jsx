'use client';

import { Heart, Trophy, ChevronRight, RefreshCw, Check, BookOpen, Gamepad2, MessageCircle, Pencil, Crown } from 'lucide-react';
import { WithSkeleton, HomeSkeleton } from '@/components/shared/ScreenSkeleton';
import { VOCAB, CEFR_META } from '@/lib/vocab';
import { getLevelInfo } from '@/lib/xp';
import { getDueCount, getNextDueLabel } from '@/lib/srs';
import PlayButton from '@/components/shared/PlayButton';

const TYPE_LABEL = { noun: 'Нэр үг', verb: 'Үйл үг', adj: 'Тэмдэг нэр', adv: 'Дайвар үг' };

const QUICK_TOOLS = [
  { tab: 'chat',    icon: <MessageCircle size={24} strokeWidth={2} />, label: 'AI багш',    color: '#dceeff', iconColor: '#0062a1' },
  { tab: 'grammar', icon: <Pencil        size={24} strokeWidth={2} />, label: 'Засагч',     color: '#ffdad4', iconColor: '#bc0000' },
  { tab: 'games',   icon: <Gamepad2      size={24} strokeWidth={2} />, label: 'Тоглоомууд', color: '#fff8d4', iconColor: '#745b00' },
  { tab: 'vocab',   icon: <BookOpen      size={24} strokeWidth={2} />, label: 'Үгсийн сан', color: '#d6f5e5', iconColor: '#006d3a' },
];

function getWordOfTheDay() {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return VOCAB[dayIndex % VOCAB.length];
}

export default function HomeScreen({ t, state, setTab, isDesktop, plan, onUpgrade }) {
  return <WithSkeleton ms={250} skeleton={<HomeSkeleton t={t} />}><HomeScreenInner t={t} state={state} setTab={setTab} isDesktop={isDesktop} plan={plan} onUpgrade={onUpgrade} /></WithSkeleton>;
}

function HomeScreenInner({ t, state, setTab, isDesktop, plan, onUpgrade }) {
  const isDoneToday = state.lastDailyDate === new Date().toDateString();
  const h         = new Date().getHours();
  const greetWord = h < 5 ? 'Gute Nacht' : h < 12 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend';
  const m         = CEFR_META[state.userLevel];
  const totalDone = Object.keys(state.completedStages || {}).length;
  const xp        = state.xp || 0;
  const streak    = state.streak || 0;
  const { level, xpInLevel, xpToNext, progress } = getLevelInfo(xp);

  const srs     = state.stats?.srs || {};
  const due     = getDueCount(state.learnedWords, srs);
  const nextLbl = due === 0 ? getNextDueLabel(state.learnedWords, srs) : null;

  const wod  = getWordOfTheDay();
  const wodM = CEFR_META[wod.level];

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ padding: '12px 8px', maxWidth: 1060, margin: '0 auto' }}>

        {/* Greeting */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>
            {greetWord}{state.userName ? `, ${state.userName}!` : '!'}
          </div>
          <div style={{ color: t.textSoft, fontSize: 14, marginTop: 3 }}>Сурцгаая!</div>
        </div>

        {/* Row 1: Streak card + mini stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 16 }}>

          {/* Streak + XP */}
          <div style={{ background: t.bgCard, borderRadius: 20, padding: '24px 28px', border: `1px solid ${t.border}` }}>
            <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 14 }}>STREAK</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 22 }}>{streak > 0 ? '🔥' : '💤'}</span>
              <span className="fd" style={{ fontSize: 52, fontWeight: 800, color: t.text, lineHeight: 1 }}>{streak}</span>
              <span style={{ fontSize: 16, color: t.textSoft, marginBottom: 8 }}>өдөр</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ color: t.textSoft, fontSize: 13 }}>XP: {xpInLevel} / {xpToNext}</span>
              <span style={{ color: t.pink, fontSize: 13, fontWeight: 700 }}>Түвшин {level}</span>
            </div>
            <div style={{ height: 10, background: t.bgTag, borderRadius: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress * 100}%`, background: t.pinkBtn, borderRadius: 5, transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {/* Mini stats stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ flex: 1, background: t.bgCard, borderRadius: 16, padding: '18px 20px', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dceeff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Heart size={20} color="#0062a1" fill="#0062a1" />
              </div>
              <div>
                <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 4 }}>СУРСАН ҮГС</div>
                <div className="fd" style={{ fontSize: 24, fontWeight: 800, color: t.text, lineHeight: 1 }}>{state.learnedWords.length}</div>
              </div>
            </div>
            <div style={{ flex: 1, background: t.bgCard, borderRadius: 16, padding: '18px 20px', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff8d4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trophy size={20} color="#745b00" />
              </div>
              <div>
                <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 4 }}>ТҮВШИН</div>
                <div className="fd" style={{ fontSize: 24, fontWeight: 800, color: t.text, lineHeight: 1 }}>{state.userLevel}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Word of the Day + Daily/SRS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Word of the Day — dark card */}
          <div style={{ background: t.skyBg, borderRadius: 20, padding: '20px 22px', border: `1px solid ${t.sky}30` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ color: t.sky, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em' }}>Өнөөдрийн үг 📚</div>
              <div style={{ color: t.sky, fontSize: 11, opacity: 0.75 }}>
                {new Date().toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 44, lineHeight: 1, flexShrink: 0 }}>{wod.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                  {wod.gender && <span style={{ color: t.sky, fontWeight: 800, fontSize: 15 }}>{wod.gender}</span>}
                  <span className="fd" style={{ fontWeight: 800, color: t.darkMode ? t.text : '#003355', fontSize: 26 }}>{wod.de}</span>
                  <PlayButton wordId={wod.id} size={18} color={t.sky} />
                </div>
                <div style={{ color: t.darkMode ? t.textMid : '#005580', fontSize: 15, fontWeight: 600 }}>{wod.mn}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, background: wodM.pill, color: wodM.pillTxt, padding: '2px 8px', borderRadius: 10 }}>{wod.level}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, background: 'rgba(0,98,161,0.12)', color: t.sky, padding: '2px 8px', borderRadius: 10 }}>{TYPE_LABEL[wod.type] || wod.type}</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '10px 14px', background: 'rgba(0,98,161,0.08)', borderRadius: 12 }}>
              <div style={{ color: t.darkMode ? t.textMid : '#005580', fontSize: 13, fontStyle: 'italic', lineHeight: 1.5 }}>{wod.example}</div>
            </div>
          </div>

          {/* Daily Practice + SRS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => !isDoneToday && setTab('daily')} className={isDoneToday ? '' : 'au'}
              style={{
                flex: 1, border: 'none', borderRadius: 16, padding: '20px 22px',
                display: 'flex', alignItems: 'center', gap: 14, cursor: isDoneToday ? 'default' : 'pointer', textAlign: 'left',
                background: isDoneToday ? t.bgTag : t.pinkBtn,
                opacity: isDoneToday ? 0.7 : 1,
              }}>
              <span style={{ fontSize: 28 }}>📅</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: isDoneToday ? t.textMid : t.pinkBtnText }}>Өдөр тутмын дасгал</div>
                <div style={{ fontSize: 13, color: isDoneToday ? t.textSoft : t.pinkBtnText, opacity: 0.8, marginTop: 2 }}>
                  {isDoneToday ? 'Өнөөдөр дууссан ✓' : '8 төрлийн тоглоом'}
                </div>
              </div>
              {isDoneToday
                ? <Check size={20} color={t.textSoft} />
                : <ChevronRight size={20} color={t.pinkBtnText} style={{ opacity: 0.7 }} />}
            </button>

            {state.learnedWords.length > 0 && (
              <button onClick={() => setTab('review')} className="au"
                style={{
                  flex: 1, borderRadius: 16, padding: '20px 22px',
                  display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left', border: 'none',
                  background: t.bgCard,
                  outline: `2px solid ${due > 0 ? t.pink : t.border}`,
                }}>
                <RefreshCw size={22} color={due > 0 ? t.pink : t.textSoft} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: due > 0 ? t.pink : t.textMid }}>
                    Сурсан үгс давтах
                    {due > 0 && <span style={{ marginLeft: 8, background: t.pinkBtn, color: t.pinkBtnText, borderRadius: 20, padding: '1px 8px', fontSize: 12, fontWeight: 800 }}>{due}</span>}
                  </div>
                  {due === 0 && nextLbl && (
                    <div style={{ color: t.textSoft, fontSize: 12, marginTop: 2 }}>Дараагийн давталт: {nextLbl}</div>
                  )}
                </div>
                <ChevronRight size={18} color={t.textSoft} />
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Quick Tools */}
        <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 14 }}>ДАСГАЛУУД</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {QUICK_TOOLS.map((tool, i) => (
            <button key={tool.tab} onClick={() => setTab(tool.tab)} className="au"
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                background: t.bgCard, border: `1px solid ${t.border}`,
                borderRadius: 16, cursor: 'pointer', animationDelay: `${i * 60}ms`,
              }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: tool.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool.iconColor, flexShrink: 0 }}>
                {tool.icon}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.textMid }}>{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Pro upgrade banner — only for free users */}
        {plan !== 'pro' && (
          <button onClick={onUpgrade} className="au" style={{
            width: '100%', border: `1.5px solid #e6b800`, borderRadius: 20, padding: '20px 24px',
            background: 'linear-gradient(135deg, #fff8d4 0%, #fff3b0 100%)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 6px 24px rgba(201,160,0,0.18)',
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ffcc00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(201,160,0,0.35)' }}>
              <Crown size={24} color="#241a00" strokeWidth={2} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#4a3800' }}>Pro эрхтэй болох</div>
              <div style={{ fontSize: 13, color: '#745b00', marginTop: 2 }}>Бүх шат, өгүүллэг, хязгааргүй AI · Сарын 12,900₮-оос</div>
            </div>
            <ChevronRight size={20} color="#745b00" />
          </button>
        )}

      </div>
    );
  }

  // ── MOBILE ────────────────────────────────────────────────────────────────
  return (
    <div className="af">
      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: t.textSoft, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
          {greetWord}{state.userName ? `, ${state.userName}` : ''}
        </div>
        <div className="fd" style={{ fontSize: 28, fontWeight: 800, color: t.text, lineHeight: 1.1 }}>Сурцгаая!</div>
      </div>

      {/* Streak + XP card */}
      <div style={{ background: t.bgCard, borderRadius: 20, padding: '16px 18px', marginBottom: 14, border: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 4 }}>STREAK</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 22 }}>{streak > 0 ? '🔥' : '💤'}</span>
              <span className="fd" style={{ fontSize: 26, fontWeight: 800, color: streak > 0 ? t.pink : t.textMid, lineHeight: 1 }}>{streak}</span>
              <span style={{ color: t.textSoft, fontSize: 12 }}>өдөр</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 4 }}>ТҮВШИН · XP</div>
            <div className="fd" style={{ fontSize: 20, fontWeight: 800, color: t.pink, lineHeight: 1 }}>{level}</div>
            <div style={{ color: t.textSoft, fontSize: 12 }}>{xpInLevel} / {xpToNext}</div>
          </div>
        </div>
        <div style={{ height: 8, background: t.bgTag, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: t.pinkBtn, borderRadius: 4, transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ background: t.bgCard, borderRadius: 16, padding: '14px 16px', border: `1px solid ${t.border}` }}>
          <Heart size={16} color={t.rose} fill={t.rose} style={{ marginBottom: 6 }} />
          <div className="fd" style={{ fontSize: 28, fontWeight: 800, color: t.text, lineHeight: 1 }}>{state.learnedWords.length}</div>
          <div style={{ color: t.textSoft, fontSize: 12, marginTop: 3 }}>сурсан үг</div>
        </div>
        <div style={{ background: t.bgCard, borderRadius: 16, padding: '14px 16px', border: `1px solid ${t.border}` }}>
          <Trophy size={16} color={t.pink} style={{ marginBottom: 6 }} />
          <div className="fd" style={{ fontSize: 28, fontWeight: 800, color: t.text, lineHeight: 1 }}>{totalDone}</div>
          <div style={{ color: t.textSoft, fontSize: 12, marginTop: 3 }}>дууссан шат</div>
        </div>
      </div>

      {/* Daily Practice */}
      <button onClick={() => !isDoneToday && setTab('daily')} className={isDoneToday ? '' : 'au'}
        style={{
          width: '100%', border: 'none', borderRadius: 16, padding: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: isDoneToday ? 'default' : 'pointer', marginBottom: 10,
          background: isDoneToday ? t.bgTag : t.pinkBtn,
          opacity: isDoneToday ? 0.7 : 1,
        }}>
        <span style={{ fontSize: 18 }}>📅</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: isDoneToday ? t.textMid : t.pinkBtnText }}>Өдөр тутмын дасгал</div>
          <div style={{ fontSize: 12, color: isDoneToday ? t.textSoft : t.pinkBtnText, opacity: 0.75 }}>
            {isDoneToday ? 'Өнөөдөр дууссан ✓' : '8 төрлийн тоглоом'}
          </div>
        </div>
        {isDoneToday
          ? <Check size={18} color={t.textSoft} style={{ marginLeft: 'auto' }} />
          : <ChevronRight size={18} color={t.pinkBtnText} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
      </button>

      {/* SRS Review */}
      {state.learnedWords.length > 0 && (
        <button onClick={() => setTab('review')} className="au"
          style={{
            width: '100%', borderRadius: 16, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20,
            background: t.bgCard, border: `2px solid ${due > 0 ? t.pink : t.border}`,
          }}>
          <RefreshCw size={18} color={due > 0 ? t.pink : t.textSoft} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: due > 0 ? t.pink : t.textMid }}>
              Сурсан үгс давтах
              {due > 0 && <span style={{ marginLeft: 6, background: t.pinkBtn, color: t.pinkBtnText, borderRadius: 20, padding: '1px 8px', fontSize: 12, fontWeight: 800 }}>{due}</span>}
            </span>
            {due === 0 && nextLbl && (
              <div style={{ color: t.textSoft, fontSize: 11, marginTop: 1 }}>Дараагийн давталт: {nextLbl}</div>
            )}
          </div>
          <ChevronRight size={16} color={t.textSoft} />
        </button>
      )}

      {/* Word of the Day */}
      <div style={{ background: t.skyBg, borderRadius: 20, padding: '16px 18px', marginBottom: 20, border: `1px solid ${t.sky}30` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ color: t.sky, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em' }}>Өнөөдрийн үг 📚</div>
          <div style={{ color: t.sky, fontSize: 11, opacity: 0.75 }}>
            {new Date().toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 38, lineHeight: 1, flexShrink: 0 }}>{wod.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
              {wod.gender && <span style={{ color: t.sky, fontWeight: 800, fontSize: 15 }}>{wod.gender}</span>}
              <span className="fd" style={{ fontWeight: 800, color: t.darkMode ? t.text : '#003355', fontSize: 22 }}>{wod.de}</span>
              <PlayButton wordId={wod.id} size={18} color={t.sky} />
            </div>
            <div style={{ color: t.darkMode ? t.textMid : '#005580', fontSize: 14, fontWeight: 600 }}>{wod.mn}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 800, background: wodM.pill, color: wodM.pillTxt, padding: '2px 8px', borderRadius: 10 }}>{wod.level}</span>
              <span style={{ fontSize: 11, fontWeight: 600, background: 'rgba(0,98,161,0.12)', color: t.sky, padding: '2px 8px', borderRadius: 10 }}>{TYPE_LABEL[wod.type] || wod.type}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(0,98,161,0.08)', borderRadius: 12 }}>
          <div style={{ color: t.darkMode ? t.textMid : '#005580', fontSize: 13, fontStyle: 'italic', lineHeight: 1.5 }}>{wod.example}</div>
        </div>
      </div>

      {/* Quick Tools */}
      <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 12 }}>ДАСГАЛУУД</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {QUICK_TOOLS.map((tool, i) => (
          <button key={tool.tab} onClick={() => setTab(tool.tab)} className="au"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', animationDelay: `${i * 60}ms` }}>
            <div style={{ width: 58, height: 58, borderRadius: 18, background: tool.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tool.iconColor, boxShadow: t.shadow }}>
              {tool.icon}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: t.textMid, textAlign: 'center', lineHeight: 1.2 }}>{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Pro upgrade banner — only for free users */}
      {plan !== 'pro' && (
        <button onClick={onUpgrade} className="au" style={{
          width: '100%', border: `1.5px solid #e6b800`, borderRadius: 18, padding: '16px 18px',
          background: 'linear-gradient(135deg, #fff8d4 0%, #fff3b0 100%)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 4px 18px rgba(201,160,0,0.18)', marginBottom: 8,
        }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: '#ffcc00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 10px rgba(201,160,0,0.35)' }}>
            <Crown size={22} color="#241a00" strokeWidth={2} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#4a3800' }}>Pro эрхтэй болох</div>
            <div style={{ fontSize: 12, color: '#745b00', marginTop: 2 }}>Сарын 12,900₮-оос · Бүх үйлдэлүүд нээлттэй</div>
          </div>
          <ChevronRight size={18} color="#745b00" />
        </button>
      )}
    </div>
  );
}
