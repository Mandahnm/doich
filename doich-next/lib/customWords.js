// Story words that don't exist in VOCAB live in state.stats.customWords, keyed by
// a "cw:"-prefixed string id. String ids work anywhere a numeric VOCAB id does —
// stats.srs / mistakes are plain object maps, and FlashCard compares ids with ===.

export const CW_PREFIX = 'cw:';

/** Stable key for a custom word: cw:die anzeigetafel */
export const customKey = de => CW_PREFIX + de.toLowerCase().trim();

// Any non-numeric id is a custom word — covers both cw:-prefixed keys and the
// unprefixed keys written before the prefix existed.
export const isCustomId = id => typeof id !== 'number';

/** customWords map → VOCAB-shaped entries usable by ReviewScreen / FlashCard */
export function customWordEntries(customWords = {}) {
  const byWord = new Map();
  for (const [key, w] of Object.entries(customWords)) {
    if (!w?.de) continue;
    const dedupe = w.de.toLowerCase().trim();
    // A word saved before the cw: prefix may also exist under the new key — keep one.
    if (byWord.has(dedupe) && !key.startsWith(CW_PREFIX)) continue;
    byWord.set(dedupe, {
      id: key,
      de: w.de,
      mn: w.mn,
      level: w.level || null,
      type: 'custom',
      gender: null,
      example: null,
      isCustom: true,
    });
  }
  return [...byWord.values()];
}

/** Every id in the learner's deck — numeric VOCAB ids plus custom-word keys */
export const allLearnedIds = state => [
  ...(state.learnedWords || []),
  ...customWordEntries(state.stats?.customWords).map(w => w.id),
];

/**
 * stats.srs with legacy entries folded in. Custom words added before the cw:
 * prefix kept their SRS entry nested inside customWords; stats.srs always wins.
 */
export function mergedSrs(state) {
  const nested = {};
  for (const [key, w] of Object.entries(state.stats?.customWords || {})) {
    if (w?.srs) nested[key] = w.srs;
  }
  return { ...nested, ...(state.stats?.srs || {}) };
}
