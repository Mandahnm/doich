'use client';

import { useState, useEffect, useRef } from 'react';
import { getTheme } from '@/lib/theme';
import { loadState, saveState } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import AuthScreen           from '@/components/screens/AuthScreen';
import PasswordResetScreen  from '@/components/screens/PasswordResetScreen';
import WelcomeScreen        from '@/components/screens/WelcomeScreen';
import HomeScreen        from '@/components/screens/HomeScreen';
import ReviewScreen      from '@/components/screens/ReviewScreen';
import MistakeScreen     from '@/components/screens/MistakeScreen';
import ChatScreen        from '@/components/screens/ChatScreen';
import GrammarScreen     from '@/components/screens/GrammarScreen';
import GamesScreen       from '@/components/screens/GamesScreen';
import VocabScreen       from '@/components/screens/VocabScreen';
import SettingsScreen    from '@/components/screens/SettingsScreen';
import DailyPracticeScreen from '@/components/screens/DailyPracticeScreen';
import BottomNav         from '@/components/shared/BottomNav';

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
  chatHistory: [],
};

export default function Page() {
  const [state,       setState]       = useState(DEFAULT_STATE);
  const [tab,         setTab]         = useState('home');
  const [loaded,      setLoaded]      = useState(false);
  const [user,        setUser]        = useState(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const saveTimer     = useRef(null);
  const userLoadedRef = useRef(false);

  // ── Auth + initial load ──────────────────────────────────────────────────
  useEffect(() => {
    const sysDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
    const localDark = loadState()?.darkMode ?? sysDark;
    setState(s => ({ ...s, darkMode: localDark }));

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        userLoadedRef.current = true;
        setUser(session.user);
        loadProgress(session.user.id);
      } else {
        setLoaded(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user && !userLoadedRef.current) {
        userLoadedRef.current = true;
        setUser(session.user);
        loadProgress(session.user.id);
      }
      if (event === 'PASSWORD_RECOVERY' && session?.user) {
        userLoadedRef.current = true;
        setUser(session.user);
        setShowRecovery(true);
        setLoaded(true);
      }
      if (event === 'SIGNED_OUT') {
        userLoadedRef.current = false;
        setUser(null);
        setShowRecovery(false);
        setState(s => ({ ...DEFAULT_STATE, darkMode: s.darkMode }));
        setTab('home');
        setLoaded(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProgress = async (userId) => {
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setState(s => ({
        ...DEFAULT_STATE,
        darkMode: s.darkMode,
        userLevel:       data.user_level,
        learnedWords:    data.learned_words    || [],
        completedStages: data.completed_stages || {},
        mistakes:        data.mistakes         || {},
        stats:           { ...DEFAULT_STATE.stats, ...(data.stats || {}) },
        xp:              data.xp               || 0,
        streak:          data.streak           || 0,
        lastStreakDate:  data.last_streak_date  || null,
        lastDailyDate:   data.last_daily_date   || null,
        chatHistory:     data.chat_history      || [],
      }));
    }
    setLoaded(true);
  };

  // ── Persist to Supabase (debounced 1.5s) ────────────────────────────────
  useEffect(() => {
    if (!loaded || !user) return;
    saveState(state); // keep localStorage in sync too
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await supabase.from('user_progress').upsert({
        id:               user.id,
        user_level:       state.userLevel,
        learned_words:    state.learnedWords,
        completed_stages: state.completedStages,
        mistakes:         state.mistakes,
        stats:            state.stats,
        xp:               state.xp,
        streak:           state.streak,
        last_streak_date: state.lastStreakDate,
        last_daily_date:  state.lastDailyDate,
        chat_history:     state.chatHistory,
        updated_at:       new Date().toISOString(),
      });
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [state, loaded, user]);

  // ── State helpers ────────────────────────────────────────────────────────
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
        gameTypes: [...new Set([...((s.mistakes || {})[wordId]?.gameTypes || []), gameType])],
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
  const addXP         = amount => setState(s => ({ ...s, xp: (s.xp || 0) + amount }));
  const markDailyDone = () => setState(s => ({ ...s, lastDailyDate: new Date().toDateString() }));
  const checkStreak   = () => setState(s => {
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

  // ── Render ───────────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#15121E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#FF6FA8', fontFamily: 'var(--font-nunito)', fontSize: 18, fontWeight: 800 }}>нэмэх...</div>
      </div>
    );
  }

  if (showRecovery) {
    return (
      <PasswordResetScreen
        isDark={state.darkMode}
        onDone={() => setShowRecovery(false)}
      />
    );
  }

  if (!user) {
    return (
      <AuthScreen
        isDark={state.darkMode}
        onToggle={() => update({ darkMode: !state.darkMode })}
      />
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
        {tab === 'chat'     && <ChatScreen    t={t} state={state} onUpdateHistory={msgs => update({ chatHistory: msgs })} />}
        {tab === 'grammar'  && <GrammarScreen t={t} state={state} />}
        {tab === 'games'    && (
          <GamesScreen   t={t} state={state}
            recordStat={recordStat} completeStage={completeStage}
            recordMistake={recordMistake} clearMistake={clearMistake}
            addXP={addXP} checkStreak={checkStreak} />
        )}
        {tab === 'vocab'    && <VocabScreen    t={t} state={state} toggleLearned={toggleLearned} />}
        {tab === 'settings' && (
          <SettingsScreen t={t} state={state} update={update}
            user={user}
            onLogout={() => supabase.auth.signOut()} />
        )}
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
