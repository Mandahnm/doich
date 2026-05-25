'use client';

import { useState, useEffect } from 'react';
import { getTheme } from '@/lib/theme';
import { loadState, saveState } from '@/lib/storage';
import WelcomeScreen  from '@/components/screens/WelcomeScreen';
import HomeScreen     from '@/components/screens/HomeScreen';
import ReviewScreen   from '@/components/screens/ReviewScreen';
import MistakeScreen  from '@/components/screens/MistakeScreen';
import ChatScreen     from '@/components/screens/ChatScreen';
import GrammarScreen  from '@/components/screens/GrammarScreen';
import GamesScreen    from '@/components/screens/GamesScreen';
import VocabScreen    from '@/components/screens/VocabScreen';
import SettingsScreen      from '@/components/screens/SettingsScreen';
import DailyPracticeScreen from '@/components/screens/DailyPracticeScreen';
import BottomNav           from '@/components/shared/BottomNav';

const DEFAULT_STATE = {
  userLevel: null,
  learnedWords: [],
  darkMode: false,
  completedStages: {},
  mistakes: {},
  stats: { flashcardsCorrect: 0, flashcardsTotal: 0, genderCorrect: 0, genderTotal: 0, matchCorrect: 0, matchTotal: 0, fillblankCorrect: 0, fillblankTotal: 0, conjugationCorrect: 0, conjugationTotal: 0, adjectiveCorrect: 0, adjectiveTotal: 0 },
  xp: 0,
  streak: 0,
  lastStreakDate: null,
  lastDailyDate: null,
};

export default function Page() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [tab, setTab]     = useState('home');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sysDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
    const saved   = loadState();
    if (saved) {
      setState(s => ({ ...DEFAULT_STATE, ...saved }));
    } else {
      setState(s => ({ ...s, darkMode: sysDark }));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveState(state);
  }, [state, loaded]);

  const update        = p => setState(s => ({ ...s, ...p }));
  const toggleLearned = id => setState(s => ({
    ...s,
    learnedWords: s.learnedWords.includes(id)
      ? s.learnedWords.filter(x => x !== id)
      : [...s.learnedWords, id],
  }));
  const completeStage = id => setState(s => ({
    ...s, completedStages: { ...s.completedStages, [id]: true },
  }));
  const recordMistake = (wordId, gameType) => setState(s => ({
    ...s,
    mistakes: {
      ...s.mistakes,
      [wordId]: {
        count: ((s.mistakes || {})[wordId]?.count || 0) + 1,
        gameTypes: [
          ...new Set([...((s.mistakes || {})[wordId]?.gameTypes || []), gameType]),
        ],
      },
    },
  }));
  const clearMistake = wordId => setState(s => {
    const m = { ...(s.mistakes || {}) };
    if (m[wordId]) {
      const n = m[wordId].count - 1;
      if (n <= 0) delete m[wordId];
      else m[wordId] = { ...m[wordId], count: n };
    }
    return { ...s, mistakes: m };
  });
  const addXP        = amount => setState(s => ({ ...s, xp: (s.xp || 0) + amount }));
  const markDailyDone = () => setState(s => ({ ...s, lastDailyDate: new Date().toDateString() }));

  const checkStreak = () => setState(s => {
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (s.lastStreakDate === today) return s;
    const newStreak = s.lastStreakDate === yesterday ? (s.streak || 0) + 1 : 1;
    return { ...s, streak: newStreak, lastStreakDate: today };
  });

  const recordStat = (key, ok) => setState(s => ({
    ...s,
    stats: {
      ...s.stats,
      [`${key}Correct`]: s.stats[`${key}Correct`] + (ok ? 1 : 0),
      [`${key}Total`]:   s.stats[`${key}Total`]   + 1,
    },
  }));

  const t = getTheme(state.darkMode);

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#15121E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#FF6FA8', fontFamily: 'var(--font-nunito)' }}>нэмэх...</div>
      </div>
    );
  }

  if (!state.userLevel) {
    return (
      <WelcomeScreen
        t={t}
        onSelect={lv => update({ userLevel: lv })}
        isDark={state.darkMode}
        onToggle={() => update({ darkMode: !state.darkMode })}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bgMain, color: t.text, paddingBottom: 86 }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 18px 0' }}>
        {tab === 'home'     && <HomeScreen     t={t} state={state} setTab={setTab} />}
        {tab === 'review'   && (
          <ReviewScreen  t={t} state={state} setTab={setTab}
            recordStat={recordStat} recordMistake={recordMistake} clearMistake={clearMistake} />
        )}
        {tab === 'mistakes' && (
          <MistakeScreen t={t} state={state} setTab={setTab}
            recordMistake={recordMistake} clearMistake={clearMistake} />
        )}
        {tab === 'chat'     && <ChatScreen    t={t} state={state} />}
        {tab === 'grammar'  && <GrammarScreen t={t} state={state} />}
        {tab === 'games'    && (
          <GamesScreen   t={t} state={state}
            recordStat={recordStat} completeStage={completeStage}
            recordMistake={recordMistake} clearMistake={clearMistake}
            addXP={addXP} checkStreak={checkStreak} />
        )}
        {tab === 'vocab'    && <VocabScreen    t={t} state={state} toggleLearned={toggleLearned} />}
        {tab === 'settings' && <SettingsScreen t={t} state={state} update={update} />}
        {tab === 'daily'    && (
          <DailyPracticeScreen t={t} state={state}
            recordStat={recordStat} addXP={addXP} checkStreak={checkStreak}
            markDailyDone={markDailyDone}
            recordMistake={recordMistake} clearMistake={clearMistake}
            onQuit={() => setTab('home')} />
        )}
      </div>
      <BottomNav t={t} tab={tab} setTab={setTab} />
    </div>
  );
}
