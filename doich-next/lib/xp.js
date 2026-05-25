// XP required to reach each level (index = level - 1)
const THRESHOLDS = [0, 300, 800, 1800, 3500, 6000, 10000, 15000, 22000, 30000, 40000];

export function getLevel(xp) {
  let level = 1;
  for (let i = 1; i < THRESHOLDS.length; i++) {
    if (xp >= THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function getLevelInfo(xp) {
  const level   = getLevel(xp);
  const current = THRESHOLDS[level - 1] ?? 0;
  const next    = THRESHOLDS[level]     ?? current + 10000;
  return {
    level,
    xpInLevel: xp - current,
    xpToNext:  next - current,
    progress:  (xp - current) / (next - current),
  };
}

// XP multiplier per CEFR level
const CEFR_MULT = { A1: 1, A2: 1.2, B1: 1.5, B2: 1.8, C1: 2 };
const STAR_BONUS = [0, 10, 40, 100]; // index = star count

export function calcStageXP(cefr, score, total) {
  const pct   = score / total;
  const stars = pct >= 0.87 ? 3 : pct >= 0.6 ? 2 : 1;
  const mult  = CEFR_MULT[cefr] || 1;
  return Math.round(score * 10 * mult) + STAR_BONUS[stars];
}
