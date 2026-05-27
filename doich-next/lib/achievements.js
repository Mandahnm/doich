// Achievement definitions
// check(state) → boolean  — whether the achievement is unlocked
// getValue(state) → number — current progress value (for progress bar)
// max → number            — target value

export const ACHIEVEMENTS = [
  // ── Vocabulary ─────────────────────────────────────────────────────────
  {
    id: 'words_1',  icon: '🌱', title: 'Эхлэл',
    desc: 'Анхны үгээ сур',
    category: 'vocab',
    max: 1,   getValue: s => s.learnedWords.length,
    check:    s => s.learnedWords.length >= 1,
  },
  {
    id: 'words_10', icon: '📚', title: 'Жижиг сан',
    desc: '10 үг сурсан',
    category: 'vocab',
    max: 10,  getValue: s => s.learnedWords.length,
    check:    s => s.learnedWords.length >= 10,
  },
  {
    id: 'words_50', icon: '🎒', title: 'Оюутан',
    desc: '50 үг сурсан',
    category: 'vocab',
    max: 50,  getValue: s => s.learnedWords.length,
    check:    s => s.learnedWords.length >= 50,
  },
  {
    id: 'words_100', icon: '🏆', title: 'Том сан',
    desc: '100 үг сурсан',
    category: 'vocab',
    max: 100, getValue: s => s.learnedWords.length,
    check:    s => s.learnedWords.length >= 100,
  },
  {
    id: 'words_250', icon: '💎', title: 'Мастер',
    desc: '250 үг сурсан',
    category: 'vocab',
    max: 250, getValue: s => s.learnedWords.length,
    check:    s => s.learnedWords.length >= 250,
  },
  {
    id: 'words_500', icon: '👑', title: 'Домог',
    desc: '500 үг сурсан',
    category: 'vocab',
    max: 500, getValue: s => s.learnedWords.length,
    check:    s => s.learnedWords.length >= 500,
  },

  // ── Streak ─────────────────────────────────────────────────────────────
  {
    id: 'streak_3', icon: '🔥', title: 'Анхны гал',
    desc: '3 өдрийн тасралтгүй',
    category: 'streak',
    max: 3,  getValue: s => s.streak || 0,
    check:   s => (s.streak || 0) >= 3,
  },
  {
    id: 'streak_7', icon: '⚡', title: 'Тууштай',
    desc: '7 өдрийн тасралтгүй',
    category: 'streak',
    max: 7,  getValue: s => s.streak || 0,
    check:   s => (s.streak || 0) >= 7,
  },
  {
    id: 'streak_14', icon: '🌟', title: 'Тасралтгүй',
    desc: '14 өдрийн тасралтгүй',
    category: 'streak',
    max: 14, getValue: s => s.streak || 0,
    check:   s => (s.streak || 0) >= 14,
  },
  {
    id: 'streak_30', icon: '🎯', title: 'Дадал зуршил',
    desc: '30 өдрийн тасралтгүй',
    category: 'streak',
    max: 30, getValue: s => s.streak || 0,
    check:   s => (s.streak || 0) >= 30,
  },

  // ── Flashcards ─────────────────────────────────────────────────────────
  {
    id: 'flash_10', icon: '🎴', title: 'Зөн билигч',
    desc: 'Флэшкард 10 зөв хариулсан',
    category: 'games',
    max: 10,  getValue: s => s.stats?.flashcardsCorrect || 0,
    check:    s => (s.stats?.flashcardsCorrect || 0) >= 10,
  },
  {
    id: 'flash_50', icon: '🎯', title: 'Нарийн',
    desc: 'Флэшкард 50 зөв хариулсан',
    category: 'games',
    max: 50,  getValue: s => s.stats?.flashcardsCorrect || 0,
    check:    s => (s.stats?.flashcardsCorrect || 0) >= 50,
  },
  {
    id: 'flash_100', icon: '💡', title: 'Гэрэлтсэн',
    desc: 'Флэшкард 100 зөв хариулсан',
    category: 'games',
    max: 100, getValue: s => s.stats?.flashcardsCorrect || 0,
    check:    s => (s.stats?.flashcardsCorrect || 0) >= 100,
  },

  // ── Gender game ────────────────────────────────────────────────────────
  {
    id: 'gender_10', icon: '🏷️', title: 'Артикль',
    desc: 'Артикль тоглоом 10 зөв',
    category: 'games',
    max: 10, getValue: s => s.stats?.genderCorrect || 0,
    check:   s => (s.stats?.genderCorrect || 0) >= 10,
  },
  {
    id: 'gender_50', icon: '🧐', title: 'Шинжээч',
    desc: 'Артикль тоглоом 50 зөв',
    category: 'games',
    max: 50, getValue: s => s.stats?.genderCorrect || 0,
    check:   s => (s.stats?.genderCorrect || 0) >= 50,
  },

  // ── XP ─────────────────────────────────────────────────────────────────
  {
    id: 'xp_500', icon: '⭐', title: 'Одтой',
    desc: '500 XP цуглуулсан',
    category: 'xp',
    max: 500,  getValue: s => s.xp || 0,
    check:     s => (s.xp || 0) >= 500,
  },
  {
    id: 'xp_2000', icon: '🌠', title: 'Тэнгэр',
    desc: '2000 XP цуглуулсан',
    category: 'xp',
    max: 2000, getValue: s => s.xp || 0,
    check:     s => (s.xp || 0) >= 2000,
  },
  {
    id: 'xp_5000', icon: '🚀', title: 'Огторгуй',
    desc: '5000 XP цуглуулсан',
    category: 'xp',
    max: 5000, getValue: s => s.xp || 0,
    check:     s => (s.xp || 0) >= 5000,
  },

  // ── Daily practice ─────────────────────────────────────────────────────
  {
    id: 'daily_1', icon: '📅', title: 'Эхний дасгал',
    desc: 'Өдөр тутмын дасгал хийсэн',
    category: 'daily',
    max: 1,  getValue: s => s.stats?.dailyCount || 0,
    check:   s => (s.stats?.dailyCount || 0) >= 1,
  },
  {
    id: 'daily_7', icon: '🏅', title: '7 өдөр',
    desc: '7 удаа өдрийн дасгал хийсэн',
    category: 'daily',
    max: 7,  getValue: s => s.stats?.dailyCount || 0,
    check:   s => (s.stats?.dailyCount || 0) >= 7,
  },
  {
    id: 'daily_30', icon: '🥇', title: '30 өдөр',
    desc: '30 удаа өдрийн дасгал хийсэн',
    category: 'daily',
    max: 30, getValue: s => s.stats?.dailyCount || 0,
    check:   s => (s.stats?.dailyCount || 0) >= 30,
  },

  // ── Listening ──────────────────────────────────────────────────────────
  {
    id: 'listen_10', icon: '🎧', title: 'Сонсогч',
    desc: 'Сонсох дасгал 10 зөв',
    category: 'games',
    max: 10,  getValue: s => s.stats?.listeningCorrect || 0,
    check:    s => (s.stats?.listeningCorrect || 0) >= 10,
  },
  {
    id: 'listen_50', icon: '🎵', title: 'Дуулиа',
    desc: 'Сонсох дасгал 50 зөв',
    category: 'games',
    max: 50,  getValue: s => s.stats?.listeningCorrect || 0,
    check:    s => (s.stats?.listeningCorrect || 0) >= 50,
  },

  // ── Sentence builder ───────────────────────────────────────────────────
  {
    id: 'sentence_10', icon: '🔀', title: 'Зохиогч',
    desc: 'Өгүүлбэр зохиох 10 зөв',
    category: 'games',
    max: 10, getValue: s => s.stats?.sentenceCorrect || 0,
    check:   s => (s.stats?.sentenceCorrect || 0) >= 10,
  },
  {
    id: 'sentence_50', icon: '✍️', title: 'Яруу найрагч',
    desc: 'Өгүүлбэр зохиох 50 зөв',
    category: 'games',
    max: 50, getValue: s => s.stats?.sentenceCorrect || 0,
    check:   s => (s.stats?.sentenceCorrect || 0) >= 50,
  },

  // ── Stages ─────────────────────────────────────────────────────────────
  {
    id: 'stages_5', icon: '🎮', title: 'Тоглогч',
    desc: '5 шат дуусгасан',
    category: 'stages',
    max: 5,  getValue: s => Object.keys(s.completedStages || {}).length,
    check:   s => Object.keys(s.completedStages || {}).length >= 5,
  },
  {
    id: 'stages_20', icon: '🗺️', title: 'Аялагч',
    desc: '20 шат дуусгасан',
    category: 'stages',
    max: 20, getValue: s => Object.keys(s.completedStages || {}).length,
    check:   s => Object.keys(s.completedStages || {}).length >= 20,
  },
];

// Returns a Set of unlocked achievement IDs for a given state
export function getUnlockedIds(state) {
  return new Set(ACHIEVEMENTS.filter(a => a.check(state)).map(a => a.id));
}
