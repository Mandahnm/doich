'use client';

import { useState, useEffect } from 'react';
import { Settings, ArrowLeft, LogOut, Lock, Eye, EyeOff, Trash2, Flame, BookOpen, Trophy, Calendar, FileText, Shield, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LEVELS } from '@/lib/vocab';
import { getLevelInfo } from '@/lib/xp';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { WithSkeleton, ProfileSkeleton } from '@/components/shared/ScreenSkeleton';

const MN_MONTHS = ['1-р', '2-р', '3-р', '4-р', '5-р', '6-р', '7-р', '8-р', '9-р', '10-р', '11-р', '12-р'];

function formatJoinDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${d.getFullYear()} оны ${MN_MONTHS[d.getMonth()]} сард нэгдсэн`;
}

function fmtDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function daysLeft(isoStr) {
  if (!isoStr) return null;
  const ms = new Date(isoStr) - new Date();
  return ms > 0 ? Math.ceil(ms / 86400000) : 0;
}

function pct(correct, total) {
  return total > 0 ? Math.round(correct / total * 100) : 0;
}

export default function ProfileScreen({ t, state, update, user, onLogout, setTab, plan, proInfo }) {
  return <WithSkeleton ms={250} skeleton={<ProfileSkeleton t={t} />}><ProfileScreenInner t={t} state={state} update={update} user={user} onLogout={onLogout} setTab={setTab} plan={plan} proInfo={proInfo} /></WithSkeleton>;
}

function ProfileScreenInner({ t, state, update, user, onLogout, setTab, plan, proInfo }) {
  const [showSettings, setShowSettings] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [newPw,        setNewPw]        = useState('');
  const [confirmPw,    setConfirmPw]    = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [pwErr,        setPwErr]        = useState('');
  const [pwMsg,        setPwMsg]        = useState('');
  const [pwLoading,    setPwLoading]    = useState(false);
  const [isDesktop,    setIsDesktop]    = useState(false);
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [deletePw,      setDeletePw]      = useState('');
  const [deleteErr,     setDeleteErr]     = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const totalDone = Object.keys(state.completedStages || {}).length;
  const { level, xpInLevel, xpToNext, progress } = getLevelInfo(state.xp || 0);
  const unlockedIds = new Set(ACHIEVEMENTS.filter(a => a.check(state)).map(a => a.id));
  const mid    = t.textMid;
  const border = t.border;

  const initial = state.userName ? state.userName[0].toUpperCase()
                : user?.email   ? user.email[0].toUpperCase()
                : '?';

  const handleChangePassword = async () => {
    setPwErr(''); setPwMsg('');
    if (newPw.length < 6)    { setPwErr('Хамгийн багадаа 6 тэмдэгт'); return; }
    if (newPw !== confirmPw) { setPwErr('Нууц үгнүүд таарахгүй байна'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) { setPwErr(error.message); return; }
    setPwMsg('Нууц үг амжилттай шинэчлэгдлээ!');
    setNewPw(''); setConfirmPw(''); setChangePwOpen(false);
  };

  const handleDeleteAccount = async () => {
    setDeleteErr('');
    if (!deletePw) { setDeleteErr('Нууц үгээ оруулна уу'); return; }
    setDeleteLoading(true);
    // Re-authenticate to verify password
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: deletePw,
    });
    if (authErr) {
      setDeleteLoading(false);
      setDeleteErr('Нууц үг буруу байна');
      return;
    }
    if (user) await supabase.from('user_progress').delete().eq('id', user.id);
    await supabase.auth.signOut();
    setDeleteLoading(false);
  };

  // ── Settings sub-view ────────────────────────────────────────────────────
  if (showSettings) {
    const STAT_KEYS = [
      { e: '🎯', l: 'Үг таах',     v: `${state.stats.flashcardsCorrect}/${state.stats.flashcardsTotal}` },
      { e: '🏷️', l: 'Артикль',     v: `${state.stats.genderCorrect}/${state.stats.genderTotal}` },
      { e: '💖', l: 'Сурсан үг',   v: state.learnedWords.length },
      { e: '🏆', l: 'Дууссан шат', v: Object.keys(state.completedStages || {}).length },
    ];

    const sLevelSection = (
      <div style={{ background: t.bgCard, borderRadius: 20, padding: 16, boxShadow: t.shadow }}>
        <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>Миний түвшин</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
          {LEVELS.map(l => {
            const a = state.userLevel === l;
            return (
              <button key={l} onClick={() => update({ userLevel: l })}
                style={{ padding: '12px 0', borderRadius: 14, border: `2px solid ${a ? t.pink : border}`, background: a ? t.pinkBg : t.bgTag, color: a ? t.pink : mid, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                {l}
              </button>
            );
          })}
        </div>
      </div>
    );

    const sStatsSection = (
      <div style={{ background: t.bgCard, borderRadius: 20, padding: 16, boxShadow: t.shadow }}>
        <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>Статистик</div>
        {STAT_KEYS.map(s => (
          <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.bgTag, borderRadius: 12, padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: mid, fontWeight: 600, fontSize: 14 }}>
              <span>{s.e}</span>{s.l}
            </div>
            <div style={{ fontWeight: 800, color: t.text, fontSize: 14 }}>{s.v}</div>
          </div>
        ))}
      </div>
    );

    const sUserSection = user && (
      <div style={{ background: t.bgCard, borderRadius: 20, padding: '14px 16px', boxShadow: t.shadow, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 19, background: t.pinkBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontWeight: 800, color: t.pink, fontSize: 16 }}>{initial}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>НЭВТЭРСЭН ХЭРЭГЛЭГЧ</div>
          <div style={{ color: t.text, fontSize: 13, fontWeight: 700, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
        </div>
      </div>
    );

    const sPasswordSection = user && (
      <div style={{ background: t.bgCard, borderRadius: 20, padding: 16, boxShadow: t.shadow }}>
        <button onClick={() => { setChangePwOpen(o => !o); setPwErr(''); setPwMsg(''); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: 0 }}>
          <Lock size={16} color={t.pink} />
          <div style={{ flex: 1, textAlign: 'left', fontWeight: 800, color: t.text, fontSize: 14 }}>Нууц үг солих</div>
          <span style={{ color: mid, fontSize: 18 }}>{changePwOpen ? '▲' : '▼'}</span>
        </button>
        {changePwOpen && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ color: mid, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>ШИНЭ НУУЦ ҮГ</label>
              <div style={{ position: 'relative' }}>
                <input value={newPw} onChange={e => setNewPw(e.target.value)}
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  style={{ width: '100%', boxSizing: 'border-box', background: t.bgTag, border: `1.5px solid ${border}`, borderRadius: 12, padding: '10px 40px 10px 12px', fontSize: 14, color: t.text, outline: 'none' }} />
                <button onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  {showPw ? <EyeOff size={15} color={mid} /> : <Eye size={15} color={mid} />}
                </button>
              </div>
              <div style={{ color: mid, fontSize: 11, marginTop: 3 }}>Хамгийн багадаа 6 тэмдэгт</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: mid, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: 5 }}>НУУЦ ҮГ ДАВТАХ</label>
              <input value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                type={showPw ? 'text' : 'password'} placeholder="••••••••"
                style={{ width: '100%', boxSizing: 'border-box', background: t.bgTag, border: `1.5px solid ${border}`, borderRadius: 12, padding: '10px 12px', fontSize: 14, color: t.text, outline: 'none' }} />
            </div>
            {pwErr && <div style={{ color: t.wrong, fontSize: 12, fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>{pwErr}</div>}
            {pwMsg && <div style={{ color: t.correct, fontSize: 12, fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>{pwMsg}</div>}
            <button onClick={handleChangePassword} disabled={pwLoading}
              style={{ width: '100%', padding: '12px', borderRadius: 14, border: 'none', cursor: pwLoading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 14, background: t.pinkBtn, color: t.pinkBtnText, opacity: pwLoading ? 0.7 : 1 }}>
              {pwLoading ? '...' : 'Хадгалах'}
            </button>
          </div>
        )}
      </div>
    );

    const sLegalSection = (
      <div style={{ background: t.bgCard, borderRadius: 20, padding: '6px 8px', boxShadow: t.shadow }}>
        {[
          { href: '/terms',   Icon: FileText, label: 'Үйлчилгээний нөхцөл' },
          { href: '/privacy', Icon: Shield,   label: 'Нууцлалын бодлого' },
        ].map(({ href, Icon, label }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', textDecoration: 'none', borderRadius: 14 }}>
            <Icon size={16} color={t.textMid} />
            <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: t.text }}>{label}</span>
            <span style={{ color: t.textSoft, fontSize: 16 }}>›</span>
          </a>
        ))}
      </div>
    );

    const sDangerSection = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {onLogout && (
          signOutConfirm ? (
            <div style={{ background: t.bgCard, border: `2px solid ${border}`, borderRadius: 16, padding: '14px 16px', boxShadow: t.shadow }}>
              <div style={{ color: t.text, fontWeight: 700, fontSize: 14, textAlign: 'center', marginBottom: 12 }}>Та гарахдаа итгэлтэй байна уу?</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button onClick={() => setSignOutConfirm(false)}
                  style={{ padding: '10px', borderRadius: 12, border: `1.5px solid ${border}`, background: t.bgTag, color: mid, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Үгүй
                </button>
                <button onClick={onLogout}
                  style={{ padding: '10px', borderRadius: 12, border: 'none', background: t.pinkBtn, color: t.pinkBtnText, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                  Тийм, гарах
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setSignOutConfirm(true)}
              style={{ width: '100%', padding: '13px', borderRadius: 16, background: t.bgCard, border: `2px solid ${border}`, color: mid, fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: t.shadow }}>
              <LogOut size={16} /> Гарах (Sign out)
            </button>
          )
        )}
        {user && (
          <div style={{ background: '#FFF5F5', border: '2px solid #FEB2B2', borderRadius: 18, overflow: 'hidden', boxShadow: t.shadow }}>
            <button onClick={() => { setDeleteOpen(o => !o); setDeleteErr(''); setDeletePw(''); }}
              style={{ width: '100%', padding: '13px', background: 'none', border: 'none', color: '#C53030', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Trash2 size={16} /> Бүртгэл устгах
            </button>
            {deleteOpen && (
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ background: '#FFF0F0', border: '1.5px solid #FEB2B2', borderRadius: 14, padding: '14px', marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#C53030', marginBottom: 8, textAlign: 'center' }}>⚠️ Та итгэлтэй байна уу?</div>
                  <div style={{ color: '#9B2C2C', fontSize: 13, marginBottom: 10 }}>Бүртгэл устгасан тохиолдолд дараах бүх зүйл үүрд устах болно:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {[
                      `📚 Сурсан үгс (${state.learnedWords.length} үг)`,
                      `⭐ XP оноо (${state.xp || 0} XP)`,
                      `🔥 Streak (${state.streak || 0} өдөр)`,
                      '🏆 Бүх амжилт, дууссан шатууд',
                    ].map(item => (
                      <div key={item} style={{ fontSize: 13, color: '#9B2C2C' }}>{item}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#C53030', fontWeight: 700, textAlign: 'center' }}>Энэ үйлдлийг буцааж болохгүй.</div>
                </div>
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <input type="password" value={deletePw} onChange={e => setDeletePw(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleDeleteAccount()}
                    placeholder="Нууц үгээ оруулна уу"
                    style={{ width: '100%', boxSizing: 'border-box', background: t.bgCard, border: `1.5px solid ${deleteErr ? '#C53030' : border}`, borderRadius: 12, padding: '10px 14px', fontSize: 14, color: t.text, outline: 'none' }} />
                </div>
                {deleteErr && <div style={{ color: '#C53030', fontSize: 12, fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>{deleteErr}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button onClick={() => { setDeleteOpen(false); setDeletePw(''); setDeleteErr(''); }}
                    style={{ padding: '11px', borderRadius: 12, border: `1.5px solid ${border}`, background: t.bgCard, color: t.textMid, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    Цуцлах
                  </button>
                  <button onClick={handleDeleteAccount} disabled={deleteLoading}
                    style={{ padding: '11px', borderRadius: 12, border: 'none', background: '#C53030', color: '#fff', fontWeight: 800, fontSize: 13, cursor: deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteLoading ? 0.7 : 1 }}>
                    {deleteLoading ? '...' : 'Устгах'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );

    return (
      <div className="af" style={{ maxWidth: isDesktop ? 860 : '100%', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => { setShowSettings(false); setChangePwOpen(false); setPwErr(''); setPwMsg(''); setSignOutConfirm(false); }}
            style={{ background: t.bgTag, border: 'none', borderRadius: 12, padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} color={t.text} />
          </button>
          <div>
            <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 2 }}>ТОХИРГОО</div>
            <div className="fd" style={{ fontSize: 22, fontWeight: 800, color: t.text, lineHeight: 1 }}>Settings</div>
          </div>
        </div>

        {isDesktop ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {sLevelSection}
              {sStatsSection}
              {sUserSection}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {sPasswordSection}
              {sLegalSection}
              {sDangerSection}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sLevelSection}
            {sUserSection}
            {sPasswordSection}
            {sLegalSection}
            {sDangerSection}
          </div>
        )}
      </div>
    );
  }

  // ── Shared data ───────────────────────────────────────────────────────────
  const STAT_CARDS = [
    { Icon: Flame,    bg: '#ffdad4', ic: '#bc0000', l: 'Streak',        v: state.streak || 0 },
    { Icon: BookOpen, bg: '#dceeff', ic: '#0062a1', l: 'Сурсан үг',     v: state.learnedWords.length },
    { Icon: Trophy,   bg: '#fff8d4', ic: '#745b00', l: 'Дууссан шат',   v: totalDone },
    { Icon: Calendar, bg: '#f0eded', ic: '#80765f', l: 'Өдрийн дасгал', v: state.stats?.dailyCount || 0 },
  ];

  const ACCURACY_ROWS = [
    { l: 'Үг таах',   pct: pct(state.stats.flashcardsCorrect, state.stats.flashcardsTotal),   color: t.pinkBtn },
    { l: 'Артикль',   pct: pct(state.stats.genderCorrect,     state.stats.genderTotal),        color: '#0062a1' },
    { l: 'Сонсох',    pct: pct(state.stats?.listeningCorrect || 0, state.stats?.listeningTotal || 0), color: '#bc0000' },
    { l: 'Өгүүлбэр', pct: pct(state.stats?.sentenceCorrect  || 0, state.stats?.sentenceTotal  || 0), color: t.pinkBtn },
  ];

  const shown = ACHIEVEMENTS.slice(0, 6);

  // ── Pro status ──────────────────────────────────────────────────────────────
  const isProUser = plan === 'pro';
  const dl = daysLeft(proInfo?.expiresAt);

  const proBadge = isProUser ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg,#FF6FA8,#A78BFA)', color: '#fff', fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
      <Crown size={12} /> Pro
    </span>
  ) : null;

  const proCard = isProUser ? (
    <div style={{ borderRadius: 20, padding: '18px 20px', marginBottom: 14, background: 'linear-gradient(135deg, rgba(255,111,168,0.12), rgba(167,139,250,0.12))', border: '1.5px solid rgba(167,139,250,0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#FF6FA8,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Crown size={22} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: t.text }}>Doich Pro</div>
          <div style={{ color: '#A78BFA', fontSize: 12, fontWeight: 700 }}>
            Идэвхтэй{dl != null ? ` · ${dl} өдөр үлдсэн` : ''}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, background: t.bgCard, borderRadius: 12, padding: '10px 12px' }}>
          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 4 }}>ХУДАЛДАН АВСАН</div>
          <div style={{ color: t.text, fontSize: 14, fontWeight: 800 }}>{fmtDate(proInfo?.purchasedAt)}</div>
        </div>
        <div style={{ flex: 1, background: t.bgCard, borderRadius: 12, padding: '10px 12px' }}>
          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 4 }}>ДУУСАХ</div>
          <div style={{ color: t.text, fontSize: 14, fontWeight: 800 }}>{fmtDate(proInfo?.expiresAt)}</div>
        </div>
      </div>
    </div>
  ) : null;

  // ── DESKTOP layout ────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div>
        {/* Page title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: t.text, margin: 0 }}>Профайл</h1>
          <button onClick={() => setShowSettings(true)}
            style={{ background: t.bgCard, border: `1px solid ${border}`, borderRadius: 12, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Settings size={16} color={mid} />
            <span style={{ fontSize: 13, fontWeight: 600, color: mid }}>Тохиргоо</span>
          </button>
        </div>

        {/* Row 1: User info + stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 16 }}>

          {/* Left: user card + level card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {proCard}
            {/* User card */}
            <div style={{ background: t.bgCard, borderRadius: 20, padding: '20px 22px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 68, height: 68, borderRadius: 34, background: t.pinkBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(255,204,0,0.3)' }}>
                <span style={{ color: t.pinkBtnText, fontWeight: 900, fontSize: 26 }}>{initial}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: t.text, marginBottom: 2 }}>
                  {state.userName || user?.email || ''}
                </div>
                {state.userName && (
                  <div style={{ color: mid, fontSize: 13, marginBottom: 6 }}>{user?.email}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {proBadge}
                  {user?.created_at && (
                    <span style={{ color: t.textSoft, fontSize: 12 }}>{formatJoinDate(user.created_at)}</span>
                  )}
                  {state.userLevel && (
                    <span style={{ background: '#dceeff', color: '#0062a1', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                      {state.userLevel} түвшин
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 4 }}>CEFR</div>
                {state.userLevel && (
                  <span style={{ background: '#dceeff', color: '#0062a1', fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                    {state.userLevel}
                  </span>
                )}
              </div>
            </div>

            {/* Current level card */}
            <div style={{ background: t.bgCard, borderRadius: 20, padding: '18px 22px', border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 4 }}>ТҮВШИН</div>
                  <div className="fd" style={{ fontSize: 20, fontWeight: 800, color: t.pink }}>Түвшин {level}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trophy size={18} color={t.pink} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{xpInLevel.toLocaleString()} / {xpToNext.toLocaleString()} XP</span>
                </div>
              </div>
              <div style={{ height: 10, background: t.bgTag, borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress * 100}%`, background: t.pinkBtn, borderRadius: 5, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          </div>

          {/* Right: 2×2 stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {STAT_CARDS.map(({ Icon, bg, ic, l, v }) => (
              <div key={l} style={{ background: t.bgCard, borderRadius: 18, padding: '18px 16px', border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={ic} />
                </div>
                <div className="fd" style={{ fontSize: 26, fontWeight: 800, color: t.text, lineHeight: 1 }}>{v}</div>
                <div style={{ color: mid, fontSize: 12, textAlign: 'center' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Achievements + Accuracy */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>

          {/* Achievements */}
          <div style={{ background: t.bgCard, borderRadius: 20, padding: '18px 20px', border: `1px solid ${border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, color: t.text, fontSize: 16 }}>Амжилтууд</div>
              <button onClick={() => setTab('achievements')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.pink, fontSize: 13, fontWeight: 700 }}>
                Бүгдийг харах →
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {shown.map(a => {
                const unlocked = unlockedIds.has(a.id);
                return (
                  <div key={a.id} style={{
                    aspectRatio: '1', borderRadius: 16,
                    background: unlocked ? (a.color || t.pinkBtn) : t.bgTag,
                    border: `1px solid ${unlocked ? 'transparent' : border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {unlocked
                      ? <span style={{ fontSize: 26 }}>{a.icon}</span>
                      : <Lock size={20} color={t.textSoft} strokeWidth={1.5} />}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 12, color: t.textSoft, fontSize: 11, textAlign: 'center' }}>
              {unlockedIds.size} / {ACHIEVEMENTS.length} нээгдсэн
            </div>
          </div>

          {/* Accuracy */}
          <div style={{ background: t.bgCard, borderRadius: 20, padding: '18px 22px', border: `1px solid ${border}` }}>
            <div style={{ fontWeight: 800, color: t.text, fontSize: 16, marginBottom: 18 }}>Статистик</div>
            {/* Top 2 rows full-width */}
            {ACCURACY_ROWS.slice(0, 2).map(({ l, pct: p, color }) => (
              <div key={l} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: mid }}>{l}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: t.text }}>{p}%</span>
                </div>
                <div style={{ height: 7, background: t.bgTag, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
            {/* Bottom 2 side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {ACCURACY_ROWS.slice(2).map(({ l, pct: p, color }) => (
                <div key={l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: mid }}>{l}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: t.text }}>{p}%</span>
                  </div>
                  <div style={{ height: 7, background: t.bgTag, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="af" style={{ paddingBottom: 8 }}>

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div style={{ background: t.bgCard, borderRadius: 24, padding: '24px 20px 20px', marginBottom: 14, border: `1px solid ${border}`, position: 'relative' }}>
        {/* Settings icon */}
        <button onClick={() => setShowSettings(true)}
          style={{ position: 'absolute', top: 16, right: 16, background: t.bgTag, border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}>
          <Settings size={18} color={mid} />
        </button>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: t.pinkBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px rgba(255,204,0,0.35)` }}>
            <span style={{ color: t.pinkBtnText, fontWeight: 900, fontSize: 32 }}>{initial}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: t.text, marginBottom: 2 }}>
              {state.userName || user?.email || ''}
            </div>
            {state.userName && (
              <div style={{ color: mid, fontSize: 13, marginBottom: 8 }}>{user?.email}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              {proBadge}
              {user?.created_at && (
                <span style={{ color: t.textSoft, fontSize: 12 }}>{formatJoinDate(user.created_at)}</span>
              )}
              {state.userLevel && (
                <span style={{ background: '#dceeff', color: '#0062a1', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                  {state.userLevel} түвшин
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {proCard}

      {/* ── Current level card ────────────────────────────────────────────── */}
      <div style={{ background: t.bgCard, borderRadius: 20, padding: '16px 18px', marginBottom: 14, border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 4 }}>ТҮВШИН</div>
            <div className="fd" style={{ fontSize: 22, fontWeight: 800, color: t.pink }}>Түвшин {level}</div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={18} color={t.pink} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{xpInLevel.toLocaleString()} / {xpToNext.toLocaleString()} XP</div>
            </div>
          </div>
        </div>
        <div style={{ height: 10, background: t.bgTag, borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: t.pinkBtn, borderRadius: 5, transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* ── Stats grid 2×2 ────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {STAT_CARDS.map(({ Icon, bg, ic, l, v }) => (
          <div key={l} style={{ background: t.bgCard, borderRadius: 18, padding: '16px', border: `1px solid ${border}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon size={20} color={ic} />
            </div>
            <div className="fd" style={{ fontSize: 28, fontWeight: 800, color: t.text, lineHeight: 1 }}>{v}</div>
            <div style={{ color: mid, fontSize: 12, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── Achievements ──────────────────────────────────────────────────── */}
      <div style={{ background: t.bgCard, borderRadius: 20, padding: '16px 18px', marginBottom: 14, border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 800, color: t.text, fontSize: 16 }}>Амжилтууд</div>
          <button onClick={() => setTab('achievements')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.pink, fontSize: 13, fontWeight: 700 }}>
            Бүгдийг харах →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {shown.map(a => {
            const unlocked = unlockedIds.has(a.id);
            return (
              <div key={a.id} style={{
                aspectRatio: '1',
                borderRadius: 16,
                background: unlocked ? a.color || t.pinkBtn : t.bgTag,
                border: `1px solid ${unlocked ? 'transparent' : border}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {unlocked ? (
                  <span style={{ fontSize: 28 }}>{a.icon}</span>
                ) : (
                  <Lock size={22} color={t.textSoft} strokeWidth={1.5} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, color: t.textSoft, fontSize: 11, textAlign: 'center' }}>
          {unlockedIds.size} / {ACHIEVEMENTS.length} нээгдсэн
        </div>
      </div>

      {/* ── Accuracy ─────────────────────────────────────────────────────── */}
      <div style={{ background: t.bgCard, borderRadius: 20, padding: '16px 18px', marginBottom: 8, border: `1px solid ${border}` }}>
        <div style={{ fontWeight: 800, color: t.text, fontSize: 16, marginBottom: 16 }}>Статистик</div>
        {ACCURACY_ROWS.map(({ l, pct: p, color }) => (
          <div key={l} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: mid }}>{l}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: t.text }}>{p}%</span>
            </div>
            <div style={{ height: 7, background: t.bgTag, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${p}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
