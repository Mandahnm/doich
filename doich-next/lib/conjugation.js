import { VOCAB } from './vocab';

function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
const DE_ALPHA = '[A-Za-zäöüÄÖÜß]*';

function infStem(de) {
  if (de.endsWith('eln') || de.endsWith('ern')) return de.slice(0, -1);
  if (de.endsWith('en')) return de.slice(0, -2);
  if (de.endsWith('n'))  return de.slice(0, -1);
  return de;
}

function findForm(sentence, de) {
  const esc = escRe(de);
  const exact = sentence.match(new RegExp(esc, 'i'));
  if (exact) return exact[0];
  for (let trim = 1; trim <= Math.min(4, de.length - 3); trim++) {
    const stem  = esc.slice(0, -trim);
    const match = sentence.match(new RegExp(stem + DE_ALPHA, 'i'));
    if (match) return match[0];
  }
  return null;
}

function commonPrefixLen(a, b) {
  const al = a.toLowerCase(), bl = b.toLowerCase();
  let i = 0;
  while (i < al.length && i < bl.length && al[i] === bl[i]) i++;
  return i;
}

// Returns all valid conjugation exercises in VOCAB order (A1→A2→B1→B2→C1)
function buildValidExercises() {
  const exercises = [];
  for (const word of VOCAB.filter(w => w.type === 'verb')) {
    const form = findForm(word.example, word.de);
    if (!form) continue;
    const base    = infStem(word.de);
    const prefLen = commonPrefixLen(base, form);
    if (prefLen < Math.min(3, Math.ceil(base.length * 0.6))) continue;
    const stem   = form.slice(0, prefLen);
    const ending = form.slice(prefLen);
    exercises.push({ ...word, conjugatedForm: form, stem, ending });
  }
  return exercises;
}

export function buildConjugationExercises(level = null) {
  const all = buildValidExercises().filter(e => !level || e.level === level);
  return all.sort(() => Math.random() - 0.5);
}

export function getConjugationStages() {
  const all = buildValidExercises();
  const stages = [];
  for (let i = 0; i < all.length; i += 5) {
    const chunk = all.slice(i, i + 5);
    if (chunk.length < 2) break;
    stages.push({
      id:       `conjugation-${stages.length + 1}`,
      stageNum: stages.length + 1,
      words:    chunk,
    });
  }
  return stages;
}
