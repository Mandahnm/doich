'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, Moon, Sun, GraduationCap, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuthScreen({ isDark, onToggle }) {
  const [mode,      setMode]      = useState('signin');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [showCPw,   setShowCPw]   = useState(false);
  const [remember,  setRemember]  = useState(false);
  const [ageOk,     setAgeOk]     = useState(false);
  const [error,     setError]     = useState('');
  const [emailTaken, setEmailTaken] = useState(false);
  const [msg,       setMsg]       = useState('');
  const [loading,   setLoading]   = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Detect expired / invalid confirmation link from Supabase URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error=')) {
      setMsg('');
      setError(
        hash.includes('error_code=otp_expired')
          ? 'Имэйл баталгаажуулах холбоос хугацаа дууссан байна. Имэйл хаягаа оруулаад доорх товч дээр дараад шинэ холбоос авна уу.'
          : 'Баталгаажуулах холбоост алдаа гарлаа. Имэйл хаягаа оруулаад доорх товч дээр дараад шинэ холбоос авна уу.'
      );
      setMode('signup');
      setShowResend(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const card        = isDark ? '#1e1e1e'                : '#ffffff';
  const text        = isDark ? '#e4e2e1'                : '#1b1c1c';
  const soft        = isDark ? '#7a6e54'                : '#80765f';
  const mid         = isDark ? '#b8a98a'                : '#4e4632';
  const border      = isDark ? 'rgba(255,255,255,0.10)' : '#e2ddd6';
  const tabBg       = isDark ? '#2a2618'                : '#f0eded';
  const tabActive   = isDark ? '#2e2b20'                : '#ffffff';
  const goldBtn     = isDark ? '#c9a000'                : '#ffcc00';
  const goldBtnText = isDark ? '#1a1500'                : '#241a00';
  const goldTitle   = isDark ? '#f1c100'                : '#745b00';
  const linkColor   = isDark ? '#9ccaff'                : '#0062a1';
  const iconColor   = isDark ? '#7a6e54'                : '#a09070';
  const leftBg      = isDark ? '#1a1812'                : '#f5f0e8';

  const rootVars = {
    '--gold':             goldBtn,
    '--ring':             isDark ? 'rgba(201,160,0,0.30)' : 'rgba(255,196,0,0.32)',
    '--btn-grad':         isDark ? 'linear-gradient(135deg,#e0b81f 0%,#c9a000 100%)' : 'linear-gradient(135deg,#FFE066 0%,#FFC400 100%)',
    '--btn-text':         goldBtnText,
    '--btn-shadow':       isDark ? '0 6px 22px rgba(201,160,0,0.32)' : '0 6px 22px rgba(255,196,0,0.42)',
    '--btn-shadow-hover': isDark ? '0 12px 34px rgba(201,160,0,0.48)' : '0 12px 34px rgba(255,196,0,0.58)',
    '--grad-text':        isDark ? 'linear-gradient(120deg,#ffd84d,#e8bb2a)' : 'linear-gradient(120deg,#e0a000,#ffc400)',
  };

  const translateError = msg => {
    const m = msg || '';
    const seconds = m.match(/after (\d+) second/)?.[1];
    if (seconds) return `Аюулгүй байдлын үүднээс та ${seconds} секундын дараа дахин оролдоно уу.`;
    return m;
  };

  const switchMode = m => {
    setMode(m); setError(''); setMsg(''); setEmailTaken(false); setPassword(''); setConfirmPw(''); setAgeOk(false); setShowResend(false);
  };

  const googleSignIn = async () => {
    setError(''); setMsg('');
    const { error: e } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (e) setError(translateError(e.message));
  };

  const facebookSignIn = async () => {
    setError(''); setMsg('');
    const { error: e } = await supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: window.location.origin } });
    if (e) setError(translateError(e.message));
  };

  const resendConfirmation = async () => {
    if (!email.trim()) { setError('Имэйл хаягаа оруулна уу'); return; }
    setLoading(true);
    const { error: e } = await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: window.location.origin } });
    setLoading(false);
    if (e) { setError(translateError(e.message)); return; }
    setError('');
    setShowResend(false);
    setMsg('Баталгаажуулах холбоос дахин илгээгдлээ. Имэйлээ шалгаад холбоос дээр дарна уу.');
  };

  const submit = async () => {
    setError(''); setMsg(''); setEmailTaken(false); setShowResend(false);
    if (mode === 'reset') {
      if (!email.trim()) { setError('Имэйл хаягаа оруулна уу'); return; }
      setLoading(true);
      const { error: e } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
      setLoading(false);
      if (e) setError(translateError(e.message));
      else   setMsg('Нууц үг сэргээх холбоос имэйл рүү илгээгдлээ!');
      return;
    }
    if (!email.trim() || !password.trim()) { setError('Имэйл болон нууц үгээ оруулна уу'); return; }
    if (mode === 'signup' && password.length < 6) { setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'); return; }
    if (mode === 'signup' && password !== confirmPw) { setError('Нууц үг таарахгүй байна'); return; }
    setLoading(true);
    if (mode === 'signup') {
      const { data, error: e } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } });
      setLoading(false);
      if (e) { setError(translateError(e.message)); return; }
      if (data.user?.identities?.length === 0) { setError('Энэ имэйл хаяг өмнө нь бүртгүүлсэн байна.'); setEmailTaken(true); return; }
      if (data.session) setMsg('Амжилттай бүртгүүллээ! Нэвтэрч байна...');
      else              setMsg('Имэйл хаягт баталгаажуулах холбоос илгээгдлээ. Имэйлээ шалгаад холбоос дээр дарна уу.');
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setLoading(false);
      if (e) {
        if (e.message?.toLowerCase().includes('email not confirmed')) {
          setError('Имэйл хаягаа баталгаажуулаагүй байна. Доорх товч дээр дараад баталгаажуулах холбоосыг дахин авна уу.');
          setShowResend(true);
        } else {
          setError('Имэйл эсвэл нууц үг буруу байна');
        }
      }
    }
  };

  const inputBase = {
    width: '100%', boxSizing: 'border-box',
    background: isDark ? '#252318' : '#fafaf9',
    border: `1.5px solid ${border}`,
    borderRadius: 12, fontSize: 15, color: text, outline: 'none',
  };

  const PillTabs = () => (
    <div style={{ position: 'relative', display: 'flex', background: tabBg, borderRadius: 999, padding: 4, marginBottom: 24 }}>
      <div style={{
        position: 'absolute', top: 4, bottom: 4, left: 4, width: 'calc(50% - 4px)',
        borderRadius: 999, background: tabActive,
        boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.40)' : '0 2px 10px rgba(0,0,0,0.10)',
        transform: mode === 'signup' ? 'translateX(100%)' : 'translateX(0)',
        transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
      {[['signin', 'Нэвтрэх'], ['signup', 'Бүртгүүлэх']].map(([val, label]) => (
        <button key={val} onClick={() => switchMode(val)} className="doich-tabbtn"
          style={{ position: 'relative', zIndex: 1, flex: 1, padding: '11px 0', borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: 15, color: mode === val ? text : soft }}>
          {label}
        </button>
      ))}
    </div>
  );

  // ── Age checkbox + terms (shared) ────────────────────────────────────────
  const signupFooter = (
    <>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer', userSelect: 'none' }}>
        <input type="checkbox" checked={ageOk} onChange={e => setAgeOk(e.target.checked)}
          style={{ width: 16, height: 16, accentColor: goldBtn, cursor: 'pointer', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: mid }}>Зөвшөөрч байна</span>
      </label>
      <p style={{ textAlign: 'center', fontSize: 12, color: soft, margin: '8px 0 0', lineHeight: 1.6 }}>
        Бүртгүүлснээр та манай{' '}
        <a href="/terms"   target="_blank" rel="noopener noreferrer" style={{ color: linkColor, textDecoration: 'none', fontWeight: 600 }}>Үйлчилгээний нөхцөл</a>
        {' '}болон{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: linkColor, textDecoration: 'none', fontWeight: 600 }}>Нууцлалын бодлого</a>
        -г зөвшөөрч байна.
      </p>
    </>
  );

  // ── Mobile form ───────────────────────────────────────────────────────────
  const mobileForm = (
    <>
      {mode === 'reset' ? (
        <div className="doich-anim">
          <button onClick={() => switchMode('signin')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: mid, fontWeight: 700, fontSize: 13, marginBottom: 20, padding: 0 }}>
            <ArrowLeft size={15} /> Буцах
          </button>
          <div className="doich-display" style={{ fontWeight: 800, fontSize: 19, color: text, marginBottom: 6 }}>Нууц үг мартсан</div>
          <div style={{ color: soft, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>Имэйл хаягаа оруулна уу. Нууц үг сэргээх холбоос илгээгдэх болно.</div>
          <Field label="Цахим шуудан (Email)" mid={mid}>
            <input className="doich-input" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="email" placeholder="guten.tag@doich.mn" style={{ ...inputBase, padding: '14px 16px' }} />
          </Field>
          {error && <Feedback color="#ba1a1a" text={error} />}
          {msg   && <Feedback color="#1a6e3c" text={msg} />}
          <GoldButton loading={loading} label="Холбоос илгээх →" onClick={submit} />
        </div>
      ) : (
        <div>
          <div className="doich-anim" style={{ animationDelay: '0.02s' }}><PillTabs /></div>
          <div className="doich-anim" style={{ textAlign: 'center', marginBottom: 24, animationDelay: '0.06s' }}>
            <div className="doich-display" style={{ fontSize: 22, fontWeight: 800, color: text, marginBottom: 5 }}>Тавтай морил!</div>
            <div style={{ fontSize: 14, color: soft, lineHeight: 1.5 }}><span className="doich-grad" style={{ fontWeight: 700 }}>Герман</span> хэлийг хамтдаа сурцгаая</div>
          </div>
          <div className="doich-anim" style={{ marginBottom: 14, animationDelay: '0.10s' }}>
            <Field label="Цахим шуудан (Email)" mid={mid}>
              <input className="doich-input" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="email" placeholder="guten.tag@doich.mn" style={{ ...inputBase, padding: '14px 16px' }} />
            </Field>
          </div>
          <div className="doich-anim" style={{ marginBottom: 6, animationDelay: '0.14s' }}>
            <Field label="Нууц үг (Passwort)" mid={mid}>
              <PwInput value={password} onChange={setPassword} show={showPw} setShow={setShowPw} onEnter={submit} base={inputBase} iconColor={iconColor} />
            </Field>
          </div>
          {mode === 'signup' && (
            <div className="doich-anim" style={{ marginBottom: 6, marginTop: 14 }}>
              <Field label="Нууц үг давтах" mid={mid}>
                <PwInput value={confirmPw} onChange={setConfirmPw} show={showCPw} setShow={setShowCPw} onEnter={submit} base={inputBase} iconColor={iconColor} />
              </Field>
            </div>
          )}
          {mode === 'signin' && (
            <div style={{ textAlign: 'right', marginTop: 10, marginBottom: 22 }}>
              <button onClick={() => switchMode('reset')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: linkColor, fontSize: 13, fontWeight: 600, padding: 0 }}>Нууц үгээ мартсан уу?</button>
            </div>
          )}
          {mode === 'signup' && <div style={{ marginBottom: 14 }} />}
          {error && <Feedback color="#ba1a1a" text={error} />}
          {emailTaken && (
            <div style={{ textAlign: 'center', marginTop: -8, marginBottom: 14 }}>
              <button onClick={() => switchMode('signin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: linkColor, fontWeight: 700, fontSize: 13, textDecoration: 'underline', padding: 0 }}>
                Нэвтрэх хэсэг рүү очих →
              </button>
            </div>
          )}
          {showResend && <ResendLink onClick={resendConfirmation} loading={loading} linkColor={linkColor} />}
          {msg   && <Feedback color="#1a6e3c" text={msg} />}
          <div className="doich-anim" style={{ animationDelay: '0.18s' }}>
            {mode === 'signup' && signupFooter}
            <GoldButton loading={loading} disabled={mode === 'signup' && !ageOk} label={mode === 'signin' ? 'Нэвтрэх →' : 'Бүртгүүлэх →'} onClick={submit} />
          </div>
          <OrDivider soft={soft} border={border} />
          <GoogleButton onClick={googleSignIn} isDark={isDark} border={border} text={text} />
          {/* FacebookButton pending Meta business verification — re-enable once approved */}
          <p style={{ textAlign: 'center', fontSize: 14, color: soft, margin: '14px 0 0' }}>
            {mode === 'signin' ? 'Шинэ хэрэглэгч үү? ' : 'Бүртгэлтэй юу? '}
            <button onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bc0000', fontWeight: 700, fontSize: 14, padding: 0 }}>
              {mode === 'signin' ? 'Бүртгүүлэх' : 'Нэвтрэх'}
            </button>
          </p>
        </div>
      )}
    </>
  );

  // ── Desktop form ──────────────────────────────────────────────────────────
  const desktopForm = (
    <div style={{ width: '100%', maxWidth: 420 }}>
      {mode === 'reset' ? (
        <div className="doich-anim">
          <button onClick={() => switchMode('signin')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: mid, fontWeight: 700, fontSize: 13, marginBottom: 28, padding: 0 }}>
            <ArrowLeft size={15} /> Буцах
          </button>
          <h1 className="doich-display" style={{ fontSize: 28, fontWeight: 800, color: text, margin: '0 0 8px' }}>Нууц үг мартсан</h1>
          <p style={{ color: soft, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Имэйл хаягаа оруулна уу. Нууц үг сэргээх холбоос илгээгдэх болно.</p>
          <Field label="Имэйл хаяг" mid={mid}>
            <input className="doich-input" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="email" placeholder="guten.tag@doich.mn" style={{ ...inputBase, padding: '13px 16px' }} />
          </Field>
          {error && <Feedback color="#ba1a1a" text={error} />}
          {msg   && <Feedback color="#1a6e3c" text={msg} />}
          <GoldButton loading={loading} label="Холбоос илгээх →" onClick={submit} />
        </div>
      ) : (
        <>
          <h1 className="doich-display doich-anim" style={{ fontSize: 32, fontWeight: 800, color: text, margin: '0 0 6px', lineHeight: 1.1 }}>
            Тавтай <span className="doich-grad">морил</span>
          </h1>
          <p className="doich-anim" style={{ color: soft, fontSize: 14, margin: '0 0 28px', lineHeight: 1.5, animationDelay: '0.04s' }}>
            {mode === 'signin' ? 'Эхлэхийн тулд бүртгэлдээ нэвтэрнэ үү.' : 'Шинэ бүртгэл үүсгэнэ үү.'}
          </p>
          <div className="doich-anim" style={{ display: 'flex', gap: 8, marginBottom: 28, animationDelay: '0.08s' }}>
            {[['signin', 'Нэвтрэх'], ['signup', 'Бүртгүүлэх']].map(([val, label]) => (
              <button key={val} onClick={() => switchMode(val)} className="doich-tabbtn"
                style={{ flex: 1, padding: '11px 0', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, border: `1.5px solid ${mode === val ? goldBtn : border}`, background: mode === val ? (isDark ? '#272210' : '#fffcf0') : 'transparent', color: mode === val ? goldTitle : soft, boxShadow: mode === val ? `0 4px 14px ${isDark ? 'rgba(201,160,0,0.18)' : 'rgba(255,196,0,0.25)'}` : 'none', transition: 'all 0.2s ease' }}>
                {label}
              </button>
            ))}
          </div>
          <div className="doich-anim" style={{ marginBottom: 18, animationDelay: '0.12s' }}>
            <Field label="Имэйл хаяг" mid={mid}>
              <input className="doich-input" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} type="email" placeholder="guten.tag@doich.mn" style={{ ...inputBase, padding: '13px 16px' }} />
            </Field>
          </div>
          <div className="doich-anim" style={{ marginBottom: mode === 'signin' ? 14 : 18, animationDelay: '0.16s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: mid }}>Нууц үг</label>
              {mode === 'signin' && <button onClick={() => switchMode('reset')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: goldTitle, fontSize: 13, fontWeight: 600, padding: 0 }}>Нууц үг мартсан?</button>}
            </div>
            <PwInput value={password} onChange={setPassword} show={showPw} setShow={setShowPw} onEnter={submit} base={inputBase} iconColor={iconColor} pad="13px 44px 13px 16px" />
          </div>
          {mode === 'signup' && (
            <div className="doich-anim" style={{ marginBottom: 18 }}>
              <Field label="Нууц үг давтах" mid={mid}>
                <PwInput value={confirmPw} onChange={setConfirmPw} show={showCPw} setShow={setShowCPw} onEnter={submit} base={inputBase} iconColor={iconColor} pad="13px 44px 13px 16px" />
              </Field>
            </div>
          )}
          {mode === 'signin' && (
            <label className="doich-anim" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, cursor: 'pointer', userSelect: 'none', animationDelay: '0.20s' }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: goldBtn, cursor: 'pointer' }} />
              <span style={{ fontSize: 14, color: mid }}>Намайг сана</span>
            </label>
          )}
          {mode === 'signup' && <div style={{ marginBottom: 4 }} />}
          {error && <Feedback color="#ba1a1a" text={error} />}
          {emailTaken && (
            <div style={{ textAlign: 'center', marginTop: -8, marginBottom: 14 }}>
              <button onClick={() => switchMode('signin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: linkColor, fontWeight: 700, fontSize: 13, textDecoration: 'underline', padding: 0 }}>
                Нэвтрэх хэсэг рүү очих →
              </button>
            </div>
          )}
          {showResend && <ResendLink onClick={resendConfirmation} loading={loading} linkColor={linkColor} />}
          {msg   && <Feedback color="#1a6e3c" text={msg} />}
          <div className="doich-anim" style={{ animationDelay: '0.24s' }}>
            {mode === 'signup' && signupFooter}
            <GoldButton loading={loading} disabled={mode === 'signup' && !ageOk} label={mode === 'signin' ? 'Нэвтрэх' : 'Бүртгүүлэх'} onClick={submit} />
          </div>
          <OrDivider soft={soft} border={border} />
          <GoogleButton onClick={googleSignIn} isDark={isDark} border={border} text={text} />
          {/* FacebookButton pending Meta business verification — re-enable once approved */}
          <p style={{ textAlign: 'center', fontSize: 14, color: soft, margin: '14px 0 0' }}>
            {mode === 'signin' ? 'Шинэ хэрэглэгч үү? ' : 'Бүртгэлтэй юу? '}
            <button onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bc0000', fontWeight: 700, fontSize: 14, padding: 0 }}>
              {mode === 'signin' ? 'Бүртгүүлэх' : 'Нэвтрэх'}
            </button>
          </p>
        </>
      )}
    </div>
  );

  const ThemeToggle = ({ pos }) => (
    <button onClick={onToggle} aria-label="Toggle dark mode"
      style={{ position: 'absolute', ...pos, width: 42, height: 42, borderRadius: 21, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 30, boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.08)' }}>
      {isDark ? <Sun size={18} color="#b8a98a" /> : <Moon size={18} color="#80765f" />}
    </button>
  );

  const logoCard = (size) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="doich-logoGlow" style={{ position: 'absolute', width: size * 1.5, height: size * 1.5, borderRadius: '50%', background: `radial-gradient(circle, ${isDark ? 'rgba(241,193,0,0.30)' : 'rgba(255,204,0,0.45)'} 0%, transparent 68%)`, filter: 'blur(8px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', background: card, borderRadius: 26, padding: size > 150 ? 20 : 16, boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.45)' : '0 10px 44px rgba(120,90,0,0.16)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,204,0,0.20)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/logo.png" alt="Дойч logo" width={size} height={size} style={{ objectFit: 'contain', display: 'block' }} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <div className="doich-display" style={{ display: 'none', width: size, height: size, alignItems: 'center', justifyContent: 'center', fontSize: size * 0.62, fontWeight: 800, color: goldBtn, lineHeight: 1 }}>Д</div>
      </div>
    </div>
  );

  // ── Desktop layout ────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="doich-root" style={{ ...rootVars, minHeight: '100vh', display: 'flex', position: 'relative' }}>
        <DoichStyles />
        <div style={{ flex: 1, background: leftBg, backgroundImage: isDark ? 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)' : 'linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)', backgroundSize: '44px 44px', display: 'flex', flexDirection: 'column', padding: '32px 48px 48px', position: 'relative', overflow: 'hidden' }}>
          <div className="doich-blob b1" style={{ width: 380, height: 380, top: -80, left: -60, background: isDark ? 'rgba(201,160,0,0.18)' : 'rgba(255,204,0,0.40)' }} />
          <div className="doich-blob b2" style={{ width: 320, height: 320, bottom: -60, right: -40, background: isDark ? 'rgba(180,80,40,0.14)' : 'rgba(255,176,140,0.40)' }} />
          <FloatChip text="Hallo"     sub="Сайн уу"   style={{ top: '14%', left: '10%' }}     d="0s"   isDark={isDark} card={card} border={border} text2={text} soft={soft} />
          <FloatChip text="Danke"     sub="Баярлалаа" style={{ top: '24%', right: '12%' }}    d="1.2s" isDark={isDark} card={card} border={border} text2={text} soft={soft} />
          <FloatChip text="Tschüss"   sub="Баяртай"   style={{ bottom: '26%', left: '8%' }}   d="0.6s" isDark={isDark} card={card} border={border} text2={text} soft={soft} />
          <FloatChip text="Wunderbar" sub="Гайхалтай" style={{ bottom: '16%', right: '10%' }} d="1.8s" isDark={isDark} card={card} border={border} text2={text} soft={soft} />
          <div className="doich-display" style={{ position: 'relative', zIndex: 2, fontSize: 24, fontWeight: 800, color: goldTitle, letterSpacing: '-0.5px', marginBottom: 'auto' }}>Дойч</div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, paddingBottom: 40 }}>
            <div style={{ marginBottom: 36 }}>{logoCard(190)}</div>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
              <h2 className="doich-display" style={{ fontSize: 33, fontWeight: 800, color: text, margin: '0 0 14px', lineHeight: 1.22 }}>
                <span className="doich-grad">Герман</span> хэлийг<br/>хамтдаа сурцгаая
              </h2>
              <p style={{ color: soft, fontSize: 15, margin: '0 0 36px', lineHeight: 1.7 }}>Монголоос Герман руу — хэлээр холбогдоё. Герман хэл эзэмшиж, боловсрол болон карьерын шинэ боломжуудыг нээгээрэй.</p>
            </div>
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 18, padding: '16px 20px', width: '100%', maxWidth: 400, boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.35)' : '0 8px 30px rgba(120,90,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? 'rgba(255,204,0,0.14)' : '#fff3c4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={21} color={goldTitle} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: text }}>A1 түвшин</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: goldTitle }}><Sparkles size={12} /> 35%</div>
                  </div>
                  <div style={{ height: 6, background: isDark ? '#333' : '#eae8e7', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '35%', background: 'var(--btn-grad)', borderRadius: 3 }} />
                  </div>
                </div>
              </div>
              <div style={{ color: soft, fontSize: 13, fontStyle: 'italic', lineHeight: 1.5 }}>"Guten Tag! Ich komme aus der Mongolei."</div>
            </div>
          </div>
        </div>
        <div style={{ width: 520, minHeight: '100vh', background: card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 56px', position: 'relative', boxShadow: isDark ? '-12px 0 48px rgba(0,0,0,0.4)' : '-8px 0 40px rgba(0,0,0,0.06)' }}>
          {desktopForm}
        </div>
      </div>
    );
  }

  // ── Mobile layout ─────────────────────────────────────────────────────────
  const mobileGridLines = isDark
    ? 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'
    : 'linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px)';

  return (
    <div className="doich-root" style={{ ...rootVars, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <DoichStyles />
      <div style={{ flex: '0 0 42vh', minHeight: 200, background: leftBg, backgroundImage: mobileGridLines, backgroundSize: '44px 44px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="doich-blob b1" style={{ width: 260, height: 260, top: -60, left: -40, background: isDark ? 'rgba(201,160,0,0.20)' : 'rgba(255,204,0,0.45)' }} />
        <div className="doich-blob b2" style={{ width: 220, height: 220, bottom: -50, right: -30, background: isDark ? 'rgba(180,80,40,0.16)' : 'rgba(255,176,140,0.42)' }} />
        <FloatChip text="Hallo" sub="Сайн уу"   style={{ top: '16%', left: '7%' }}  d="0s"   isDark={isDark} card={card} border={border} text2={text} soft={soft} small />
        <FloatChip text="Danke" sub="Баярлалаа" style={{ top: '20%', right: '7%' }} d="1.1s" isDark={isDark} card={card} border={border} text2={text} soft={soft} small />
        <div style={{ position: 'relative', zIndex: 2 }}>{logoCard(108)}</div>
      </div>
      <div style={{ flex: 1, background: card, borderRadius: '32px 32px 0 0', padding: '14px 24px 48px', marginTop: -22, position: 'relative', zIndex: 5, boxShadow: isDark ? '0 -12px 48px rgba(0,0,0,0.55)' : '0 -8px 40px rgba(0,0,0,0.07)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: isDark ? 'rgba(255,255,255,0.14)' : '#e2ddd6', margin: '0 auto 22px' }} />
        {mobileForm}
      </div>
    </div>
  );
}

function Field({ label, mid, children }) {
  return (
    <div>
      <label style={{ color: mid, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );
}

function PwInput({ value, onChange, show, setShow, onEnter, base, iconColor, pad = '14px 48px 14px 16px' }) {
  return (
    <div style={{ position: 'relative' }}>
      <input className="doich-input" value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && onEnter()} type={show ? 'text' : 'password'} placeholder="••••••••" style={{ ...base, padding: pad }} />
      <button onClick={() => setShow(s => !s)} aria-label="Toggle password" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
        {show ? <EyeOff size={18} color={iconColor} /> : <Eye size={18} color={iconColor} />}
      </button>
    </div>
  );
}

function FloatChip({ text, sub, style, d, isDark, card, border, text2, soft, small }) {
  return (
    <div className="doich-chip" style={{ position: 'absolute', zIndex: 1, animationDelay: d, display: 'flex', alignItems: 'center', gap: 8, background: isDark ? 'rgba(40,38,28,0.72)' : 'rgba(255,255,255,0.78)', border: `1px solid ${border}`, borderRadius: 999, padding: small ? '6px 11px' : '8px 14px', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.30)' : '0 4px 16px rgba(120,90,0,0.10)', ...style }}>
      <span style={{ fontWeight: 800, fontSize: small ? 12 : 14, color: text2 }}>{text}</span>
      <span style={{ width: 1, height: small ? 11 : 13, background: border }} />
      <span style={{ fontSize: small ? 11 : 12.5, color: soft, fontWeight: 600 }}>{sub}</span>
    </div>
  );
}

function GoldButton({ loading, disabled, label, onClick }) {
  const off = loading || disabled;
  return (
    <button onClick={onClick} disabled={off} className="doich-cta"
      style={{ width: '100%', padding: '15px', borderRadius: 13, border: 'none', cursor: off ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 16, background: 'var(--btn-grad)', color: 'var(--btn-text)', opacity: off ? 0.45 : 1, boxShadow: off ? 'none' : 'var(--btn-shadow)' }}>
      {loading ? '...' : label}
    </button>
  );
}

function Feedback({ color, text }) {
  return <div style={{ color, fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: 'center', lineHeight: 1.5 }}>{text}</div>;
}

function ResendLink({ onClick, loading, linkColor }) {
  return (
    <div style={{ textAlign: 'center', marginTop: -8, marginBottom: 14 }}>
      <button onClick={onClick} disabled={loading} style={{ background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', color: linkColor, fontWeight: 700, fontSize: 13, textDecoration: 'underline', padding: 0 }}>
        Баталгаажуулах холбоос дахин илгээх →
      </button>
    </div>
  );
}

function OrDivider({ soft, border }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
      <div style={{ flex: 1, height: 1, background: border }} />
      <span style={{ fontSize: 12, color: soft, fontWeight: 600 }}>эсвэл</span>
      <div style={{ flex: 1, height: 1, background: border }} />
    </div>
  );
}

function GoogleButton({ onClick, isDark, border, text }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '13px', borderRadius: 13, border: `1.5px solid ${border}`, background: isDark ? '#252318' : '#ffffff', cursor: 'pointer', fontWeight: 700, fontSize: 15, color: text }}>
      <GoogleIcon />
      Google-ээр үргэлжлүүлэх
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function FacebookButton({ onClick }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '13px', borderRadius: 13, border: 'none', background: '#1877F2', cursor: 'pointer', fontWeight: 700, fontSize: 15, color: '#ffffff' }}>
      <FacebookIcon />
      Facebook-ээр үргэлжлүүлэх
    </button>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg">
      <path fill="#ffffff" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
    </svg>
  );
}

function DoichStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Unbounded:wght@600;700;800&display=swap');
      .doich-root, .doich-root * { font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif; }
      .doich-display { font-family: 'Unbounded', 'Manrope', sans-serif; letter-spacing: -0.5px; }
      .doich-grad { background: var(--grad-text); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .doich-input { transition: border-color .18s, box-shadow .18s; }
      .doich-input:focus { border-color: var(--gold) !important; box-shadow: 0 0 0 3px var(--ring); }
      .doich-tabbtn { transition: color .2s ease; }
      .doich-cta { position: relative; overflow: hidden; transition: transform .14s ease, box-shadow .22s ease, opacity .18s; }
      .doich-cta:not(:disabled):hover { transform: translateY(-2px); box-shadow: var(--btn-shadow-hover); }
      .doich-cta::before { content: ''; position: absolute; top: 0; left: -120%; width: 55%; height: 100%; background: linear-gradient(120deg, transparent, rgba(255,255,255,0.55), transparent); transform: skewX(-20deg); transition: left .6s ease; pointer-events: none; }
      .doich-cta:not(:disabled):hover::before { left: 170%; }
      .doich-blob { position: absolute; border-radius: 50%; filter: blur(64px); pointer-events: none; z-index: 0; }
      .doich-blob.b1 { animation: doichFloatA 15s ease-in-out infinite; }
      .doich-blob.b2 { animation: doichFloatB 19s ease-in-out infinite; }
      .doich-chip { animation: doichFloatChip 9s ease-in-out infinite; }
      .doich-logoGlow { animation: doichGlow 4.5s ease-in-out infinite; }
      .doich-anim { animation: doichFadeUp .55s cubic-bezier(.22,1,.36,1) both; }
      @keyframes doichFloatA { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(28px,-22px) scale(1.08); } }
      @keyframes doichFloatB { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-24px,26px) scale(1.1); } }
      @keyframes doichFloatChip { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
      @keyframes doichGlow { 0%,100% { opacity: .65; transform: scale(1); } 50% { opacity: 1; transform: scale(1.07); } }
      @keyframes doichFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    ` }} />
  );
}
