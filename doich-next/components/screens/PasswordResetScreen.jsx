'use client';

import { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PasswordResetScreen({ isDark, onDone }) {
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [msg,      setMsg]      = useState('');
  const [loading,  setLoading]  = useState(false);

  // Gold palette — matches AuthScreen
  const bg          = isDark ? '#1a1812'                : '#f5f0e8';
  const card        = isDark ? '#1e1e1e'                : '#ffffff';
  const text        = isDark ? '#e4e2e1'                : '#1b1c1c';
  const mid         = isDark ? '#b8a98a'                : '#4e4632';
  const soft        = isDark ? '#7a6e54'                : '#80765f';
  const border      = isDark ? 'rgba(255,255,255,0.10)' : '#e2ddd6';
  const goldBtn     = isDark ? '#c9a000'                : '#ffcc00';
  const goldBtnText = isDark ? '#1a1500'                : '#241a00';
  const goldTitle   = isDark ? '#f1c100'                : '#745b00';
  const iconColor   = isDark ? '#7a6e54'                : '#a09070';

  const gridLines = isDark
    ? 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)'
    : 'linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)';

  const submit = async () => {
    setError('');
    if (password.length < 6) { setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'); return; }
    if (password !== confirm)  { setError('Нууц үгнүүд таарахгүй байна'); return; }
    setLoading(true);
    const { error: e } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (e) { setError(e.message); return; }
    setMsg('Нууц үг амжилттай шинэчлэгдлээ!');
    setTimeout(onDone, 1500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: bg,
      backgroundImage: gridLines,
      backgroundSize: '44px 44px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 18px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow blobs */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', top: -100, left: -80, background: isDark ? 'rgba(201,160,0,0.18)' : 'rgba(255,204,0,0.35)', filter: 'blur(64px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', bottom: -60, right: -40, background: isDark ? 'rgba(180,80,40,0.14)' : 'rgba(255,176,140,0.35)', filter: 'blur(64px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22, margin: '0 auto 16px',
            background: isDark ? 'rgba(255,204,0,0.14)' : '#fff3c4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isDark ? 'none' : '0 8px 24px rgba(255,180,80,0.25)',
          }}>
            <KeyRound size={32} color={goldTitle} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: text, marginBottom: 6 }}>Нууц үг шинэчлэх</div>
          <div style={{ color: soft, fontSize: 14 }}>Шинэ нууц үгээ оруулна уу</div>
        </div>

        {/* Card */}
        <div style={{
          background: card, borderRadius: 24, padding: '28px 24px',
          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.45)' : '0 20px 60px rgba(120,90,0,0.10)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,204,0,0.15)'}`,
        }}>
          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: mid, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Шинэ нууц үг</label>
            <div style={{ position: 'relative' }}>
              <input
                value={password} onChange={e => setPassword(e.target.value)}
                type={showPw ? 'text' : 'password'} placeholder="••••••••"
                style={{ width: '100%', boxSizing: 'border-box', background: isDark ? '#252318' : '#fafaf9', border: `1.5px solid ${border}`, borderRadius: 12, padding: '13px 44px 13px 16px', fontSize: 15, color: text, outline: 'none' }}
              />
              <button onClick={() => setShowPw(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                {showPw ? <EyeOff size={18} color={iconColor} /> : <Eye size={18} color={iconColor} />}
              </button>
            </div>
            <div style={{ color: soft, fontSize: 11, marginTop: 4 }}>Хамгийн багадаа 6 тэмдэгт</div>
          </div>

          {/* Confirm */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ color: mid, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Нууц үг давтах</label>
            <input
              value={confirm} onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              type={showPw ? 'text' : 'password'} placeholder="••••••••"
              style={{ width: '100%', boxSizing: 'border-box', background: isDark ? '#252318' : '#fafaf9', border: `1.5px solid ${border}`, borderRadius: 12, padding: '13px 16px', fontSize: 15, color: text, outline: 'none' }}
            />
          </div>

          {error && <div style={{ color: '#ba1a1a', fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: 'center' }}>{error}</div>}
          {msg   && <div style={{ color: '#1a6e3c', fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: 'center' }}>{msg}</div>}

          <button onClick={submit} disabled={loading}
            style={{
              width: '100%', padding: '15px', borderRadius: 13, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 16,
              background: `linear-gradient(135deg, #FFE066, ${goldBtn})`,
              color: goldBtnText,
              opacity: loading ? 0.7 : 1,
              boxShadow: loading ? 'none' : `0 6px 22px rgba(255,196,0,0.42)`,
              transition: 'transform 0.14s ease, box-shadow 0.22s ease',
            }}>
            {loading ? '...' : 'Нууц үг шинэчлэх →'}
          </button>
        </div>
      </div>
    </div>
  );
}
