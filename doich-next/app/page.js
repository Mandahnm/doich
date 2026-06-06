'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { getTheme } from '@/lib/theme';
import { loadState, saveState } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import AuthScreen           from '@/components/screens/AuthScreen';
import NameScreen            from '@/components/screens/NameScreen';
import PasswordResetScreen  from '@/components/screens/PasswordResetScreen';
import WelcomeScreen        from '@/components/screens/WelcomeScreen';
import HomeScreen        from '@/components/screens/HomeScreen';
import ReviewScreen      from '@/components/screens/ReviewScreen';
import ChatScreen        from '@/components/screens/ChatScreen';
import GrammarScreen     from '@/components/screens/GrammarScreen';
import GamesScreen       from '@/components/screens/GamesScreen';
import VocabScreen       from '@/components/screens/VocabScreen';
import ProfileScreen     from '@/components/screens/ProfileScreen';
import DailyPracticeScreen   from '@/components/screens/DailyPracticeScreen';
import AchievementsScreen    from '@/components/screens/AchievementsScreen';
import ReadingScreen         from '@/components/screens/ReadingScreen';
import AchievementToast      from '@/components/shared/AchievementToast';
import BottomNav             from '@/components/shared/BottomNav';
import DesktopSidebar        from '@/components/shared/DesktopSidebar';
import { ACHIEVEMENTS, getUnlockedIds } from '@/lib/achievements';
import { initSrsEntry, updateSrsEntry } from '@/lib/srs';
import { VOCAB } from '@/lib/vocab';

