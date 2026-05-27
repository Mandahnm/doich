'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function PasswordResetScreen({ isDark, onDone }) {
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
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

  const submit = async () => {
    if (password.length < 6) { setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'); return; }
    if (password !== confirm) { setError('Нууц үгнүүд таарахгүй байна'); return; }
    setLoading(true); setError('');
    const { error: e } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (e) { setError(e.message); return; }
    setMsg('Нууц үг амжилттай шинэчлэгдлээ!');
    setTimeout(onDone, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 18px', fontFamily: 'var(--font-nunito)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🔑</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: pink }}>Нууц үг шинэчлэх</div>
          <div style={{ color: mid, fontSize: 14, marginTop: 4 }}>Шинэ нууц үгээ оруулна уу</div>
        </div>

        <div style={{ background: card, borderRadius: 28, padding: '28px 24px', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(167,139,250,0.12)' }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ color: mid, fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>ШИНЭ НУУЦ ҮГ</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color={mid} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input value={password} onChange={e => setPassword(e.target.value)}
                type={showPw ? 'text' : 'password'} placeholder="••••••••"
                style={{ width: '100%', boxSizing: 'border-box', background: isDark ? '#15121E' : '#F8F5FF', border: `2px solid ${border}`, borderRadius: 14, padding: '12px 42px 12px 38px', fontSize: 14, color: text, outline: 'none' }} />
              <button onClick={() => setShowPw(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                {showPw ? <EyeOff size={16} color={mid} /> : <Eye size={16} color={mid} />}
              </button>
            </div>
            <div style={{ color: mid, fontSize: 11, marginTop: 4 }}>Хамгийн багадаа 6 тэмдэгт</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ color: mid, fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>НУУЦ ҮГ ДАВТАХ</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color={mid} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                type={showPw ? 'text' : 'password'} placeholder="••••••••"
                style={{ width: '100%', boxSizing: 'border-box', background: isDark ? '#15121E' : '#F8F5FF', border: `2px solid ${border}`, borderRadius: 14, padding: '12px 14px 12px 38px', fontSize: 14, color: text, outline: 'none' }} />
            </div>
          </div>

          {error && <div style={{ color: '#FF6B6B', fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: 'center' }}>{error}</div>}
          {msg   && <div style={{ color: '#34D399', fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: 'center' }}>{msg}</div>}

          <button onClick={submit} disabled={loading}
            style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 15, background: `linear-gradient(135deg, ${pink}, #A78BFA)`, color: '#fff', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 24px rgba(255,111,168,0.35)' }}>
            {loading ? '...' : 'Нууц үг шинэчлэх →'}
          </button>
        </div>
      </div>
    </div>
  );
}
