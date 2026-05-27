'use client';

import { useState, useMemo } from 'react';
import FlashCard            from '@/components/shared/FlashCard';
import GenderCard           from '@/components/shared/GenderCard';
import MatchCard            from '@/components/shared/MatchCard';
import FillBlankCard        from '@/components/shared/FillBlankCard';
import ConjugationCard      from '@/components/shared/ConjugationCard';
import ListeningCard        from '@/components/shared/ListeningCard';
import SentenceBuilderCard  from '@/components/shared/SentenceBuilderCard';
import { buildDailyQueue } from '@/lib/daily';
import { calcStageXP } from '@/lib/xp';

const STAT_KEY = {
  flashcard:   'flashcards',
  gender:      'gender',
  fillblank:   'fillblank',
  listening:   'listening',
  sentence:    'sentence',
  conjugation: 'conjugation',
  adjective:   'adjective',
};

export default function DailyPracticeScreen({ t, state, recordStat, addXP, checkStreak, markDailyDone, onQuit }) {
  const queue = useMemo(() => buildDailyQueue(state.userLevel), [state.userLevel]);

  const [idx,      setIdx]      = useState(0);
  const [score,    setScore]    = useState(0);
  const [total,    setTotal]    = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [view,     setView]     = useState('session');

  const completeDaily = (finalScore, finalTotal) => {
    const xp = calcStageXP(state.userLevel, finalScore, finalTotal) + 50;
    addXP(xp);
    checkStreak();
    markDailyDone();
    setXpEarned(xp);
    setView('result');
  };

  const advance = (newScore, newTotal) => {
    const nextIdx = idx + 1;
    if (nextIdx >= queue.length) {
      completeDaily(newScore, newTotal);
    } else {
      setIdx(nextIdx);
    }
  };

  const handleContinue = isCorrect => {
    const item     = queue[idx];
    recordStat(STAT_KEY[item.type], isCorrect);
    const newScore = score + (isCorrect ? 1 : 0);
    const newTotal = total + 1;
    setScore(newScore);
    setTotal(newTotal);
    advance(newScore, newTotal);
  };

  const handleMatchComplete = (correct, matchTotal) => {
    for (let i = 0; i < matchTotal; i++) recordStat('match', i < correct);
    const newScore = score + correct;
    const newTotal = total + matchTotal;
    setScore(newScore);
    setTotal(newTotal);
    advance(newScore, newTotal);
  };

  if (view === 'result') {
    return <DailyResult t={t} score={score} total={total} xpEarned={xpEarned} onDone={onQuit} />;
  }

  if (idx >= queue.length) return null;

  const item      = queue[idx];
  const progress  = idx / queue.length;
  // Stage mock so existing card components get correct idx/total/cefr
  const mockStage = { id: `daily-${state.userLevel}`, idx, words: queue };

  if (item.type === 'match') {
    return <MatchCard t={t} stage={mockStage} words={item.words}
      onComplete={handleMatchComplete} onQuit={onQuit} />;
  }
  if (item.type === 'flashcard') {
    return <FlashCard t={t} stage={mockStage} word={item.word} progress={progress}
      onContinue={handleContinue} onQuit={onQuit} />;
  }
  if (item.type === 'gender') {
    return <GenderCard t={t} stage={mockStage} word={item.word} progress={progress}
      onContinue={handleContinue} onQuit={onQuit} />;
  }
  if (item.type === 'fillblank') {
    return <FillBlankCard t={t} stage={mockStage} word={item.word} progress={progress}
      onContinue={handleContinue} onQuit={onQuit} />;
  }
  if (item.type === 'listening') {
    return <ListeningCard t={t} stage={mockStage} word={item.word} progress={progress}
      onContinue={handleContinue} onQuit={onQuit} />;
  }
  if (item.type === 'sentence') {
    return <SentenceBuilderCard t={t} stage={mockStage} word={item.word} progress={progress}
      onContinue={handleContinue} onQuit={onQuit} />;
  }
  if (item.type === 'conjugation') {
    return <ConjugationCard t={t} exercise={item.exercise} idx={idx} total={queue.length}
      onContinue={handleContinue} onQuit={onQuit} />;
  }
  if (item.type === 'adjective') {
    return <ConjugationCard t={t} exercise={item.exercise} idx={idx} total={queue.length}
      label="ТЭМДЭГ НЭРИЙН ТӨГСГӨЛИЙГ БИЧНЭ ҮҮ"
      onContinue={handleContinue} onQuit={onQuit} />;
  }
  return null;
}

function DailyResult({ t, score, total, xpEarned, onDone }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '78vh', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <div className="fd" style={{ fontSize: 24, fontWeight: 800, color: t.text, marginBottom: 6 }}>Өдөр тутмын дасгал дууслаа!</div>
      <div style={{ color: t.textMid, fontSize: 13, marginBottom: 28 }}>Маргааш дахин ирээрэй 💪</div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 24, width: '100%' }}>
        <div style={{ flex: 1, background: t.bgCard, borderRadius: 20, padding: '18px 12px', boxShadow: t.shadow }}>
          <div className="fd" style={{ fontSize: 30, fontWeight: 800, color: t.pink }}>{score}/{total}</div>
          <div style={{ color: t.textMid, fontSize: 12, marginTop: 4 }}>Зөв хариулт</div>
        </div>
        <div style={{ flex: 1, background: t.bgCard, borderRadius: 20, padding: '18px 12px', boxShadow: t.shadow }}>
          <div className="fd" style={{ fontSize: 30, fontWeight: 800, color: '#A78BFA' }}>+{xpEarned}</div>
          <div style={{ color: t.textMid, fontSize: 12, marginTop: 4 }}>XP олгогдлоо</div>
        </div>
      </div>

      <div style={{ background: t.bgCard, borderRadius: 20, padding: '16px 20px', width: '100%', marginBottom: 28, boxShadow: t.shadow }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: t.textMid, fontSize: 13 }}>Нийт үр дүн</span>
          <span style={{ color: t.pink, fontWeight: 800, fontSize: 13 }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: t.bgTag, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#FF6FA8,#A78BFA)', borderRadius: 4, transition: 'width 0.6s ease' }} />
        </div>
      </div>

      <button onClick={onDone} className="su"
        style={{ width: '100%', padding: '16px', borderRadius: 18, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', background: t.pinkBtn, color: '#fff', boxShadow: t.shadowLg }}>
        Нүүр хуудас руу →
      </button>
    </div>
  );
}
