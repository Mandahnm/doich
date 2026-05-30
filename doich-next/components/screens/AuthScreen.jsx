'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, ArrowLeft, Moon, Sun } from 'lucide-react';

export default function AuthScreen({ isDark, onToggle }) {
  const [mode,      setMode]      = useState('signin');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [showCPw,   setShowCPw]   = useState(false);
  const [remember,  setRemember]  = useState(false);
  const [error,     setError]     = useState('');
  const [msg,       setMsg]       = useState('');
  const [loading,   setLoading]   = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Theme tokens ──────────────────────────────────────────────────────────
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

  const bgGrad = isDark
    ? 'linear-gradient(170deg, #1a1500 0%, #121212 50%)'
    : 'linear-gradient(170deg, #FFF8D4 0%, #FFF2DC 50%, #FFF0E8 100%)';

  const switchMode = m => { setMode(m); setError(''); setMsg(''); setPassword(''); setConfirmPw(''); };

  const submit = async () => {
    setError(''); setMsg('');

    if (mode === 'reset') {
      if (!email.trim()) { setError('Имэйл хаягаа оруулна уу'); return; }
      setLoading(true);
      const { error: e } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      setLoading(false);
      if (e) setError(e.message);
      else   setMsg('Нууц үг сэргээх холбоос имэйл рүү илгээгдлээ!');
      return;
    }

    if (!email.trim() || !password.trim()) { setError('Имэйл болон нууц үгээ оруулна уу'); return; }
    if (mode === 'signup' && password.length < 6) { setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'); return; }
    if (mode === 'signup' && password !== confirmPw) { setError('Нууц үг таарахгүй байна'); return; }

    setLoading(true);
    if (mode === 'signup') {
      const { data, error: e } = await supabase.auth.signUp({ email: email.trim(), password });
      setLoading(false);
      if (e) { setError(e.message); return; }
      if (data.session) setMsg('Амжилттай бүртгүүллээ! Нэвтэрч байна...');
      else              setMsg('Имэйл хаягруу баталгаажуулах холбоос илгээгдлээ!');
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setLoading(false);
      if (e) setError('Имэйл эсвэл нууц үг буруу байна');
    }
  };

  // ── Shared input style ────────────────────────────────────────────────────
  const inputBase = {
    width: '100%', boxSizing: 'border-box',
    background: isDark ? '#252318' : '#fafaf9',
    border: `1.5px solid ${border}`,
    borderRadius: 10, fontSize: 15, color: text, outline: 'none',
    transition: 'border-color 0.18s',
  };

  // ── Mobile form (with icons, pill tabs, centered) ─────────────────────────
  const mobileForm = (
    <>
      {mode === 'reset' ? (
        <>
          <button onClick={() => switchMode('signin')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: mid, fontWeight: 700, fontSize: 13, marginBottom: 20, padding: 0 }}>
            <ArrowLeft size={15} /> Буцах
          </button>
          <div style={{ fontWeight: 800, fontSize: 18, color: text, marginBottom: 6 }}>Нууц үг мартсан</div>
          <div style={{ color: soft, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            Имэйл хаягаа оруулна уу. Нууц үг сэргээх холбоос илгээгдэх болно.
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: mid, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Цахим шуудан (Email)</label>
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
              type="email" placeholder="guten.tag@doich.mn"
              style={{ ...inputBase, padding: '14px 16px' }} />
          </div>
          {error && <Feedback color="#ba1a1a" text={error} />}
          {msg   && <Feedback color="#1a6e3c" text={msg} />}
          <GoldButton loading={loading} label="Холбоос илгээх →" goldBtn={goldBtn} goldBtnText={goldBtnText} onClick={submit} />
        </>
      ) : (
        <>
          <div style={{ display: 'flex', background: tabBg, borderRadius: 999, padding: 4, marginBottom: 24 }}>
            {[['signin', 'Нэвтрэх'], ['signup', 'Бүртгүүлэх']].map(([val, label]) => (
              <button key={val} onClick={() => switchMode(val)}
                style={{ flex: 1, padding: '11px 0', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, transition: 'all 0.2s ease', background: mode === val ? tabActive : 'transparent', color: mode === val ? text : soft, boxShadow: mode === val ? (isDark ? '0 2px 10px rgba(0,0,0,0.35)' : '0 2px 10px rgba(0,0,0,0.10)') : 'none' }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 21, fontWeight: 800, color: text, marginBottom: 5 }}>Тавтай морил!</div>
            <div style={{ fontSize: 14, color: soft, lineHeight: 1.5 }}>Герман хэлийг хамтдаа сурцгаая</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: mid, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Цахим шуудан (Email)</label>
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
              type="email" placeholder="guten.tag@doich.mn" style={{ ...inputBase, padding: '14px 16px' }} />
          </div>
          <div style={{ marginBottom: 6 }}>
            <label style={{ color: mid, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Нууц үг (Passwort)</label>
            <div style={{ position: 'relative' }}>
              <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
                type={showPw ? 'text' : 'password'} placeholder="••••••••" style={{ ...inputBase, padding: '14px 48px 14px 16px' }} />
              <button onClick={() => setShowPw(s => !s)} aria-label="Toggle password"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                {showPw ? <EyeOff size={18} color={iconColor} /> : <Eye size={18} color={iconColor} />}
              </button>
            </div>
          </div>
          {mode === 'signup' && (
            <div style={{ marginBottom: 6, marginTop: 14 }}>
              <label style={{ color: mid, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Нууц үг давтах</label>
              <div style={{ position: 'relative' }}>
                <input value={confirmPw} onChange={e => setConfirmPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
                  type={showCPw ? 'text' : 'password'} placeholder="••••••••" style={{ ...inputBase, padding: '14px 48px 14px 16px' }} />
                <button onClick={() => setShowCPw(s => !s)} aria-label="Toggle password"
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  {showCPw ? <EyeOff size={18} color={iconColor} /> : <Eye size={18} color={iconColor} />}
                </button>
              </div>
            </div>
          )}
          {mode === 'signin' && (
            <div style={{ textAlign: 'right', marginTop: 10, marginBottom: 22 }}>
              <button onClick={() => switchMode('reset')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: linkColor, fontSize: 13, fontWeight: 600, padding: 0 }}>
                Нууц үгээ мартсан уу?
              </button>
            </div>
          )}
          {mode === 'signup' && <div style={{ marginBottom: 22 }} />}
          {error && <Feedback color="#ba1a1a" text={error} />}
          {msg   && <Feedback color="#1a6e3c" text={msg} />}
          <GoldButton loading={loading} label={mode === 'signin' ? 'Нэвтрэх →' : 'Бүртгүүлэх →'} goldBtn={goldBtn} goldBtnText={goldBtnText} onClick={submit} />
        </>
      )}
    </>
  );

  // ── Desktop right-panel form ──────────────────────────────────────────────
  const desktopForm = (
    <div style={{ width: '100%', maxWidth: 420 }}>
      {mode === 'reset' ? (
        <>
          <button onClick={() => switchMode('signin')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: mid, fontWeight: 700, fontSize: 13, marginBottom: 28, padding: 0 }}>
            <ArrowLeft size={15} /> Буцах
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: text, margin: '0 0 8px' }}>Нууц үг мартсан</h1>
          <p style={{ color: soft, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            Имэйл хаягаа оруулна уу. Нууц үг сэргээх холбоос илгээгдэх болно.
          </p>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: mid, display: 'block', marginBottom: 8 }}>Имэйл хаяг</label>
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
              type="email" placeholder="guten.tag@doich.mn" style={{ ...inputBase, padding: '13px 16px' }} />
          </div>
          {error && <Feedback color="#ba1a1a" text={error} />}
          {msg   && <Feedback color="#1a6e3c" text={msg} />}
          <GoldButton loading={loading} label="Холбоос илгээх →" goldBtn={goldBtn} goldBtnText={goldBtnText} onClick={submit} />
        </>
      ) : (
        <>
          {/* Title */}
          <h1 style={{ fontSize: 30, fontWeight: 800, color: text, margin: '0 0 6px' }}>Тавтай морил</h1>
          <p style={{ color: soft, fontSize: 14, margin: '0 0 28px', lineHeight: 1.5 }}>
            {mode === 'signin' ? 'Эхлэхийн тулд бүртгэлдээ нэвтэрнэ үү.' : 'Шинэ бүртгэл үүсгэнэ үү.'}
          </p>

          {/* Outlined tab switcher */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {[['signin', 'Нэвтрэх'], ['signup', 'Бүртгүүлэх']].map(([val, label]) => (
              <button key={val} onClick={() => switchMode(val)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                  fontWeight: 700, fontSize: 14, transition: 'all 0.18s',
                  border: `1.5px solid ${mode === val ? goldBtn : border}`,
                  background: mode === val ? (isDark ? '#272210' : '#fffcf0') : 'transparent',
                  color: mode === val ? goldTitle : soft,
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: mid, display: 'block', marginBottom: 8 }}>Имэйл хаяг</label>
            <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
              type="email" placeholder="guten.tag@doich.mn" style={{ ...inputBase, padding: '13px 16px' }} />
          </div>

          {/* Password */}
          <div style={{ marginBottom: mode === 'signin' ? 14 : 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: mid }}>Нууц үг</label>
              {mode === 'signin' && (
                <button onClick={() => switchMode('reset')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: goldTitle, fontSize: 13, fontWeight: 600, padding: 0 }}>
                  Нууц үг мартсан?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
                type={showPw ? 'text' : 'password'} placeholder="••••••••"
                style={{ ...inputBase, padding: '13px 44px 13px 16px' }} />
              <button onClick={() => setShowPw(s => !s)} aria-label="Toggle password"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                {showPw ? <EyeOff size={18} color={iconColor} /> : <Eye size={18} color={iconColor} />}
              </button>
            </div>
          </div>

          {/* Confirm password — signup only */}
          {mode === 'signup' && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: mid, display: 'block', marginBottom: 8 }}>Нууц үг давтах</label>
              <div style={{ position: 'relative' }}>
                <input value={confirmPw} onChange={e => setConfirmPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
                  type={showCPw ? 'text' : 'password'} placeholder="••••••••"
                  style={{ ...inputBase, padding: '13px 44px 13px 16px' }} />
                <button onClick={() => setShowCPw(s => !s)} aria-label="Toggle password"
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  {showCPw ? <EyeOff size={18} color={iconColor} /> : <Eye size={18} color={iconColor} />}
                </button>
              </div>
            </div>
          )}

          {/* Remember me — signin only */}
          {mode === 'signin' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: goldBtn, cursor: 'pointer' }} />
              <span style={{ fontSize: 14, color: mid }}>Намайг сана</span>
            </label>
          )}

          {mode === 'signup' && <div style={{ marginBottom: 4 }} />}

          {error && <Feedback color="#ba1a1a" text={error} />}
          {msg   && <Feedback color="#1a6e3c" text={msg} />}

          <GoldButton loading={loading} label={mode === 'signin' ? 'Нэвтрэх' : 'Бүртгүүлэх'} goldBtn={goldBtn} goldBtnText={goldBtnText} onClick={submit} />

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: border }} />
            <span style={{ color: soft, fontSize: 13 }}>Эсвэл</span>
            <div style={{ flex: 1, height: 1, background: border }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <SocialButton isDark={isDark} border={border} text={text} label="Google" icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            } />
            <SocialButton isDark={isDark} border={border} text={text} label="Apple" icon={
              <svg width="18" height="18" viewBox="0 0 814 1000" fill={text}>
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 110.2-49 192.6-49 31.2.1 105 3.4 160.9 55z"/>
                <path d="M554.1 107.5c29.9-36.1 51.5-86.5 51.5-136.9 0-7-.5-14-.8-21-49.2 1.8-107.5 32.7-142.6 74-27.5 31.2-53.8 81.6-53.8 132.7 0 7.6.9 15.2 1.5 17.5 3.2.5 8.4 1.3 13.6 1.3 44.4 0 98.9-29.9 130.6-67.6z"/>
              </svg>
            } />
          </div>

          {/* Switch mode link */}
          <p style={{ textAlign: 'center', fontSize: 14, color: soft, margin: 0 }}>
            {mode === 'signin' ? 'Шинэ хэрэглэгч үү? ' : 'Бүртгэлтэй юу? '}
            <button onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bc0000', fontWeight: 700, fontSize: 14, padding: 0 }}>
              {mode === 'signin' ? 'Бүртгүүлэх' : 'Нэвтрэх'}
            </button>
          </p>
        </>
      )}
    </div>
  );

  // ── Dark mode toggle ──────────────────────────────────────────────────────
  const toggleBtn = (
    <button onClick={onToggle} aria-label="Toggle dark mode"
      style={{
        position: 'absolute', top: 20, left: 20,
        width: 44, height: 44, borderRadius: 22,
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        zIndex: 10,
        boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.08)',
      }}>
      {isDark ? <Sun size={18} color="#b8a98a" /> : <Moon size={18} color="#80765f" />}
    </button>
  );

  // ── DESKTOP layout ────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>

        {/* LEFT — branding panel with tile grid */}
        <div style={{
          flex: 1,
          background: leftBg,
          backgroundImage: isDark
            ? 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)'
            : 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          display: 'flex', flexDirection: 'column',
          padding: '32px 48px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Brand wordmark top-left */}
          <div style={{ fontSize: 22, fontWeight: 900, color: goldTitle, letterSpacing: '-0.5px', marginBottom: 'auto' }}>
            Дойч
          </div>

          {/* Center content */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, paddingBottom: 40 }}>
            {/* Logo card */}
            <div style={{
              background: card,
              borderRadius: 24,
              padding: '20px',
              marginBottom: 36,
              boxShadow: isDark
                ? '0 8px 40px rgba(0,0,0,0.4)'
                : '0 8px 40px rgba(0,0,0,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src="/logo.png" alt="Дойч logo" width={210} height={210}
                style={{ objectFit: 'contain', display: 'block' }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              {/* Fallback if logo.png not found */}
              <div style={{ display: 'none', width: 140, height: 140, alignItems: 'center', justifyContent: 'center', fontSize: 100, fontWeight: 900, color: goldBtn, lineHeight: 1 }}>
                Д
              </div>
            </div>

            {/* Headline */}
            <div style={{ textAlign: 'center', maxWidth: 380 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: text, margin: '0 0 14px', lineHeight: 1.25 }}>
                Герман хэлийг хамтдаа сурцгаая
              </h2>
              <p style={{ color: soft, fontSize: 15, margin: '0 0 36px', lineHeight: 1.7 }}>
                Монголоос Герман руу — хэлээр холбогдоё.<br/>Герман хэл эзэмшиж, боловсрол болон карьерын шинэ боломжуудыг нээгээрэй.
              </p>
            </div>

            {/* Preview card */}
            <div style={{
              background: card,
              border: `1px solid ${border}`,
              borderRadius: 16,
              padding: '16px 20px',
              width: '100%',
              maxWidth: 380,
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ffdad4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎓</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: text }}>Level A1: Basics</div>
                  <div style={{ height: 4, width: 100, background: isDark ? '#333' : '#eae8e7', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '35%', background: '#0062a1', borderRadius: 2 }} />
                  </div>
                </div>
              </div>
              <div style={{ color: soft, fontSize: 13, fontStyle: 'italic', lineHeight: 1.5 }}>
                "Guten Tag! Ich komme aus der Mongolei."
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — form panel */}
        <div style={{
          width: 520,
          minHeight: '100vh',
          background: card,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '60px 56px',
          boxShadow: isDark ? '-12px 0 48px rgba(0,0,0,0.4)' : '-8px 0 40px rgba(0,0,0,0.06)',
          position: 'relative',
        }}>
          {/* Dark mode toggle top-right of form panel */}
          <button onClick={onToggle} aria-label="Toggle dark mode"
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 40, height: 40, borderRadius: 20,
              background: isDark ? 'rgba(255,255,255,0.08)' : '#f5f0e8',
              border: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
            {isDark ? <Sun size={16} color="#b8a98a" /> : <Moon size={16} color="#80765f" />}
          </button>

          {desktopForm}
        </div>
      </div>
    );
  }

  // ── MOBILE layout ─────────────────────────────────────────────────────────
  const mobileGridBg = isDark ? '#1a1812' : '#f5f0e8';
  const mobileGridLines = isDark
    ? 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'
    : 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Grid background top area */}
      <div style={{
        flex: '0 0 42vh', minHeight: 180,
        background: mobileGridBg,
        backgroundImage: mobileGridLines,
        backgroundSize: '44px 44px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {toggleBtn}
        {/* Logo centered */}
        <div style={{
          background: card,
          borderRadius: 24,
          padding: '16px',
          boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/logo.png" alt="Дойч" width={120} height={120}
            style={{ objectFit: 'contain', display: 'block' }}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div style={{ display: 'none', width: 120, height: 120, alignItems: 'center', justifyContent: 'center', fontSize: 80, fontWeight: 900, color: goldBtn, lineHeight: 1 }}>
            Д
          </div>
        </div>
      </div>

      {/* Bottom sheet card */}
      <div style={{
        flex: 1, background: card, borderRadius: '32px 32px 0 0',
        padding: '28px 24px 48px',
        boxShadow: isDark ? '0 -12px 48px rgba(0,0,0,0.55)' : '0 -8px 40px rgba(0,0,0,0.07)',
      }}>
        {mobileForm}
      </div>
    </div>
  );
}

function GoldButton({ loading, label, goldBtn, goldBtnText, onClick }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{
        width: '100%', padding: '15px', borderRadius: 12, border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 16,
        background: goldBtn, color: goldBtnText,
        opacity: loading ? 0.65 : 1,
        boxShadow: loading ? 'none' : '0 4px 16px rgba(255,204,0,0.35)',
        transition: 'opacity 0.18s, transform 0.12s',
        transform: loading ? 'scale(0.98)' : 'scale(1)',
      }}>
      {loading ? '...' : label}
    </button>
  );
}

function SocialButton({ isDark, border, text, label, icon }) {
  return (
    <button style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '11px 0', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14,
      border: `1.5px solid ${border}`, background: 'transparent', color: text,
      transition: 'background 0.15s',
    }}>
      {icon}
      {label}
    </button>
  );
}

function Feedback({ color, text }) {
  return (
    <div style={{ color, fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: 'center', lineHeight: 1.5 }}>
      {text}
    </div>
  );
}