const DEFAULT_STATE = {
  userLevel: null,
  userName: '',
  learnedWords: [],
  darkMode: false,
  completedStages: {},
  mistakes: {},
  stats: { flashcardsCorrect: 0, flashcardsTotal: 0, genderCorrect: 0, genderTotal: 0, matchCorrect: 0, matchTotal: 0, fillblankCorrect: 0, fillblankTotal: 0, conjugationCorrect: 0, conjugationTotal: 0, adjectiveCorrect: 0, adjectiveTotal: 0, listeningCorrect: 0, listeningTotal: 0, sentenceCorrect: 0, sentenceTotal: 0, dailyCount: 0, srs: {}, customWords: {} },
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
  const [toast,       setToast]       = useState(null);
  const [isDesktop,   setIsDesktop]   = useState(false);
  const saveTimer       = useRef(null);
  const userLoadedRef   = useRef(false);
  const prevUnlockedRef = useRef(null);

  // ── Auth + initial load ──────────────────────────────────────────────────
  useEffect(() => {
    setState(s => ({ ...s, darkMode: false }));

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          userLoadedRef.current = true;
          setUser(session.user);
          loadProgress(session.user.id);
        } else {
          setLoaded(true);
        }
      })
      .catch(() => setLoaded(true));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user && !userLoadedRef.current) {
        userLoadedRef.current = true;
        setLoaded(false);
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

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Achievement unlock detection ────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    const current = getUnlockedIds(state);
    if (prevUnlockedRef.current === null) {
      prevUnlockedRef.current = current;
      return;
    }
    const newOnes = ACHIEVEMENTS.filter(
      a => current.has(a.id) && !prevUnlockedRef.current.has(a.id)
    );
    if (newOnes.length > 0) setToast(newOnes[0]);
    prevUnlockedRef.current = current;
  }, [state, loaded]);

  const loadProgress = async (userId) => {
    try {
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
          userName:        data.user_name        || '',
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
    } finally {
      setLoaded(true);
    }
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
        user_name:        state.userName,
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
  const toggleLearned = id => setState(s => {
    if (s.learnedWords.includes(id)) {
      // Un-learn: remove from list and clear SRS entry
      const newSrs = { ...(s.stats.srs || {}) };
      delete newSrs[id];
      return { ...s, learnedWords: s.learnedWords.filter(x => x !== id), stats: { ...s.stats, srs: newSrs } };
    } else {
      // Learn: add to list and init SRS entry (due tomorrow)
      return {
        ...s,
        learnedWords: [...s.learnedWords, id],
        stats: { ...s.stats, srs: { ...(s.stats.srs || {}), [id]: initSrsEntry() } },
      };
    }
  });
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
  const markDailyDone = () => setState(s => ({
    ...s,
    lastDailyDate: new Date().toDateString(),
    stats: { ...s.stats, dailyCount: (s.stats.dailyCount || 0) + 1 },
  }));
  const checkStreak   = () => setState(s => {
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (s.lastStreakDate === today) return s;
    const newStreak = s.lastStreakDate === yesterday ? (s.streak || 0) + 1 : 1;
    return { ...s, streak: newStreak, lastStreakDate: today };
  });
  const updateSRS = (wordId, isCorrect) => setState(s => ({
    ...s,
    stats: {
      ...s.stats,
      srs: {
        ...(s.stats.srs || {}),
        [wordId]: updateSrsEntry((s.stats.srs || {})[wordId], isCorrect),
      },
    },
  }));

  // Add a story word to SRS — matches against VOCAB first, falls back to customWords
  const addCustomWord = (de, mn) => {
    const key = de.toLowerCase().trim();
    const match = VOCAB.find(w => w.de.toLowerCase() === key);
    if (match) {
      if (!state.learnedWords.includes(match.id)) toggleLearned(match.id);
      return;
    }
    setState(s => {
      if ((s.stats.customWords || {})[key]) return s; // already added
      return {
        ...s,
        stats: {
          ...s.stats,
          customWords: {
            ...(s.stats.customWords || {}),
            [key]: { de, mn, srs: initSrsEntry() },
          },
        },
      };
    });
  };

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
    const isDark = state.darkMode;
    const sk = isDark ? 'sk-dark' : 'sk';
    const bg = isDark ? '#1a1812' : '#f5f0e8';
    const card = isDark ? '#1e1e1e' : '#ffffff';
    return (
      <div style={{ minHeight: '100vh', display: 'flex' }}>
        {/* Desktop: left panel skeleton */}
        <div className="desktop-only" style={{ flex: 1, background: bg, padding: '32px 48px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className={sk} style={{ width: 80, height: 24 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div className={sk} style={{ width: 180, height: 180, borderRadius: 24 }} />
            <div className={sk} style={{ width: 260, height: 28, borderRadius: 8 }} />
            <div className={sk} style={{ width: 220, height: 18, borderRadius: 8 }} />
            <div className={sk} style={{ width: 200, height: 18, borderRadius: 8 }} />
          </div>
        </div>

        {/* Right panel / mobile: form skeleton */}
        <div style={{ width: '100%', maxWidth: 520, background: card, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', gap: 20 }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div className={sk} style={{ flex: 1, height: 44, borderRadius: 10 }} />
            <div className={sk} style={{ flex: 1, height: 44, borderRadius: 10 }} />
          </div>
          {/* Title */}
          <div className={sk} style={{ width: '60%', height: 28, borderRadius: 8 }} />
          <div className={sk} style={{ width: '80%', height: 16, borderRadius: 8 }} />
          {/* Inputs */}
          <div className={sk} style={{ width: '100%', height: 50, borderRadius: 10, marginTop: 8 }} />
          <div className={sk} style={{ width: '100%', height: 50, borderRadius: 10 }} />
          {/* Button */}
          <div className={sk} style={{ width: '100%', height: 52, borderRadius: 12, marginTop: 8 }} />
          {/* Footer link */}
          <div className={sk} style={{ width: '50%', height: 14, borderRadius: 8, margin: '0 auto' }} />
        </div>
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

  if (!state.userName) {
    return (
      <NameScreen
        isDark={state.darkMode}
        onToggle={() => update({ darkMode: !state.darkMode })}
        onSave={name => update({ userName: name })}
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

  const screenContent = (
    <>
      {tab === 'home'     && <HomeScreen     t={t} state={state} setTab={setTab} isDesktop={isDesktop} />}
      {tab === 'review'   && (
        <ReviewScreen  t={t} state={state} setTab={setTab}
          recordStat={recordStat} recordMistake={recordMistake} clearMistake={clearMistake}
          updateSRS={updateSRS} />
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
      {tab === 'profile' && (
        <ProfileScreen t={t} state={state} update={update}
          user={user} setTab={setTab}
          onLogout={() => supabase.auth.signOut()} />
      )}
      {tab === 'daily'    && (
        <DailyPracticeScreen t={t} state={state}
          recordStat={recordStat} addXP={addXP} checkStreak={checkStreak}
          markDailyDone={markDailyDone}
          recordMistake={recordMistake} clearMistake={clearMistake}
          onQuit={() => setTab('home')} />
      )}
      {tab === 'achievements' && <AchievementsScreen t={t} state={state} />}
      {tab === 'reading'     && (
        <ReadingScreen
          t={t} state={state} user={user}
          addXP={addXP} checkStreak={checkStreak}
          toggleLearned={toggleLearned} addCustomWord={addCustomWord}
        />
      )}
    </>
  );

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: t.bgMain, color: t.text }}>
        <DesktopSidebar tab={tab} setTab={setTab} t={t} state={state} />
        <main style={{ flex: 1, minHeight: '100vh', overflowY: 'auto', padding: '24px 32px' }}>
          {screenContent}
        </main>
        <AchievementToast achievement={toast} onDone={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bgMain, color: t.text, paddingBottom: 86 }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 18px 0' }}>
        {screenContent}
      </div>
      <BottomNav t={t} tab={tab} setTab={setTab} />
      {tab !== 'chat' && (
        <button
          onClick={() => setTab('chat')}
          aria-label="AI багш нээх"
          style={{
            position: 'fixed', bottom: 96, right: 20, zIndex: 100,
            width: 52, height: 52, borderRadius: 18,
            background: state.darkMode ? '#f1c100' : '#ffcc00',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(255,180,0,0.45)',
          }}
        >
          <Bot size={24} color={state.darkMode ? '#1a1812' : '#241a00'} strokeWidth={2.2} />
        </button>
      )}
      <AchievementToast achievement={toast} onDone={() => setToast(null)} />
    </div>
  );
}
