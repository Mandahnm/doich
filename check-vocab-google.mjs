// check-vocab-google.mjs
// Uses Google Cloud Translation API (DE → MN) and compares with current translations.
// Run: node check-vocab-google.mjs

import { readFileSync, writeFileSync } from 'fs';

// ── Load env ──────────────────────────────────────────────────────────────────
const env = readFileSync('doich-next/.env.local', 'utf8');
const apiKey = env.match(/GOOGLE_TRANSLATE_KEY=(.+)/)?.[1]?.trim();
if (!apiKey) { console.error('GOOGLE_TRANSLATE_KEY not found in .env.local'); process.exit(1); }

// ── Load vocab ────────────────────────────────────────────────────────────────
const raw       = readFileSync('doich-next/lib/vocab.js', 'utf8');
const arrayText = raw.match(/export const VOCAB = (\[[\s\S]*?\]);/)?.[1];
const VOCAB     = eval(arrayText);
console.log(`Loaded ${VOCAB.length} words.\n`);

// ── Helpers ───────────────────────────────────────────────────────────────────
const stripArticle = de => de.replace(/^(der|die|das|sich)\s+/i, '').trim();

// Tokenise Mongolian into root words (ignore short particles)
const tokens = str =>
  str.toLowerCase()
     .split(/[\s\/,\(\)]+/)
     .map(w => w.replace(/[^а-яёөүa-z]/gi, ''))
     .filter(w => w.length > 2);

// True if Google and current share at least one meaningful root word
function hasOverlap(googleMN, currentMN) {
  const gTokens = tokens(googleMN);
  const cTokens = tokens(currentMN);
  return gTokens.some(g => cTokens.some(c => c.includes(g) || g.includes(c)));
}

// Google Translate REST call — batches up to 100 strings
async function translateBatch(texts) {
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ q: texts, source: 'de', target: 'mn', format: 'text' }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || res.status);
  return json.data.translations.map(t => t.translatedText);
}

// ── Main loop ─────────────────────────────────────────────────────────────────
const BATCH  = 100;
const issues = [];

for (let i = 0; i < VOCAB.length; i += BATCH) {
  const batch   = VOCAB.slice(i, i + BATCH);
  const pct     = Math.round((i / VOCAB.length) * 100);
  process.stdout.write(`\rChecking ${i}–${Math.min(i + BATCH, VOCAB.length)} / ${VOCAB.length}  (${pct}%)...`);

  const deWords = batch.map(w => stripArticle(w.de));

  try {
    const googleResults = await translateBatch(deWords);

    for (let j = 0; j < batch.length; j++) {
      const w        = batch[j];
      const googleMN = googleResults[j];

      if (!hasOverlap(googleMN, w.mn)) {
        issues.push({ id: w.id, de: w.de, level: w.level, current: w.mn, google: googleMN });
      }
    }
  } catch (e) {
    console.error(`\nBatch ${i} error:`, e.message);
  }

  // Small pause to be polite to the API
  await new Promise(r => setTimeout(r, 150));
}

// ── Output ────────────────────────────────────────────────────────────────────
console.log(`\n\nDone. ${issues.length} potential mismatches.\n`);

if (issues.length === 0) {
  console.log('✓ All translations match Google Translate — no mismatches found.');
} else {
  console.log('─'.repeat(65));
  issues.forEach(({ id, de, level, current, google }) => {
    console.log(`[${level}] id ${id}  ${de}`);
    console.log(`  Current : ${current}`);
    console.log(`  Google  : ${google}`);
    console.log();
  });

  const report = issues.map(({ id, de, level, current, google }) =>
    `[${level}] id ${id}  ${de}\n  Current : ${current}\n  Google  : ${google}`
  ).join('\n\n');

  writeFileSync('vocab-google-issues.txt', report, 'utf8');
  console.log('Full report saved → vocab-google-issues.txt');
}
