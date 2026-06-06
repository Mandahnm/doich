'use client';

import { useState } from 'react';
import { ArrowLeft, Lock, MapPin, Star, Play, Layers, Tag, PenLine, Shuffle, RefreshCw, Pencil, Headphones, AlignLeft, Mic } from 'lucide-react';
import { LEVELS, CEFR_META, getStages } from '@/lib/vocab';
import { calcStageXP } from '@/lib/xp';
import FlashCard           from '@/components/shared/FlashCard';
import GenderCard          from '@/components/shared/GenderCard';
import MatchCard           from '@/components/shared/MatchCard';
import FillBlankCard       from '@/components/shared/FillBlankCard';
import ConjugationCard     from '@/components/shared/ConjugationCard';
import ListeningCard       from '@/components/shared/ListeningCard';
import SentenceBuilderCard from '@/components/shared/SentenceBuilderCard';
import SpeakingCard        from '@/components/shared/SpeakingCard';
import { getConjugationStages } from '@/lib/conjugation';
import { getAdjectiveStages }   from '@/lib/adjective';
import ResultScreen from '@/components/shared/ResultScreen';
import { WithSkeleton, GamesSkeleton } from '@/components/shared/ScreenSkeleton';

const CONJ_TYPES = new Set(['conjugation', 'adjective']);

const GAME_SUBTITLE = {
  flashcard:   'Үг таах',
  gender:      'Der · Die · Das',
  match:       'Хос тааруулах',
  fillblank:   'Цоорхой бөглөх',
  conjugation: 'Үйл үг хувилах',
  adjective:   'Тэмдэг нэр хувилах',
  listening:   'Сонсох дасгал',
  sentence:    'Өгүүлбэр зохиох',
  speaking:    'Дуудлага хийх',
};

const STAT_KEY = {
  flashcard:   'flashcards',
  gender:      'gender',
  match:       'match',
  fillblank:   'fillblank',
  conjugation: 'conjugation',
  adjective:   'adjective',
  listening:   'listening',
  sentence:    'sentence',
  speaking:    'speaking',
};

// ─── Main coordinator ──────────────────────────────────────────────────────────
export default function GamesScreen({ t, state, recordStat, completeStage, recordMistake, clearMistake, addXP, checkStreak }) {
  return <WithSkeleton ms={250} skeleton={<GamesSkeleton t={t} />}><GamesScreenInner t={t} state={state} recordStat={recordStat} completeStage={completeStage} recordMistake={recordMistake} clearMistake={clearMistake} addXP={addXP} checkStreak={checkStreak} /></WithSkeleton>;
}

