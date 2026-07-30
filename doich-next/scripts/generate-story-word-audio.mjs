// Step 3: OpenAI TTS for the newly added story words → public/audio/{id}.mp3
//
// Voice is 'onyx' to match the 2953 word files already in public/audio — a different
// voice mid-library is jarring in a review session. The German accent and delivery
// come from the `instructions` field, which gpt-4o-mini-tts supports.
//
// Run from doich-next/: node scripts/generate-story-word-audio.mjs [--all] [--force]
import fs from 'fs';
import path from 'path';

const env = fs.readFileSync('.env.local', 'utf8');
const get = key => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim();
const API_KEY = get('OPENAI_API_KEY');
if (!API_KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1); }

const { VOCAB }      = await import('../lib/vocab.js');
const { getTtsText } = await import('../lib/tts.js');

const OUT_DIR = path.join(process.cwd(), 'public/audio');
fs.mkdirSync(OUT_DIR, { recursive: true });

const force = process.argv.includes('--force');
const ids   = process.argv.includes('--all')
  ? VOCAB.map(w => w.id)
  : JSON.parse(fs.readFileSync('scripts/.new-word-ids.json', 'utf8'));

const words = VOCAB.filter(w => ids.includes(w.id));

const INSTRUCTIONS =
  'You are a native German speaker recording a vocabulary list for language learners. ' +
  'Speak clear, precise standard German (Hochdeutsch) with a neutral German accent. ' +
  'Articulate every syllable distinctly and use a calm, unhurried teaching pace. ' +
  'Pronounce umlauts (ä, ö, ü) and the ß correctly, and give final consonants their full value. ' +
  'Do not add any words, translation or commentary — say only the given German text.';

async function fetchAudio(text) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice: 'onyx',
      input: text,
      instructions: INSTRUCTIONS,
      response_format: 'mp3',
    }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

let generated = 0, skipped = 0, failed = 0;
const failures = [];

for (const word of words) {
  const dest = path.join(OUT_DIR, `${word.id}.mp3`);
  if (fs.existsSync(dest) && !force) { skipped++; continue; }

  const ttsText = getTtsText(word);
  try {
    fs.writeFileSync(dest, await fetchAudio(ttsText));
    generated++;
    console.log(`  [${generated + skipped + failed}/${words.length}] ${word.id} "${ttsText}"`);
  } catch (err) {
    failed++;
    failures.push(`${word.id} (${word.de}): ${err.message}`);
    console.log(`  [${generated + skipped + failed}/${words.length}] ${word.id} FAILED ${word.de}`);
  }
  await new Promise(r => setTimeout(r, 120));
}

console.log(`\nGenerated: ${generated}  Skipped: ${skipped}  Failed: ${failed}`);
if (failures.length) { console.log('\nFailures:'); failures.forEach(f => console.log(' ', f)); }
