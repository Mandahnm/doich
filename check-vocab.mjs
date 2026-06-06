// check-vocab.mjs — flags potentially wrong or incomplete vocab translations
// Run: node check-vocab.mjs
// Requires OPENAI_API_KEY in doich-next/.env.local

import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';

// ── Load env ─────────────────────────────────────────────────────────────────
const env = readFileSync('doich-next/.env.local', 'utf8');
const apiKey = env.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();
if (!apiKey) { console.error('OPENAI_API_KEY not found in .env.local'); process.exit(1); }

// ── Extract VOCAB array from vocab.js using regex ────────────────────────────
const raw = readFileSync('doich-next/lib/vocab.js', 'utf8');
// Dynamically evaluate just the array (safe — local file)
const arrayText = raw.match(/export const VOCAB = (\[[\s\S]*?\]);/)?.[1];
if (!arrayText) { console.error('Could not parse VOCAB'); process.exit(1); }
const VOCAB = eval(arrayText);
console.log(`Loaded ${VOCAB.length} words.`);

// ── Batch checker ─────────────────────────────────────────────────────────────
const BATCH = 40;
const issues = [];

for (let i = 0; i < VOCAB.length; i += BATCH) {
  const batch = VOCAB.slice(i, i + BATCH);
  const pct   = Math.round((i / VOCAB.length) * 100);
  process.stdout.write(`\rChecking ${i}–${Math.min(i + BATCH, VOCAB.length)} / ${VOCAB.length} (${pct}%)...`);

  const wordList = batch
    .map(w => `${w.id}. [${w.level}] ${w.de} → ${w.mn}`)
    .join('\n');

  const prompt = `You are a German–Mongolian language expert.
Review these German→Mongolian vocabulary translations from a language-learning app for Mongolian speakers.
For each entry flag it ONLY if:
- The Mongolian translation is wrong or misleading
- An important meaning or register is missing (e.g. word is formal but translation looks informal)
- The translation is far too vague for a learner to understand how to use the word

Do NOT flag entries that are correct, even if they could be slightly improved.
Return a JSON array of objects: { id, de, mn, issue }
If nothing is wrong, return an empty array [].

Words to check:
${wordList}`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Return only valid JSON.' },
          { role: 'user',   content: prompt },
        ],
      }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '[]';
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = []; }
    const arr = Array.isArray(parsed) ? parsed : (parsed.issues || parsed.flagged || Object.values(parsed)[0] || []);
    issues.push(...arr);
  } catch (e) {
    console.error('\nAPI error on batch', i, e.message);
  }

  // Respect rate limits
  await new Promise(r => setTimeout(r, 800));
}

console.log(`\n\nDone. ${issues.length} issues found.\n`);

// ── Output ────────────────────────────────────────────────────────────────────
if (issues.length === 0) {
  console.log('✓ No issues flagged — translations look good.');
} else {
  console.log('─'.repeat(60));
  issues.forEach(({ id, de, mn, issue }) => {
    console.log(`[id ${id}] ${de}`);
    console.log(`  Current:  ${mn}`);
    console.log(`  Issue:    ${issue}`);
    console.log();
  });

  // Save report
  const report = issues.map(({ id, de, mn, issue }) =>
    `[id ${id}] ${de}\n  Current: ${mn}\n  Issue:   ${issue}`
  ).join('\n\n');
  writeFileSync('vocab-issues.txt', report, 'utf8');
  console.log(`Report saved to vocab-issues.txt`);
}
