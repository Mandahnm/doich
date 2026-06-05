'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, Loader } from 'lucide-react';
import SessionHeader from './SessionHeader';
import PlayButton from './PlayButton';
import { supabase } from '@/lib/supabase';

const TYPE_LABEL = { noun: 'нэр үг', verb: 'үйл үг', adj: 'тэмдэг нэр', adv: 'дайвар үг' };

function normalize(s) {
  return s.trim().toLowerCase()
    .replace(/[.,!?;:„"«»]/g, '')
    .replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function matchesWord(transcript, word) {
  const said = normalize(transcript);
  const bare = normalize(word.de).replace(/^(der|die|das) /, '');
  const withArt = word.gender ? `${word.gender} ${bare}` : null;

  if (said === bare || (withArt && said === withArt)) return true;
  if (said.split(' ').includes(bare)) return true;

  const maxDist = bare.length >= 10 ? 2 : bare.length >= 5 ? 1 : 0;
  if (maxDist > 0 && levenshtein(said, bare) <= maxDist) return true;

  return false;
}

// status: 'idle' | 'recording' | 'processing' | 'correct'

export default function SpeakingCard({ t, stage, word, progress, onContinue, onQuit }) {
  const [status,    setStatus]    = useState('idle');
  const [supported, setSupported] = useState(true);
  const recorderRef = useRef(null);
  const chunksRef   = useRef([]);
  const autoStopRef = useRef(null);

  const bareWord = word.de.replace(/^(der|die|das) /, '');

  const stopRecorder = useCallback(() => {
    clearTimeout(autoStopRef.current);
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  const sendAudio = useCallback(async (blob) => {
    setStatus('processing');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const form = new FormData();
      form.append('audio', blob, 'recording.webm');

      const res = await fetch('/api/pronounce', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: form,
      });
      const { transcript } = await res.json();

      if (transcript && matchesWord(transcript, word)) {
        setStatus('correct');
        setTimeout(() => onContinue(true), 1400);
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  }, [word, onContinue]);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setSupported(false); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        sendAudio(blob);
      };

      recorderRef.current = recorder;
      recorder.start();
      setStatus('recording');

      // Auto-stop after 5s
      autoStopRef.current = setTimeout(() => stopRecorder(), 5000);
    } catch {
      setSupported(false);
    }
  }, [sendAudio, stopRecorder]);

  // Reset on new word
  useEffect(() => {
    stopRecorder();
    setStatus('idle');
  }, [word, stopRecorder]);

  // Cleanup on unmount
  useEffect(() => () => { stopRecorder(); }, [stopRecorder]);

  const micLabel = {
    idle:       'Дэлгэц дарж дуудлага хийнэ үү',
    recording:  'Сонсож байна... дахин дарж зогсооно уу',
    processing: 'Шалгаж байна...',
  }[status] ?? '';

  return (
    <div className="af">
      <SessionHeader t={t} progress={progress} idx={stage.idx} total={stage.words.length} onQuit={onQuit} cefr={stage.id.split('-')[1]} />

      {/* Word card */}
      <div style={{ background: t.bgCard, borderRadius: 24, padding: '32px 22px', marginBottom: 20, textAlign: 'center', boxShadow: t.shadowLg }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
          <div className="fd" style={{ fontSize: bareWord.length > 14 ? 26 : 38, fontWeight: 800, color: t.text, lineHeight: 1.1 }}>
            {word.gender && <span style={{ color: t.pink }}>{word.gender} </span>}
            {bareWord}
          </div>
          <PlayButton wordId={word.id} size={22} color={t.textMid} />
        </div>
        <div style={{ color: t.textMid, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{word.mn}</div>
        <span style={{ background: t.bgTag, color: t.textSoft, fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20 }}>
          {TYPE_LABEL[word.type]} · {word.level}
        </span>
      </div>

      {/* Mic / success area */}
      {status === 'correct' ? (
        <div style={{ background: t.darkMode ? '#14532D44' : '#F0FDF4', border: `2px solid ${t.correct}`, borderRadius: 24, padding: '36px', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>✓</div>
          <div style={{ fontWeight: 800, fontSize: 24, color: t.correct }}>Зөв!</div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ color: t.textMid, fontSize: 13, fontWeight: 600, marginBottom: 24, minHeight: 20 }}>
            {!supported ? 'Таны браузер микрофон дэмждэггүй' : micLabel}
          </div>

          <button
            onClick={status === 'recording' ? stopRecorder : startRecording}
            disabled={!supported || status === 'processing'}
            style={{
              width: 88, height: 88, borderRadius: 44, border: 'none',
              cursor: !supported || status === 'processing' ? 'not-allowed' : 'pointer',
              background: status === 'recording'
                ? 'linear-gradient(135deg,#FF6FA8,#A78BFA)'
                : t.bgCard,
              boxShadow: status === 'recording'
                ? '0 0 0 14px rgba(255,111,168,0.15), 0 8px 28px rgba(255,111,168,0.4)'
                : t.shadowLg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s',
              animation: status === 'recording' ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}>
            {status === 'processing'
              ? <Loader size={32} color={t.textMid} style={{ animation: 'spin 1s linear infinite' }} />
              : status === 'recording'
              ? <Square size={28} color="#fff" fill="#fff" />
              : <Mic size={36} color={t.textMid} />}
          </button>

          {status === 'recording' && (
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 4 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width: 4, borderRadius: 2, background: t.pink, animation: `pulse ${0.6 + i * 0.15}s ease-in-out infinite`, height: 8 + i * 4 }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Skip */}
      {status !== 'correct' && (
        <button onClick={() => { stopRecorder(); onContinue(false); }}
          style={{ width: '100%', padding: '14px', borderRadius: 16, border: `1.5px solid ${t.border}`, background: 'transparent', color: t.textSoft, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Алгасах →
        </button>
      )}
    </div>
  );
}