function GamesScreenInner({ t, state, recordStat, completeStage, recordMistake, clearMistake, addXP, checkStreak }) {
  const [view,         setView]         = useState('hub');
  const [gameType,     setGameType]     = useState(null);
  const [activeCefr,   setActiveCefr]   = useState(null);
  const [activeStage,  setActiveStage]  = useState(null);
  const [sessionScore, setSessionScore] = useState(0);

  const startStage = stage => {
    const shuffled = [...stage.words].sort(() => Math.random() - 0.5);
    setActiveStage({ ...stage, words: shuffled, idx: 0 });
    setSessionScore(0);
    setView('session');
  };

  const handleMatchComplete = (correct, total) => {
    for (let i = 0; i < total; i++) recordStat('match', i < correct);
    completeStage(activeStage.id);
    const xpEarned = calcStageXP(activeCefr, correct, total);
    addXP(xpEarned);
    checkStreak();
    setActiveStage(s => ({ ...s, finalScore: correct, xpEarned }));
    setView('result');
  };

  const handleContinue = isCorrect => {
    recordStat(STAT_KEY[gameType] ?? gameType, isCorrect);
    const newScore = sessionScore + (isCorrect ? 1 : 0);
    setSessionScore(newScore);
    const nextIdx = activeStage.idx + 1;
    if (nextIdx >= activeStage.words.length) {
      completeStage(activeStage.id);
      const cefrForXP = activeCefr ?? activeStage.words[0]?.level ?? 'A1';
      const xpEarned  = calcStageXP(cefrForXP, newScore, activeStage.words.length);
      addXP(xpEarned);
      checkStreak();
      setActiveStage(s => ({ ...s, idx: nextIdx, finalScore: newScore, xpEarned }));
      setView('result');
    } else {
      setActiveStage(s => ({ ...s, idx: nextIdx }));
    }
  };

  if (view === 'hub') return (
    <GamesHub t={t} state={state} userLevel={state.userLevel}
      onSelect={(type, level) => {
        setGameType(type);
        setActiveCefr(CONJ_TYPES.has(type) ? null : level);
        setView('stages');
      }} />
  );

  if (view === 'stages') {
    const preStages = gameType === 'conjugation' ? getConjugationStages()
                    : gameType === 'adjective'   ? getAdjectiveStages()
                    : null;
    return (
      <StageSelect t={t} gameType={gameType} cefr={activeCefr} stages={preStages}
        state={state}
        onBack={() => setView('hub')}
        onSelect={startStage} />
    );
  }

  if (view === 'session') {
    if (gameType === 'match') {
      return <MatchCard t={t} stage={activeStage} words={activeStage.words}
        onComplete={handleMatchComplete} onQuit={() => setView('stages')} />;
    }
    const ex       = activeStage.words[activeStage.idx];
    const progress = activeStage.idx / activeStage.words.length;
    if (!ex) return null;
    if (gameType === 'conjugation') {
      return <ConjugationCard t={t} exercise={ex} idx={activeStage.idx} total={activeStage.words.length}
        onContinue={handleContinue} onQuit={() => setView('stages')} />;
    }
    if (gameType === 'adjective') {
      return <ConjugationCard t={t} exercise={ex} idx={activeStage.idx} total={activeStage.words.length}
        label="ТЭМДЭГ НЭРИЙН ТӨГСГӨЛИЙГ БИЧНЭ ҮҮ"
        onContinue={handleContinue} onQuit={() => setView('stages')} />;
    }
    if (gameType === 'flashcard')  return <FlashCard     t={t} stage={activeStage} word={ex} progress={progress} onContinue={handleContinue} onQuit={() => setView('stages')} />;
    if (gameType === 'gender')     return <GenderCard    t={t} stage={activeStage} word={ex} progress={progress} onContinue={handleContinue} onQuit={() => setView('stages')} />;
    if (gameType === 'fillblank')  return <FillBlankCard t={t} stage={activeStage} word={ex} progress={progress} onContinue={handleContinue} onQuit={() => setView('stages')} />;
    if (gameType === 'listening')  return <ListeningCard       t={t} stage={activeStage} word={ex} progress={progress} onContinue={handleContinue} onQuit={() => setView('stages')} />;
    if (gameType === 'sentence')   return <SentenceBuilderCard t={t} stage={activeStage} word={ex} progress={progress} onContinue={handleContinue} onQuit={() => setView('stages')} />;
    if (gameType === 'speaking')   return <SpeakingCard        t={t} stage={activeStage} word={ex} progress={progress} onContinue={handleContinue} onQuit={() => setView('stages')} />;
  }

  if (view === 'result') {
    let nextStage = null;
    if (activeCefr) {
      const all    = getStages(gameType, activeCefr);
      const curIdx = all.findIndex(s => s.id === activeStage.id);
      nextStage = all[curIdx + 1] ?? null;
    } else if (gameType === 'conjugation') {
      const all    = getConjugationStages();
      const curIdx = all.findIndex(s => s.id === activeStage.id);
      nextStage = all[curIdx + 1] ?? null;
    } else if (gameType === 'adjective') {
      const all    = getAdjectiveStages();
      const curIdx = all.findIndex(s => s.id === activeStage.id);
      nextStage = all[curIdx + 1] ?? null;
    }
    return (
      <ResultScreen t={t} stage={activeStage}
        score={activeStage?.finalScore ?? sessionScore}
        xpEarned={activeStage?.xpEarned ?? 0}
        onReplay={() => startStage(activeStage)}
        onBack={() => setView('stages')}
        onNext={nextStage ? () => startStage(nextStage) : null} />
    );
  }

  return null;
}

