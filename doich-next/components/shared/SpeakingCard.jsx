'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic } from 'lucide-react';
import SessionHeader from './SessionHeader';
import PlayButton from './PlayButton';

const TYPE_LABEL = { noun: 'нэр үг', verb: 'үйл үг', adj: 'тэмдэг нэр', adv: 'дайвар үг' };

function normalize(s) {
  return s.trim().toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(0).map((_, j) => j === 0 ? i : 0));
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function matchesWord(transcript, word) {
  const said = normalize(transcript);
  const bare = normalize(word.de).replace(/^(der|die|das) /, '');
  const withArt = word.gender ? `${word.gender} ${bare}` : null;

  // exact match
  if (said === bare || (withArt && said === withArt)) return true;

  // transcript contains the target word (handles "der Hund" when target is "Hund")
  if (said.split(' ').includes(bare)) return true;

  // fuzzy: allow 1 edit for words 5+ chars, 2 edits for 10+ chars
  const maxDist = bare.length >= 10 ? 2 : bare.length >= 5 ? 1 : 0;
  if (maxDist > 0 && levenshtein(said, bare) <= maxDist) return true;

  return false;
}

export default function SpeakingCard({ t, stage, word, progress, onContinue, onQuit }) {
  const [listening, setListening] = useState(false);
  const [correct,   setCorrect]   = useState(false);
  const [supported, setSupported] = useState(true);
  const recogRef = useRef(null);

  const bareWord = word.de.replace(/^(der|die|das) /, '');

  const stopListening = useCallback(() => {
    recogRef.current?.abort();
    recogRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const r = new SR();
    r.lang            = 'de-DE';
    r.continuous      = false;
    r.interimResults  = false;
    r.maxAlternatives = 6;

    r.onresult = e => {
      const alts = Array.from(e.results[0]).map(a => a.transcript);
      const ok   = alts.some(alt => matchesWord(alt, word));
      recogRef.current = null;
      setListening(false);
      if (ok) {
        setCorrect(true);
        setTimeout(() => onContinue(true), 1400);
      }
      // wrong → do nothing, user taps mic again
    };

    r.onerror = () => { recogRef.current = null; setListening(false); };
    r.onend   = () => { recogRef.current = null; setListening(false); };

    recogRef.current = r;
    r.start();
    setListening(true);
  }, [word, onContinue]);

  // Reset on new word
  useEffect(() => {
    recogRef.current?.abort();
    recogRef.current = null;
    setListening(false);
    setCorrect(false);
  }, [word]);

  // Cleanup on unmount
  useEffect(() => () => recogRef.current?.abort(), []);

  return (
    <div className="af">
      <SessionHeader t={t} progress={progress} idx={stage.idx} total={stage.words.length} onQuit={onQuit} cefr={stage.id.split('-')[1]} />

      {/* Word card */}
      <div style={{
        background: t.bgCard, borderRadius: 24, padding: '32px 22px',
        marginBottom: 20, textAlign: 'center', boxShadow: t.shadowLg,
      }}>
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
      {correct ? (
        <div style={{
          background: t.darkMode ? '#14532D44' : '#F0FDF4',
          border: `2px solid ${t.correct}`,
          borderRadius: 24, padding: '36px',
          textAlign: 'center', marginBottom: 20,
        }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>✓</div>
          <div style={{ fontWeight: 800, fontSize: 24, color: t.correct }}>Зөв!</div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ color: t.textMid, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            {!supported
              ? 'Таны браузер дуу хүлээн авахыг дэмждэггүй'
              : listening
              ? 'Сонсож байна...'
              : 'Дэлгэц дарж дуудлага хийнэ үү'}
          </div>

          <button
            onClick={listening ? stopListening : startListening}
            disabled={!supported}
            style={{
              width: 88, height: 88, borderRadius: 44,
              border: 'none', cursor: supported ? 'pointer' : 'not-allowed',
              background: listening
                ? 'linear-gradient(135deg,#FF6FA8,#A78BFA)'
                : t.bgCard,
              boxShadow: listening
                ? '0 0 0 14px rgba(255,111,168,0.15), 0 8px 28px rgba(255,111,168,0.4)'
                : t.shadowLg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s',
              animation: listening ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}>
            <Mic size={36} color={listening ? '#fff' : t.textMid} />
          </button>
        </div>
      )}

      {/* Skip */}
      {!correct && (
        <button onClick={() => { stopListening(); onContinue(false); }}
          style={{
            width: '100%', padding: '14px', borderRadius: 16,
            border: `1.5px solid ${t.border}`,
            background: 'transparent', color: t.textSoft,
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>
          Алгасах →
        </button>
      )}
    </div>
  );
}
