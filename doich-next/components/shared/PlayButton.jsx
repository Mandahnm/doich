'use client';

import { useState } from 'react';
import { Volume2, Loader } from 'lucide-react';

export default function PlayButton({ wordId, size = 18, color }) {
  const [playing, setPlaying] = useState(false);

  const play = async () => {
    if (playing) return;
    setPlaying(true);
    try {
      const audio = new Audio(`/audio/${wordId}.mp3`);
      audio.onended  = () => setPlaying(false);
      audio.onerror  = () => setPlaying(false);
      await audio.play();
    } catch {
      setPlaying(false);
    }
  };

  return (
    <button onClick={play} disabled={playing}
      style={{ background: 'none', border: 'none', cursor: playing ? 'default' : 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: playing ? 0.6 : 1 }}>
      {playing
        ? <Loader size={size} color={color} style={{ animation: 'spin 1s linear infinite' }} />
        : <Volume2 size={size} color={color} />}
    </button>
  );
}
