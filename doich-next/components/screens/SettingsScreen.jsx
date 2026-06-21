'use client';

import { useState, useEffect } from 'react';
import { LogOut, User, Lock, Eye, EyeOff, Trash2, ChevronLeft, FileText, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LEVELS } from '@/lib/vocab';

export default function SettingsScreen({ t, state, update, user, onLogout, onBack }) {
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [newPw,        setNewPw]        = useState('');
  const [confirmPw,    setConfirmPw]    = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [pwErr,        setPwErr]        = useState('');
  const [pwMsg,        setPwMsg]        = useState('');
  const [pwLoading,    setPwLoading]    = useState(false);
  const [isDesktop,    setIsDesktop]    = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const totalDone = Object.keys(state.completedStages || {}).length;

  const STATS = [
    { e: '🎯', l: 'Үг таах',     v: `${state.stats.flashcardsCorrect}/${state.stats.flashcardsTotal}` },
    { e: '🏷️', l: 'Артикль',     v: `${state.stats.genderCorrect}/${state.stats.genderTotal}` },
    { e: '💖', l: 'Сурсан үг',   v: state.learnedWords.length },
    { e: '🏆', l: 'Дууссан шат', v: totalDone },
  ];

  const handleReset = () => {
    if (confirm('Бүх өгөгдлийг устгах уу?')) {
      update({
        userLevel: null, learnedWords: [], completedStages: {}, mistakes: {},
        stats: { flashcardsCorrect: 0, flashcardsTotal: 0, genderCorrect: 0, genderTotal: 0 },
      });
    }
  };

  const handleChangePassword = async () => {
    setPwErr(''); setPwMsg('');
    if (newPw.length < 6) { setPwErr('Хамгийн багадаа 6 тэмдэгт'); return; }
    if (newPw !== confirmPw) { setPwErr('Нууц үгнүүд таарахгүй байна'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) { setPwErr(error.message); return; }
    setPwMsg('Нууц үг амжилттай шинэчлэгдлээ!');
    setNewPw(''); setConfirmPw(''); setChangePwOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Бүртгэл болон бүх өгөгдлийг устгах уу?\n\nЭнэ үйлдлийг буцааж болохгүй.')) return;
    if (user) await supabase.from('user_progress').delete().eq('id', user.id);
    await supabase.auth.signOut();
  };

  const mid    = t.textMid;
  const border = t.border;

  // ── Reusable sections ────────────────────────────────────────────────────
  const levelSection = (
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

  const statsSection = (
    <div style={{ background: t.bgCard, borderRadius: 20, padding: 16, boxShadow: t.shadow }}>
      <div style={{ fontWeight: 800, color: t.text, marginBottom: 12 }}>Статистик</div>
      {STATS.map(s => (
        <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.bgTag, borderRadius: 12, padding: '10px 14px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: mid, fontWeight: 600, fontSize: 14 }}>
            <span>{s.e}</span>{s.l}
          </div>
          <div style={{ fontWeight: 800, color: t.text, fontSize: 14 }}>{s.v}</div>
        </div>
      ))}
    </div>
  );

  const userSection = user && (
    <div style={{ background: t.bgCard, borderRadius: 20, padding: '14px 16px', boxShadow: t.shadow, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: 19, background: t.pinkBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <User size={18} color={t.pink} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>НЭВТЭРСЭН ХЭРЭГЛЭГЧ</div>
        <div style={{ color: t.text, fontSize: 13, fontWeight: 700, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
      </div>
    </div>
  );

  const passwordSection = user && (
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

  const legalSection = (
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

  const dangerSection = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button onClick={handleReset}
        style={{ width: '100%', padding: '13px', borderRadius: 16, background: t.bgCard, border: '2px solid #FFD0D5', color: '#E53E4D', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: t.shadow }}>
        <LogOut size={16} /> Бүх өгөгдлийг устгах
      </button>
      {onLogout && (
        <button onClick={() => { if (confirm('Гарах уу?')) onLogout(); }}
          style={{ width: '100%', padding: '13px', borderRadius: 16, background: t.bgCard, border: `2px solid ${border}`, color: mid, fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: t.shadow }}>
          <LogOut size={16} /> Гарах (Sign out)
        </button>
      )}
      {user && (
        <button onClick={handleDeleteAccount}
          style={{ width: '100%', padding: '13px', borderRadius: 16, background: '#FFF5F5', border: '2px solid #FEB2B2', color: '#C53030', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: t.shadow }}>
          <Trash2 size={16} /> Бүртгэл устгах
        </button>
      )}
    </div>
  );

  return (
    <div className="af" style={{ maxWidth: isDesktop ? 860 : '100%', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        {onBack && (
          <button onClick={onBack}
            style={{ width: 36, height: 36, borderRadius: 18, background: t.bgCard, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <ChevronLeft size={18} color={t.textMid} />
          </button>
        )}
        <div>
          <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 2 }}>ТОХИРГОО</div>
          <div className="fd" style={{ fontSize: 24, fontWeight: 800, color: t.text, lineHeight: 1 }}>Settings</div>
        </div>
      </div>

      {isDesktop ? (
        /* ── Desktop: 2-column grid ── */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {levelSection}
            {statsSection}
            {userSection}
          </div>
          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {passwordSection}
            {legalSection}
            {dangerSection}
          </div>
        </div>
      ) : (
        /* ── Mobile: single column ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {levelSection}
          {statsSection}
          {userSection}
          {passwordSection}
          {legalSection}
          {dangerSection}
        </div>
      )}
    </div>
  );
}