// ─── Hub — level picker + all games grid ──────────────────────────────────────
const ALL_GAMES = [
  { type: 'flashcard',   title: 'Үг таах',             sub: 'Үг цээжлэх',            Icon: Layers,     iconColor: '#0062a1', bg: '#dceeff' },
  { type: 'gender',      title: 'Der · Die · Das',      sub: 'Зөв артиклийг сонго',   Icon: Tag,        iconColor: '#bc0000', bg: '#ffdad4' },
  { type: 'fillblank',   title: 'Цоорхой бөглөх',      sub: 'Дутуу үгийг бөглө',     Icon: PenLine,    iconColor: '#745b00', bg: '#fff8d4' },
  { type: 'match',       title: 'Хос тааруулах',        sub: 'Орчуулгыг тааруул',     Icon: Shuffle,    iconColor: '#0062a1', bg: '#dceeff' },
  { type: 'conjugation', title: 'Үйл үг хувилах',      sub: 'Цаг, биеэр хувилах',    Icon: RefreshCw,  iconColor: '#0891b2', bg: '#cffafe' },
  { type: 'adjective',   title: 'Тэмдэг нэр',          sub: 'Тохирох төгсгөлийг бич', Icon: Pencil,     iconColor: '#7c3aed', bg: '#ede9fe' },
  { type: 'listening',   title: 'Сонсох дасгал',        sub: 'Сонсоод бичнэ үү',      Icon: Headphones, iconColor: '#db2777', bg: '#fce7f3' },
  { type: 'sentence',    title: 'Өгүүлбэр зохиох',     sub: 'Үгсийн дараалал',       Icon: AlignLeft,  iconColor: '#059669', bg: '#d1fae5' },
  { type: 'speaking',   title: 'Дуудлага хийх',        sub: 'Микрофонд дуудлага хий', Icon: Mic,        iconColor: '#7c3aed', bg: '#f3e8ff' },
];

