'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function AuthScreen({ isDark, onToggle }) {
  const [mode,     setMode]     = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [msg,      setMsg]      = useState('');
  const [loading,  setLoading]  = useState(false);

  const pink   = '#FF6FA8';
  const bg     = isDark ? '#15121E' : '#F8F5FF';
  const card   = isDark ? '#1E1A2E' : '#FFFFFF';
  const text   = isDark ? '#F0ECF8' : '#1A1028';
  const mid    = isDark ? '#9589B4' : '#7C6FA0';
  const border = isDark ? '#2E2845' : '#E8E0F5';

  const switchMode = m => { setMode(m); setError(''); setMsg(''); setPassword(''); };

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

    setLoading(true);
    if (mode === 'signup') {
      const { data, error: e } = await supabase.auth.signUp({ email: email.trim(), password });
      setLoading(false);
      if (e) { setError(e.message); return; }
      if (data.session) {
        // Email confirmation disabled — user is auto-logged in, page.js will react
        setMsg('Амжилттай бүртгүүллээ! Нэвтэрч байна...');
      } else {
        setMsg('Имэйл хаягруу баталгаажуулах холбоос илгээгдлээ!');
      }
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setLoading(false);
      if (e) setError('Имэйл эсвэл нууц үг буруу байна');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 18px', fontFamily: 'var(--font-nunito)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🇩🇪</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: pink, letterSpacing: '-0.5px' }}>Дойч</div>
          <div style={{ color: mid, fontSize: 14, marginTop: 4 }}>Герман хэл сур · монголоор</div>
        </div>

        {/* Card */}
        <div style={{ background: card, borderRadius: 28, padding: '28px 24px', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(167,139,250,0.12)' }}>

          {mode === 'reset' ? (
            /* ── Forgot password mode ── */
            <>
              <button onClick={() => switchMode('signin')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: mid, fontWeight: 700, fontSize: 13, marginBottom: 20, padding: 0 }}>
                <ArrowLeft size={15} /> Буцах
              </button>
              <div style={{ fontWeight: 800, fontSize: 17, color: text, marginBottom: 6 }}>Нууц үг мартсан</div>
              <div style={{ color: mid, fontSize: 13, marginBottom: 20 }}>Имэйл хаягаа оруулна уу. Нууц үг сэргээх холбоос илгээгдэх болно.</div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: mid, fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>ИМЭЙЛ</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color={mid} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    type="email" placeholder="example@gmail.com"
                    style={{ width: '100%', boxSizing: 'border-box', background: isDark ? '#15121E' : '#F8F5FF', border: `2px solid ${border}`, borderRadius: 14, padding: '12px 14px 12px 38px', fontSize: 14, color: text, outline: 'none' }} />
                </div>
              </div>
              {error && <div style={{ color: '#FF6B6B', fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: 'center' }}>{error}</div>}
              {msg   && <div style={{ color: '#34D399', fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: 'center' }}>{msg}</div>}
              <button onClick={submit} disabled={loading}
                style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 15, background: `linear-gradient(135deg, ${pink}, #A78BFA)`, color: '#fff', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 24px rgba(255,111,168,0.35)' }}>
                {loading ? '...' : 'Холбоос илгээх →'}
              </button>
            </>
          ) : (
            /* ── Sign in / Sign up mode ── */
            <>
              {/* Tab toggle */}
              <div style={{ display: 'flex', background: isDark ? '#15121E' : '#F0EBF8', borderRadius: 16, padding: 4, marginBottom: 24 }}>
                {[['signin','Нэвтрэх'], ['signup','Бүртгүүлэх']].map(([val, label]) => (
                  <button key={val} onClick={() => switchMode(val)}
                    style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, transition: 'all 0.2s',
                      background: mode === val ? pink : 'transparent',
                      color: mode === val ? '#fff' : mid }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Email */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ color: mid, fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>ИМЭЙЛ</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color={mid} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    type="email" placeholder="example@gmail.com"
                    style={{ width: '100%', boxSizing: 'border-box', background: isDark ? '#15121E' : '#F8F5FF', border: `2px solid ${border}`, borderRadius: 14, padding: '12px 14px 12px 38px', fontSize: 14, color: text, outline: 'none' }} />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: mode === 'signin' ? 8 : 4 }}>
                <label style={{ color: mid, fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>НУУЦ ҮГ</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color={mid} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    type={showPw ? 'text' : 'password'} placeholder="••••••••"
                    style={{ width: '100%', boxSizing: 'border-box', background: isDark ? '#15121E' : '#F8F5FF', border: `2px solid ${border}`, borderRadius: 14, padding: '12px 42px 12px 38px', fontSize: 14, color: text, outline: 'none' }} />
                  <button onClick={() => setShowPw(s => !s)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    {showPw ? <EyeOff size={16} color={mid} /> : <Eye size={16} color={mid} />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <div style={{ color: mid, fontSize: 11, marginTop: 4 }}>Хамгийн багадаа 6 тэмдэгт</div>
                )}
              </div>

              {/* Forgot password link (signin mode only) */}
              {mode === 'signin' && (
                <div style={{ textAlign: 'right', marginBottom: 16 }}>
                  <button onClick={() => switchMode('reset')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: pink, fontSize: 12, fontWeight: 700 }}>
                    Нууц үг мартсан?
                  </button>
                </div>
              )}

              {mode === 'signup' && <div style={{ marginBottom: 16 }} />}

              {error && <div style={{ color: '#FF6B6B', fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: 'center' }}>{error}</div>}
              {msg   && <div style={{ color: '#34D399', fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: 'center' }}>{msg}</div>}

              <button onClick={submit} disabled={loading}
                style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 15, background: `linear-gradient(135deg, ${pink}, #A78BFA)`, color: '#fff', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 24px rgba(255,111,168,0.35)' }}>
                {loading ? '...' : mode === 'signin' ? 'Нэвтрэх →' : 'Бүртгүүлэх →'}
              </button>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={onToggle}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: mid, fontSize: 13, fontWeight: 600 }}>
            {isDark ? '☀️ Цагаан горим' : '🌙 Харанхуй горим'}
          </button>
        </div>
      </div>
    </div>
  );
}
