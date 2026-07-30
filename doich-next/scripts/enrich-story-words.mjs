// Step 1 of adding story words to the vocab library.
// Reads scripts/.missing-words.json ({ de, mn, level, story }) and asks OpenAI for
// the metadata a VOCAB entry needs: citation form, type, gender, example, emoji.
// The Mongolian translation is NEVER regenerated — the story's own wording is kept.
//
// Run from doich-next/: node scripts/enrich-story-words.mjs
import { readFileSync, writeFileSync, existsSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const get = key => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim();
const API_KEY = get('OPENAI_API_KEY');
if (!API_KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }

const words = JSON.parse(readFileSync('scripts/.missing-words.json', 'utf8'));
const OUT   = 'scripts/.enriched-words.json';
const done  = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : [];
const doneKeys = new Set(done.map(w => w.source_de));

const todo = words.filter(w => !doneKeys.has(w.de));
console.log(`${words.length} words · ${done.length} already enriched · ${todo.length} to go`);

const SYSTEM = `You prepare entries for a German vocabulary list used by Mongolian learners.
For each item you receive the German word exactly as it appeared in a reading story, plus its
CEFR level. Return metadata for a dictionary entry.

Rules:
- "de": the clean citation form.
  * Nouns: singular where the story used a singular, WITHOUT the article (die Anzeigetafel -> Anzeigetafel).
    Keep a plural-only word plural (die Hausaufgaben -> Hausaufgaben).
  * Verbs: infinitive. Keep the reflexive pronoun if the verb needs it (sich freuen auf).
  * Remove placeholder markers and parentheses: "jdm. etw. vorsingen" -> "vorsingen",
    "sich hüten (etw. zu tun)" -> "sich hüten", "(die Worte) meiden" -> "meiden".
  * Keep genuinely idiomatic multi-word expressions intact (am Anfang, Mut zusammennehmen).
- "gender": "der" | "die" | "das" for nouns, null for everything else.
- "type": "noun" | "verb" | "adj" | "adv". Use "adv" for particles, conjunctions and
  prepositional/adverbial phrases that are not adjectives.
- "example": ONE natural German sentence using the word, at or below the given CEFR level.
  Use correct inflection. 4-12 words. End with a period, question mark or exclamation mark.
  Do not use quotation marks inside the sentence.
- "emoji": a single emoji that fits the meaning. Never the same emoji twice within a batch.

Answer with JSON only: {"items":[{"source_de","de","gender","type","example","emoji"}, ...]}
Return exactly one item per input, in the same order. "source_de" must repeat the input word verbatim.`;

const chunk = (arr, n) => arr.reduce((a, x, i) => (i % n ? a[a.length - 1].push(x) : a.push([x]), a), []);

for (const batch of chunk(todo, 12)) {
  const payload = batch.map(w => ({ word: w.de, level: w.level, meaning_mn: w.mn }));

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user',   content: JSON.stringify(payload) },
      ],
    }),
  });

  if (!res.ok) { console.error('OpenAI failed:', res.status, await res.text()); process.exit(1); }
  const items = JSON.parse((await res.json()).choices[0].message.content).items || [];

  for (const w of batch) {
    const hit = items.find(i => i.source_de === w.de);
    if (!hit) { console.error(`  no result for "${w.de}" — rerun to retry`); continue; }
    done.push({
      source_de: w.de,
      de:      hit.de,
      mn:      w.mn,           // story translation, verbatim
      level:   w.level,
      type:    hit.type,
      gender:  hit.type === 'noun' ? (hit.gender || null) : null,
      example: hit.example,
      emoji:   hit.emoji,
      story:   w.story,
    });
  }

  writeFileSync(OUT, JSON.stringify(done, null, 2));
  console.log(`  ${done.length}/${words.length}`);
}

console.log(`\nDone — ${done.length} entries written to ${OUT}`);
