// Spaced Repetition System — simplified SM-2 algorithm

const addDays = n => new Date(Date.now() + n * 86400000).toDateString();
const today   = () => new Date().toDateString();

/** Create a fresh SRS entry for a newly-learned word (due tomorrow) */
export function initSrsEntry() {
  return { interval: 1, dueDate: addDays(1), ef: 2.5, reps: 0 };
}

/**
 * Update an SRS entry after a review answer.
 * Correct: interval grows, ease factor nudges up, reps++
 * Wrong:   resets to interval=1 (due tomorrow), ef drops, reps=0
 */
export function updateSrsEntry(entry, isCorrect) {
  const e = entry ?? initSrsEntry();

  if (isCorrect) {
    const reps       = (e.reps || 0) + 1;
    const newInterval =
      reps === 1 ? 1 :
      reps === 2 ? 3 :
      Math.round((e.interval || 1) * (e.ef || 2.5));
    return {
      interval: newInterval,
      dueDate:  addDays(newInterval),
      ef:       Math.min(3.0, Math.max(1.3, (e.ef || 2.5) + 0.1)),
      reps,
    };
  } else {
    return {
      interval: 1,
      dueDate:  addDays(1),
      ef:       Math.max(1.3, (e.ef || 2.5) - 0.2),
      reps:     0,
    };
  }
}

/** True if a word has no SRS entry yet or its dueDate is today or earlier */
export function isDueToday(entry) {
  if (!entry) return true;
  return entry.dueDate <= today();
}

/** Count of learned words due for review today */
export function getDueCount(learnedWordIds, srs) {
  return learnedWordIds.filter(id => isDueToday(srs[id])).length;
}

/**
 * Human-readable label for when the next review batch is due.
 * Returns null if all words are already due.
 */
export function getNextDueLabel(learnedWordIds, srs) {
  const t = today();
  const futureDates = learnedWordIds
    .filter(id => srs[id]?.dueDate > t)
    .map(id => new Date(srs[id].dueDate));

  if (futureDates.length === 0) return null;

  const nearest    = new Date(Math.min(...futureDates));
  const daysUntil  = Math.ceil((nearest - Date.now()) / 86400000);
  if (daysUntil <= 1) return '1 өдрийн дараа';
  if (daysUntil < 7)  return `${daysUntil} өдрийн дараа`;
  return `${Math.round(daysUntil / 7)} долоо хоногийн дараа`;
}
