'use client';

import { useState } from 'react';
import { ChevronRight, ArrowLeft, Check, Lock } from 'lucide-react';
import { LEVELS, CEFR_META, getStages } from '@/lib/vocab';
import { calcStageXP } from '@/lib/xp';
import FlashCard       from '@/components/shared/FlashCard';
import GenderCard      from '@/components/shared/GenderCard';
import MatchCard       from '@/components/shared/MatchCard';
import FillBlankCard   from '@/components/shared/FillBlankCard';
import ConjugationCard from '@/components/shared/ConjugationCard';
import ListeningCard        from '@/components/shared/ListeningCard';
import SentenceBuilderCard  from '@/components/shared/SentenceBuilderCard';
import { getConjugationStages } from '@/lib/conjugation';
import { getAdjectiveStages }   from '@/lib/adjective';
import ResultScreen from '@/components/shared/ResultScreen';

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
};

// ─── Main coordinator ──────────────────────────────────────
export default function GamesScreen({ t, state, recordStat, completeStage, recordMistake, clearMistake, addXP, checkStreak }) {
  const [view,         setView]        = useState('hub');
  const [gameType,     setGameType]    = useState(null);
  const [activeCefr,   setActiveCefr]  = useState(null);
  const [activeStage,  setActiveStage] = useState(null);
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

  // ── View routing ──
  if (view === 'hub') return (
    <GamesHub t={t} state={state} onSelect={type => {
      setGameType(type);
      if (CONJ_TYPES.has(type)) { setActiveCefr(null); setView('stages'); }
      else setView('cefr');
    }} />
  );

  if (view === 'cefr') return (
    <CEFRSelect t={t} gameType={gameType} state={state}
      onBack={() => setView('hub')}
      onSelect={cefr => { setActiveCefr(cefr); setView('stages'); }} />
  );

  if (view === 'stages') {
    const preStages = gameType === 'conjugation' ? getConjugationStages()
                    : gameType === 'adjective'   ? getAdjectiveStages()
                    : null;
    return (
      <StageSelect t={t} gameType={gameType} cefr={activeCefr} stages={preStages}
        state={state}
        onBack={() => setView(activeCefr ? 'cefr' : 'hub')}
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

// ─── Step 1: game type hub ─────────────────────────────────
function GamesHub({ t, state, onSelect }) {
  const done = prefix => Object.keys(state.completedStages || {}).filter(k => k.startsWith(prefix)).length;

  const GAMES = [
    { type: 'flashcard',   icon: '🎯', title: 'Үг таах',            sub: 'Герман үгийн орчуулгыг 4-өөс сонгох',      color: '#F9709A', doneKey: 'flashcard'   },
    { type: 'gender',      icon: '🏷️', title: 'Der · Die · Das',    sub: 'Нэр үгийн түйсийг тани',                   color: '#A78BFA', doneKey: 'gender'      },
    { type: 'match',       icon: '🔗', title: 'Хос тааруулах',      sub: 'Герман–Монгол үгс хосоор тааруулах',       color: '#34D399', doneKey: 'match'       },
    { type: 'fillblank',   icon: '✍️', title: 'Цоорхой бөглөх',     sub: 'Өгүүлбэрийн цоорхойг зөв үгээр гүйцээ',  color: '#F59E0B', doneKey: 'fillblank'   },
    { type: 'conjugation', icon: '🔤', title: 'Үйл үг хувилах',     sub: 'Үйл үгийн зөв хэлбэрийг бичих',           color: '#06B6D4', doneKey: 'conjugation' },
    { type: 'adjective',   icon: '🔡', title: 'Тэмдэг нэр хувилах', sub: 'Тэмдэг нэрийн зөв төгсгөлийг бичих',      color: '#8B5CF6', doneKey: 'adjective'   },
    { type: 'listening',   icon: '🎧', title: 'Сонсох дасгал',       sub: 'Аудио сонсоод герман үгийг бич',           color: '#EC4899', doneKey: 'listening'   },
    { type: 'sentence',    icon: '🔀', title: 'Өгүүлбэр зохиох',    sub: 'Холилдсон үгсийг зөв дарааллаар байрлуул', color: '#10B981', doneKey: 'sentence'    },
  ];

  return (
    <div className="af">
      <div style={{ marginBottom: 22 }}>
        <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 4 }}>ТОГЛООМУУД 🎮</div>
        <div className="fd" style={{ fontSize: 28, fontWeight: 800, color: t.text }}>Ямар тоглоом тоглох вэ?</div>
      </div>
      {GAMES.map((g, i) => (
        <button key={g.type} onClick={() => onSelect(g.type)} className="au"
          style={{ display: 'flex', alignItems: 'center', gap: 16, background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 22, padding: '20px', cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: 14, boxShadow: t.shadow, animationDelay: `${i * 80}ms` }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: g.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0 }}>{g.icon}</div>
          <div style={{ flex: 1 }}>
            <div className="fd" style={{ fontWeight: 700, color: t.text, fontSize: 17 }}>{g.title}</div>
            <div style={{ color: t.textMid, fontSize: 13, marginTop: 3 }}>{g.sub}</div>
            <div style={{ color: g.color, fontSize: 12, fontWeight: 800, marginTop: 6 }}>{done(g.doneKey)} шат дууссан</div>
          </div>
          <ChevronRight size={20} color={t.textSoft} />
        </button>
      ))}
    </div>
  );
}

