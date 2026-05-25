import { VOCAB } from './vocab';

const PATTERNS = [
  { pre: 'Das ist ein',    post: 'Mann.',           ending: 'er', label: 'ein · Mask. · Nom' },
  { pre: 'Das ist eine',   post: 'Frau.',           ending: 'e',  label: 'eine · Fem. · Nom' },
  { pre: 'Das ist ein',    post: 'Land.',           ending: 'es', label: 'ein · Neut. · Nom' },
  { pre: 'Der',            post: 'Mann ist hier.',  ending: 'e',  label: 'der · Mask. · Nom' },
  { pre: 'Die',            post: 'Frau kommt.',     ending: 'e',  label: 'die · Fem. · Nom'  },
  { pre: 'Das',            post: 'Haus ist schön.', ending: 'e',  label: 'das · Neut. · Nom' },
  { pre: 'Ich sehe einen', post: 'Mann.',           ending: 'en', label: 'einen · Mask. · Akk' },
  { pre: 'Ich sehe eine',  post: 'Frau.',           ending: 'e',  label: 'eine · Fem. · Akk'  },
  { pre: 'Ich lese ein',   post: 'Buch.',           ending: 'es', label: 'ein · Neut. · Akk'  },
  { pre: 'Ich sehe den',   post: 'Mann.',           ending: 'en', label: 'den · Mask. · Akk' },
  { pre: 'Ich mag die',    post: 'Stadt.',          ending: 'e',  label: 'die · Fem. · Akk'  },
  { pre: 'Ich lese das',   post: 'Buch.',           ending: 'e',  label: 'das · Neut. · Akk' },
  { pre: 'Ich helfe dem',  post: 'Mann.',           ending: 'en', label: 'dem · Mask. · Dat' },
  { pre: 'Ich helfe der',  post: 'Frau.',           ending: 'en', label: 'der · Fem. · Dat'  },
  { pre: 'Das gehört dem', post: 'Kind.',           ending: 'en', label: 'dem · Neut. · Dat' },
];

const SKIP = new Set(['hoch', 'nah', 'viel', 'wenig']);

// Returns all valid adjective exercises in VOCAB order, with deterministic pattern assignment
function buildValidExercises() {
  const adjs = VOCAB.filter(w =>
    w.type === 'adj' &&
    !SKIP.has(w.de) &&
    !w.de.endsWith('el') &&
    !w.de.endsWith('er')
  );
  return adjs.map((word, i) => {
    const pattern  = PATTERNS[i % PATTERNS.length];
    const stem     = word.de.endsWith('e') ? word.de.slice(0, -1) : word.de;
    const inflected = stem + pattern.ending;
    return {
      ...word,
      example:        `${pattern.pre} ${inflected} ${pattern.post}`,
      conjugatedForm: inflected,
      stem,
      ending:         pattern.ending,
      grammarLabel:   pattern.label,
    };
  });
}

export function buildAdjectiveExercises(level = null) {
  const all = buildValidExercises().filter(e => !level || e.level === level);
  return all.sort(() => Math.random() - 0.5);
}

export function getAdjectiveStages() {
  const all = buildValidExercises();
  const stages = [];
  for (let i = 0; i < all.length; i += 5) {
    const chunk = all.slice(i, i + 5);
    if (chunk.length < 2) break;
    stages.push({
      id:       `adjective-${stages.length + 1}`,
      stageNum: stages.length + 1,
      words:    chunk,
    });
  }
  return stages;
}
