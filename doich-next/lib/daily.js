import { VOCAB } from './vocab';
import { buildConjugationExercises } from './conjugation';
import { buildAdjectiveExercises }   from './adjective';

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const pick    = (arr, n) => shuffle(arr).slice(0, n);

export function buildDailyQueue(userLevel) {
  const words = VOCAB.filter(w => w.level === userLevel);
  const nouns = words.filter(w => w.type === 'noun');

  const flashWords  = pick(words, 4);
  const genderWords = pick(nouns, 4);
  const matchWords  = pick(words, 4);
  const fillWords   = pick(words, 4);
  const conjExs     = buildConjugationExercises(userLevel).slice(0, 4);
  const adjExs      = buildAdjectiveExercises(userLevel).slice(0, 4);

  return [
    ...flashWords.map(w  => ({ type: 'flashcard',   word: w })),
    ...genderWords.map(w => ({ type: 'gender',       word: w })),
    matchWords.length >= 2 ? { type: 'match', words: matchWords } : null,
    ...fillWords.map(w   => ({ type: 'fillblank',   word: w })),
    ...conjExs.map(e     => ({ type: 'conjugation', exercise: e })),
    ...adjExs.map(e      => ({ type: 'adjective',   exercise: e })),
  ].filter(Boolean);
}
