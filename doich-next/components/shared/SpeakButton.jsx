'use client';

import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { speak } from '@/lib/speak';

export default function SpeakButton({ text, t, size = 20 }) {
  const [active, setActive] = useState(false);

  const handle = e => {
    e.stopPropagation();
    speak(text);
    setActive(true);
    setTimeout(() => setActive(false), 600);
  };

  return (
    <button onClick={handle}
      style={{
        width: 40, height: 40, borderRadius: 20, border: 'none', cursor: 'pointer',
        background: active ? t.pinkBg : t.bgTag,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'background 0.2s',
      }}>
      <Volume2 size={size} color={active ? t.pink : t.textSoft} />
    </button>
  );
}
