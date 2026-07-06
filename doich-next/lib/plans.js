// Freemium plan configuration — single source of truth for all feature gates

export const FREE_STAGES_PER_LEVEL  = 10; // first 10 stages per game type per CEFR level
export const FREE_STORIES_PER_LEVEL = 1;  // first story per CEFR level
export const FREE_AI_TUTOR_DAILY    = 5;  // AI tutor messages per day
export const PRO_AI_TUTOR_DAILY     = 500;

// Pro-only game types (each use costs per-request API call)
export const PRO_ONLY_GAMES = new Set(['speaking']);

export const PRICING = [
  // TEMP TEST PRICE — revert monthly to 12900 after Bonum end-to-end test
  { id: 'monthly',  labelMn: 'Сарын',   price: 10,    perMonth: 10,    months: 1,  saving: 0  },
  { id: '3month',   labelMn: '3 Сарын', price: 32900, perMonth: 10967, months: 3,  saving: 15 },
  { id: 'annual',   labelMn: 'Жилийн',  price: 99900, perMonth: 8325,  months: 12, saving: 35 },
];

export const PRO_FEATURES = [
  'Бүх шатны тоглоом (11-р шатаас)',
  'Бүх уншлагын өгүүллэг',
  'AI Багшт хязгааргүй чат',
  'Дүрмийн шалгуур',
  'Дуудлагын дасгал (Whisper)',
];

export function isPro(plan) { return plan === 'pro'; }

// 0-based stage index — returns true if this stage is locked for the given plan
export function stageIsProLocked(plan, stageIndex) {
  return !isPro(plan) && stageIndex >= FREE_STAGES_PER_LEVEL;
}

// 0-based story index within a CEFR level — returns true if locked
export function storyIsProLocked(plan, storyIndexInLevel) {
  return !isPro(plan) && storyIndexInLevel >= FREE_STORIES_PER_LEVEL;
}

// Returns true if the game type is Pro-only regardless of stage index
export function gameIsProOnly(plan, gameType) {
  return !isPro(plan) && PRO_ONLY_GAMES.has(gameType);
}
