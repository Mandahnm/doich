'use client';

import { useState } from 'react';
import { Settings, ArrowLeft, LogOut, Lock, Eye, EyeOff, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LEVELS } from '@/lib/vocab';
import { getLevelInfo } from '@/lib/xp';
import { ACHIEVEMENTS } from '@/lib/achievements';

const MN_MONTHS = ['1-р', '2-р', '3-р', '4-р', '5-р', '6-р', '7-р', '8-р', '9-р', '10-р', '11-р', '12-р'];

function formatJoinDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${d.getFullYear()} оны ${MN_MONTHS[d.getMonth()]} сард нэгдсэн`;
}

function getInitial(email) {
  return email ? email[0].toUpperCase() : '?';
}

export default function ProfileScreen({ t, state, update, user, onLogout, setTab }) {
  const [showSettings, setShowSettings] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [newPw,        setNewPw]        = useState('');
  const [confirmPw,    setConfirmPw]    = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [pwErr,        setPwErr]        = useState('');
  const [pwMsg,        setPwMsg]        = useState('');
  const [pwLoading,    setPwLoading]    = useState(false);

  const totalDone            = Object.keys(state.completedStages || {}).length;
  const { level, xpInLevel, xpToNext, progress } = getLevelInfo(state.xp || 0);
  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(state));
  const mid    = t.textMid;
  const border = t.border;

  const handleChangePassword = async () => {
    setPwErr(''); setPwMsg('');
    if (newPw.length < 6)      { setPwErr('Хамгийн багадаа 6 тэмдэгт'); return; }
    if (newPw !== confirmPw)   { setPwErr('Нууц үгнүүд таарахгүй байна'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) { setPwErr(error.message); return; }
    setPwMsg('Нууц үг амжилттай шинэчлэгдлээ!');
    setNewPw(''); setConfirmPw(''); setChangePwOpen(false);
  };

  const handleReset = () => {
    if (confirm('Бүх өгөгдлийг устгах уу?')) {
      update({
        userLevel: null, learnedWords: [], completedStages: {}, mistakes: {},
        stats: { flashcardsCorrect: 0, flashcardsTotal: 0, genderCorrect: 0, genderTotal: 0 },
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Бүртгэл болон бүх өгөгдлийг устгах уу?\n\nЭнэ үйлдлийг буцааж болохгүй.')) return;
    if (user) await supabase.from('user_progress').delete().eq('id', user.id);
    await supabase.auth.signOut();
  };

  // ── Settings sub-view ────────────────────────────────────────────────────
  if (showSettings) {
    return (
      <div className="af">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => { setShowSettings(false); setChangePwOpen(false); setPwErr(''); setPwMsg(''); }}
            style={{ background: t.bgTag, border: 'none', borderRadius: 12, padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} color={t.text} />
          </button>
          <div className="fd" style={{ fontSize: 22, fontWeight: 800, color: t.text }}>Тохиргоо</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Dark mode */}
          <div style={{ background: t.bgCard, borderRadius: 20, padding: 16, boxShadow: t.shadow }}>
            <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>Өдрийн / харанхуй горим</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[{ d: false, label: '☀️ Цагаан' }, { d: true, label: '🌙 Харанхуй' }].map(o => (
                <button key={String(o.d)} onClick={() => update({ darkMode: o.d })}
                  style={{ padding: '12px', borderRadius: 14, border: `2px solid ${state.darkMode === o.d ? t.pink : border}`, background: state.darkMode === o.d ? t.pinkBg : t.bgTag, color: state.darkMode === o.d ? t.pink : mid, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* CEFR level */}
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

          {/* Change password */}
          {user && (
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
                  {pwErr && <div style={{ color: '#FF6B6B', fontSize: 12, fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>{pwErr}</div>}
                  {pwMsg && <div style={{ color: '#34D399', fontSize: 12, fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>{pwMsg}</div>}
                  <button onClick={handleChangePassword} disabled={pwLoading}
                    style={{ width: '100%', padding: '12px', borderRadius: 14, border: 'none', cursor: pwLoading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 14, background: t.pinkBtn, color: t.pinkBtnText, opacity: pwLoading ? 0.7 : 1 }}>
                    {pwLoading ? '...' : 'Хадгалах'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reset data */}
          <button onClick={handleReset}
            style={{ width: '100%', padding: '14px', borderRadius: 18, background: t.bgCard, border: `2px solid ${t.darkMode ? '#4A1F25' : '#FFD0D5'}`, color: '#E53E4D', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: t.shadow }}>
            <LogOut size={16} /> Бүх өгөгдлийг устгах
          </button>

          {/* Sign out */}
          {onLogout && (
            <button onClick={() => { if (confirm('Гарах уу?')) onLogout(); }}
              style={{ width: '100%', padding: '14px', borderRadius: 18, background: t.bgCard, border: `2px solid ${border}`, color: mid, fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: t.shadow }}>
              <LogOut size={16} /> Гарах (Sign out)
            </button>
          )}

          {/* Delete account */}
          {user && (
            <button onClick={handleDeleteAccount}
              style={{ width: '100%', padding: '14px', borderRadius: 18, background: t.darkMode ? '#1A0A0A' : '#FFF5F5', border: `2px solid ${t.darkMode ? '#5A1A1A' : '#FEB2B2'}`, color: '#C53030', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: t.shadow }}>
              <Trash2 size={16} /> Бүртгэл устгах
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Profile main view ────────────────────────────────────────────────────
  const STAT_CARDS = [
    { e: '🔥', l: 'Streak',        v: state.streak || 0 },
    { e: '💖', l: 'Сурсан үг',     v: state.learnedWords.length },
    { e: '🏆', l: 'Дууссан шат',   v: totalDone },
    { e: '📅', l: 'Өдрийн дасгал', v: state.stats?.dailyCount || 0 },
  ];

  const ACCURACY_ROWS = [
    { e: '🎯', l: 'Үг таах',   v: `${state.stats.flashcardsCorrect}/${state.stats.flashcardsTotal}` },
    { e: '🏷️', l: 'Артикль',   v: `${state.stats.genderCorrect}/${state.stats.genderTotal}` },
    { e: '🎧', l: 'Сонсох',    v: `${state.stats?.listeningCorrect || 0}/${state.stats?.listeningTotal || 0}` },
    { e: '✍️', l: 'Өгүүлбэр', v: `${state.stats?.sentenceCorrect || 0}/${state.stats?.sentenceTotal || 0}` },
  ];

  return (
    <div className="af">
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 4 }}>ПРОФАЙЛ</div>
          <div className="fd" style={{ fontSize: 28, fontWeight: 800, color: t.text }}>Миний хуудас</div>
        </div>
        <button onClick={() => setShowSettings(true)}
          style={{ background: t.bgCard, border: `1px solid ${border}`, borderRadius: 14, padding: '10px', cursor: 'pointer', boxShadow: t.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
          <Settings size={20} color={mid} />
        </button>
      </div>

      {/* Avatar + user info */}
      <div style={{ background: t.bgCard, borderRadius: 24, padding: '20px 18px', marginBottom: 16, boxShadow: t.shadow, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: 'linear-gradient(135deg,#FF6FA8,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 26 }}>{getInitial(user?.email)}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: t.text, fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          {state.userLevel && (
            <div style={{ color: mid, fontSize: 12, marginTop: 3 }}>Герман · {state.userLevel} түвшин</div>
          )}
          {user?.created_at && (
            <div style={{ color: t.textSoft, fontSize: 11, marginTop: 3 }}>{formatJoinDate(user.created_at)}</div>
          )}
        </div>
      </div>

      {/* Level + XP bar */}
      <div style={{ background: t.bgCard, borderRadius: 20, padding: '16px 18px', marginBottom: 16, boxShadow: t.shadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 2 }}>ТҮВШИН</div>
            <div className="fd" style={{ fontSize: 40, fontWeight: 800, color: t.pink, lineHeight: 1 }}>{level}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', marginBottom: 2 }}>НИЙТ XP</div>
            <div className="fd" style={{ fontSize: 24, fontWeight: 800, color: t.text }}>{(state.xp || 0).toLocaleString()}</div>
          </div>
        </div>
        <div style={{ height: 10, background: t.bgTag, borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: 'linear-gradient(90deg,#FF6FA8,#A78BFA)', borderRadius: 5, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: mid, fontSize: 11 }}>
          <span>{xpInLevel} XP</span>
          <span>дараагийн түвшинд {xpToNext - xpInLevel} XP дутна</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {STAT_CARDS.map(s => (
          <div key={s.l} style={{ background: t.bgCard, borderRadius: 18, padding: '14px 16px', boxShadow: t.shadow }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.e}</div>
            <div className="fd" style={{ fontSize: 28, fontWeight: 800, color: t.text, lineHeight: 1 }}>{s.v}</div>
            <div style={{ color: mid, fontSize: 11, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      {unlockedAchievements.length > 0 && (
        <div style={{ background: t.bgCard, borderRadius: 20, padding: '16px 18px', marginBottom: 16, boxShadow: t.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 800, color: t.text, fontSize: 15 }}>Амжилтууд 🏅</div>
            <button onClick={() => setTab('achievements')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.pink, fontSize: 12, fontWeight: 800 }}>
              Бүгдийг харах →
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {unlockedAchievements.slice(0, 6).map(a => (
              <div key={a.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 56 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F59E0B22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {a.icon}
                </div>
                <div style={{ color: mid, fontSize: 9, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{a.title}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, color: t.textSoft, fontSize: 11 }}>
            {unlockedAchievements.length} / {ACHIEVEMENTS.length} нээгдсэн
          </div>
        </div>
      )}

      {/* Accuracy stats */}
      <div style={{ background: t.bgCard, borderRadius: 20, padding: '16px 18px', marginBottom: 16, boxShadow: t.shadow }}>
        <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>Статистик 📊</div>
        {ACCURACY_ROWS.map(s => (
          <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.bgTag, borderRadius: 12, padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: mid, fontWeight: 600, fontSize: 14 }}>
              <span>{s.e}</span>{s.l}
            </div>
            <div style={{ fontWeight: 800, color: t.text, fontSize: 14 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