function GamesHub({ t, state, userLevel, onSelect }) {
  const [selectedLevel, setSelectedLevel] = useState(userLevel || 'A1');

  return (
    <div className="af">
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em' }}>ТОГЛООМУУД 🎮</div>
      </div>

      {/* Level pills — horizontal scroll with visible overflow */}
      <div style={{
        display: 'flex', gap: 8,
        overflowX: 'scroll',
        paddingBottom: 8, paddingRight: 16, marginBottom: 22,
        WebkitOverflowScrolling: 'touch',
      }}>
        {LEVELS.map(lv => {
          const active = selectedLevel === lv;
          return (
            <button key={lv} onClick={() => setSelectedLevel(lv)}
              style={{
                padding: '8px 16px', borderRadius: 22, fontWeight: 700, fontSize: 13,
                border: `2px solid ${active ? t.pinkBtn : t.border}`,
                background: active ? t.pinkBtn : t.bgCard,
                color: active ? t.pinkBtnText : t.textMid,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                boxShadow: active ? `0 2px 10px ${t.darkMode ? 'rgba(201,160,0,0.35)' : 'rgba(255,204,0,0.45)'}` : 'none',
                transition: 'all 0.15s',
              }}>
              {lv} {CEFR_META[lv].title}
            </button>
          );
        })}
      </div>

      {/* All 8 games in uniform 2×4 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {ALL_GAMES.map((g, i) => (
          <button key={g.type} onClick={() => onSelect(g.type, selectedLevel)} className="au"
            style={{
              position: 'relative', overflow: 'hidden',
              background: t.bgCard, borderRadius: 20,
              padding: '18px 14px 16px',
              border: `1px solid ${t.border}`,
              cursor: 'pointer', textAlign: 'left',
              boxShadow: t.shadow, minHeight: 148,
              display: 'flex', flexDirection: 'column',
              animationDelay: `${i * 45}ms`,
            }}>
            {/* Decorative circle top-right */}
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 86, height: 86, borderRadius: '50%',
              background: t.darkMode ? (g.bg + '28') : (g.bg + 'bb'),
              pointerEvents: 'none',
            }} />
            {/* Icon box */}
            <div style={{
              width: 46, height: 46, borderRadius: 13,
              background: t.darkMode ? (g.bg + '35') : g.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 'auto',
            }}>
              <g.Icon size={22} color={g.iconColor} strokeWidth={2} />
            </div>
            {/* Text */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontWeight: 800, color: t.text, fontSize: 14, lineHeight: 1.2 }}>{g.title}</div>
              <div style={{ color: t.textSoft, fontSize: 12, marginTop: 3 }}>{g.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Journey / Stage path ──────────────────────────────────────────────────────
function StageSelect({ t, gameType, cefr, stages: stagesProp, state, onBack, onSelect }) {
  const stages = stagesProp ?? getStages(gameType, cefr);
  const m      = cefr ? CEFR_META[cefr] : null;
  const isConj = CONJ_TYPES.has(gameType);

  return (
    <div className="af">
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack}
          style={{ width: 38, height: 38, borderRadius: 14, background: t.bgCard, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: t.shadow, flexShrink: 0 }}>
          <ArrowLeft size={18} color={t.textMid} />
        </button>
        <div>
          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em' }}>
            {GAME_SUBTITLE[gameType]?.toUpperCase()}
          </div>
          <div className="fd" style={{ fontSize: 20, fontWeight: 800, color: t.text }}>
            {cefr ? `${cefr} · ${m.title}` : GAME_SUBTITLE[gameType]}
          </div>
        </div>
      </div>

      {/* Journey header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: t.text }}>Journey</div>
        {cefr && (
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: t.textMid }}>
            {cefr} · {m.title}
          </div>
        )}
      </div>

      {/* Stage path container */}
      <div style={{ background: t.bgCard, borderRadius: 24, padding: '28px 20px 24px', border: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {stages.map((stage, i) => {
            const done     = !!state.completedStages?.[stage.id];
            const isNext   = !done && (i === 0 || !!state.completedStages?.[stages[i - 1]?.id]);
            const isLocked = !done && !isNext;

            const circleBg = done   ? (t.darkMode ? '#2e2300' : '#3d2c00')
                           : isNext ? (t.darkMode ? '#002050' : '#003470')
                           : t.bgTag;
            const circleBorder = done   ? `3px solid ${t.darkMode ? '#6b5200' : '#5a3e00'}`
                               : isNext ? `3px solid ${t.darkMode ? '#0050b3' : '#00449a'}`
                               : `2px solid ${t.border}`;
            const circleSize = isNext ? 92 : 72;
            const lineColor  = done ? (t.darkMode ? '#5c4800' : '#6b4e00') : t.border;

            return (
              <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {/* Connecting line */}
                {i > 0 && (
                  <div style={{ width: 4, height: 48, background: lineColor, borderRadius: 2, margin: '2px 0' }} />
                )}

                <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Circle button */}
                  <button
                    disabled={isLocked}
                    onClick={() => !isLocked && onSelect(stage)}
                    style={{
                      width: circleSize, height: circleSize,
                      borderRadius: circleSize / 2,
                      background: circleBg,
                      border: circleBorder,
                      boxShadow: isNext
                        ? `0 0 0 10px ${t.darkMode ? 'rgba(0,52,112,0.28)' : 'rgba(0,52,112,0.1)'}, ${t.shadow}`
                        : t.shadow,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      opacity: isLocked ? 0.48 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                    {done ? (
                      <Star size={30} color={t.darkMode ? '#f1c100' : '#ffcc00'} fill={t.darkMode ? '#f1c100' : '#ffcc00'} strokeWidth={0} />
                    ) : isNext ? (
                      <Play size={28} color="#ffffff" fill="#ffffff" strokeWidth={0} />
                    ) : (
                      <Lock size={22} color={t.textSoft} />
                    )}
                  </button>

                  {/* Red pin badge on current stage */}
                  {isNext && (
                    <div style={{
                      position: 'absolute', top: -6, right: -4,
                      width: 22, height: 22, borderRadius: 11,
                      background: '#bc0000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(188,0,0,0.45)',
                    }}>
                      <MapPin size={12} color="#fff" fill="#fff" strokeWidth={0} />
                    </div>
                  )}
                </div>

                {/* Stars */}
                <div style={{ display: 'flex', gap: 3, marginTop: 10, marginBottom: 5 }}>
                  {[0, 1, 2].map(si => (
                    <Star key={si} size={13}
                      color={done ? '#ffcc00' : t.border}
                      fill={done ? '#ffcc00' : 'none'}
                      strokeWidth={done ? 0 : 1.5} />
                  ))}
                </div>

                {/* Label */}
                <div style={{ fontWeight: 800, fontSize: 14, color: done ? t.pink : isNext ? t.sky : t.textSoft }}>
                  {stage.stageNum}-р шат
                </div>
                {isNext && (
                  <div style={{ color: t.sky, fontSize: 12, fontWeight: 600, marginTop: 1 }}>Эхлэх</div>
                )}
                <div style={{ color: t.textSoft, fontSize: 11, marginTop: 2, marginBottom: 6 }}>
                  {stage.words.length} {isConj ? 'дасгал' : 'үг'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
