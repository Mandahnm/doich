'use client';

import { useState, useEffect } from 'react';

export default function NameScreen({ isDark, onToggle, onSave }) {
  const [name,      setName]      = useState('');
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const card        = isDark ? '#1e1e1e'                : '#ffffff';
  const text        = isDark ? '#e4e2e1'                : '#1b1c1c';
  const soft        = isDark ? '#7a6e54'                : '#80765f';
  const mid         = isDark ? '#b8a98a'                : '#4e4632';
  const border      = isDark ? 'rgba(255,255,255,0.10)' : '#e4e2e1';
  const goldBtn     = isDark ? '#c9a000'                : '#ffcc00';
  const goldBtnText = isDark ? '#1a1500'                : '#241a00';
  const goldTitle   = isDark ? '#f1c100'                : '#745b00';
  const bgGrad      = isDark
    ? 'linear-gradient(170deg, #1a1500 0%, #121212 50%)'
    : 'linear-gradient(170deg, #FFF8D4 0%, #FFF2DC 50%, #FFF0E8 100%)';

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  const formContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: isDesktop ? 28 : 22, fontWeight: 800, color: text, marginBottom: 8 }}>
          Таны нэр юу вэ?
        </div>
        <div style={{ fontSize: 14, color: soft, lineHeight: 1.6 }}>
          Бид таныг хэрхэн дуудахаа мэдмээр байна
        </div>
      </div>

      {/* Name input */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ color: mid, fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
          Нэр (Name)
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          type="text"
          placeholder="Жишээ нь: Болд"
          autoFocus
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: isDark ? '#252318' : '#fafaf9',
            border: `1.5px solid ${border}`,
            borderRadius: 14,
            fontSize: 16,
            color: text,
            outline: 'none',
            padding: '14px 18px',
            transition: 'border-color 0.18s',
          }}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSave}
        disabled={!name.trim()}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 16,
          border: 'none',
          cursor: name.trim() ? 'pointer' : 'not-allowed',
          fontWeight: 800,
          fontSize: 16,
          background: goldBtn,
          color: goldBtnText,
          opacity: name.trim() ? 1 : 0.5,
          boxShadow: name.trim() ? '0 4px 20px rgba(255,204,0,0.38)' : 'none',
          transition: 'opacity 0.18s',
        }}>
        Үргэлжлүүлэх →
      </button>
    </div>
  );


  if (isDesktop) {
    return (
      <div style={{ minHeight: '100vh', background: bgGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

        <div style={{
          background: card,
          borderRadius: 28,
          padding: '48px 44px',
          width: '100%',
          maxWidth: 460,
          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.10)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: goldTitle, letterSpacing: '-1px' }}>Дойч</div>
          </div>
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bgGrad, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {toggleBtn}
      <div style={{ flex: '0 0 38vh', minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: goldTitle, letterSpacing: '-2px', lineHeight: 1 }}>Дойч</div>
        </div>
      </div>
      <div style={{
        flex: 1,
        background: card,
        borderRadius: '32px 32px 0 0',
        padding: '32px 24px 48px',
        boxShadow: isDark ? '0 -12px 48px rgba(0,0,0,0.55)' : '0 -8px 40px rgba(0,0,0,0.07)',
      }}>
        {formContent}
      </div>
    </div>
  );
}