// ─── Step 2: CEFR level picker (flashcard / gender / match / fillblank only) ──
function CEFRSelect({ t, gameType, state, onBack, onSelect }) {
  return (
    <div className="af">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 14, background: t.bgCard, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: t.shadow }}>
          <ArrowLeft size={18} color={t.textMid} />
        </button>
        <div>
          <div style={{ color: t.textSoft, fontSize: 11, fontWeight: 800, letterSpacing: '0.18em' }}>{(GAME_SUBTITLE[gameType] ?? gameType).toUpperCase()}</div>
          <div className="fd" style={{ fontSize: 22, fontWeight: 800, color: t.text }}>CEFR түвшин сонгох</div>
        </div>
      </div>
      {LEVELS.map((cefr, i) => {
        const m      = CEFR_META[cefr];
        const stages = getStages(gameType, cefr);
        if (stages.length === 0) return null;
        const doneCt = stages.filter(s => state.completedStages?.[s.id]).length;
        const pct    = doneCt / stages.length;
        return (
          <button key={cefr} onClick={() => onSelect(cefr)} className="au"
            style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: '16px', cursor: 'pointer', width: '100%', textAlign: 'left', boxShadow: t.shadow, marginBottom: 12, animationDelay: `${i * 65}ms` }}>
            <div className="fd" style={{ width: 56, height: 56, borderRadius: 16, background: t.darkMode ? t.bgTag : m.pill, color: t.darkMode ? t.pink : m.pillTxt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, flexShrink: 0 }}>{cefr}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: t.text, fontSize: 15 }}>{m.title}</div>
              <div style={{ color: t.textMid, fontSize: 12, marginTop: 2 }}>{stages.length} шат · {stages.reduce((a, s) => a + s.words.length, 0)} үг</div>
              <div style={{ marginTop: 8, height: 6, background: t.bgTag, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct * 100}%`, background: t.pinkBtn, borderRadius: 3, transition: 'width 0.4s' }} />
              </div>
              <div style={{ color: t.textMid, fontSize: 11, marginTop: 4 }}>{doneCt}/{stages.length} шат дууссан</div>
            </div>
            <ChevronRight size={18} color={t.textSoft} />
          </button>
        );
      })}
    </div>
  );
}

// ─── Step 3: Duolingo-style stage path ─────────────────────
function StageSelect({ t, gameType, cefr, stages: stagesProp, state, onBack, onSelect }) {
  const m       = cefr ? CEFR_META[cefr] : { title: '', pill: '#F9709A33', pillTxt: '#F9709A' };
  const stages  = stagesProp ?? getStages(gameType, cefr);
  const offsets = ['-40px', '0px', '40px', '0px'];
  const isConj  = CONJ_TYPES.has(gameType);

  return (
    <div className="af">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 14, background: t.bgCard, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: t.shadow }}>
          <ArrowLeft size={18} color={t.textMid} />
        </button>
        <div>
          <div className="fd" style={{ fontSize: 22, fontWeight: 800, color: t.text }}>
            {cefr ? `${cefr} · ${m.title}` : GAME_SUBTITLE[gameType]}
          </div>
          <div style={{ color: t.textMid, fontSize: 13 }}>{GAME_SUBTITLE[gameType]}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, paddingBottom: 24 }}>
        {stages.map((stage, i) => {
          const done     = !!state.completedStages?.[stage.id];
          const isNext   = !done && (i === 0 || !!state.completedStages?.[stages[i - 1]?.id]);
          const isLocked = !done && !isNext;
          const offset   = offsets[i % offsets.length];
          return (
            <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {i > 0 && <div style={{ width: 3, height: 36, background: done ? t.pink : t.border, borderRadius: 2 }} />}
              <div className="au" style={{ marginLeft: offset, animationDelay: `${i * 100}ms` }}>
                <button
                  disabled={isLocked}
                  onClick={() => !isLocked && onSelect(stage)}
                  className={done ? 'ap' : ''}
                  style={{
                    width: 90, height: 90, borderRadius: 45,
                    background: done ? (t.darkMode ? m.pill + '33' : m.pill) : isNext ? t.pinkBtn : t.bgCard,
                    border: `4px solid ${done ? m.pillTxt + '80' : isNext ? 'transparent' : t.border}`,
                    boxShadow: isNext ? `0 0 0 6px ${t.pink}30, ${t.shadowLg}` : t.shadow,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.45 : 1,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                  }}>
                  {done
                    ? <Check size={32} color={m.pillTxt} strokeWidth={3} />
                    : isLocked
                      ? <Lock size={24} color={t.textSoft} />
                      : <div className="fd" style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{stage.stageNum}</div>
                  }
                </button>
                <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 8 }}>
                  <div style={{ fontWeight: 800, color: done ? m.pillTxt : isNext ? t.pink : t.textSoft, fontSize: 13 }}>
                    {stage.stageNum}-р шат {done ? '✓' : isNext ? '▶' : '🔒'}
                  </div>
                  <div style={{ color: t.textSoft, fontSize: 11 }}>
                    {stage.words.length} {isConj ? 'дасгал' : gameType === 'flashcard' ? 'үг' : 'нэр үг'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
