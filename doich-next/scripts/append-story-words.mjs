// Step 2: append the enriched story words to lib/vocab.js.
//
// They go at the END of the VOCAB array on purpose. getStages() builds stages by
// slicing VOCAB.filter(level === cefr) in array order, and completedStages is keyed
// by stage index — inserting into the middle of a level would silently reshuffle
// every stage a user has already finished. filter() preserves order, so appending
// at the end of the array puts each word at the end of its own level's pool.
//
// Run from doich-next/: node scripts/append-story-words.mjs
import { readFileSync, writeFileSync } from 'fs';

const { VOCAB } = await import('../lib/vocab.js');

const enriched = JSON.parse(readFileSync('scripts/.enriched-words.json', 'utf8'));
const existing = new Set(VOCAB.map(w => w.de.toLowerCase()));

const skipped = enriched.filter(w => existing.has(w.de.toLowerCase()));
const toAdd   = enriched.filter(w => !existing.has(w.de.toLowerCase()));

if (skipped.length) {
  console.log(`Skipping ${skipped.length} already in the library (story wrote them with placeholders):`);
  skipped.forEach(w => console.log(`  ${w.source_de} → ${w.de}`));
}

const q = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const pad = (s, n) => s + ' '.repeat(Math.max(1, n - s.length));

let nextId = Math.max(...VOCAB.map(w => w.id)) + 1;
const rows = toAdd.map(w => ({ ...w, id: nextId++ }));

// Column widths so the new block lines up with itself
const wDe = Math.max(...rows.map(r => q(r.de).length)) + 1;
const wMn = Math.max(...rows.map(r => q(r.mn).length)) + 1;
const wGe = Math.max(...rows.map(r => (r.gender ? `gender:${q(r.gender)},` : '').length)) + 1;
const wEx = Math.max(...rows.map(r => q(r.example).length)) + 1;

const byLevel = {};
rows.forEach(r => (byLevel[r.level] ||= []).push(r));

let block = '\n  // ── Story words (from the reading exercises) ───────────────────────────────\n';
block += '  // Appended at the end so existing game stages keep their word groupings.\n';
for (const lv of ['A1', 'A2', 'B1', 'B2', 'C1']) {
  const group = byLevel[lv];
  if (!group?.length) continue;
  block += `  // ${lv} — ${group.length} words\n`;
  for (const r of group) {
    block +=
      `  { id:${r.id}, de:${pad(q(r.de) + ',', wDe)}mn:${pad(q(r.mn) + ',', wMn)}` +
      `level:${q(r.level)}, type:${pad(q(r.type) + ',', 8)}` +
      `${pad(r.gender ? `gender:${q(r.gender)},` : '', wGe)}` +
      `example:${pad(q(r.example) + ',', wEx)}emoji:${q(r.emoji)} },\n`;
  }
}

const path = 'lib/vocab.js';
const src  = readFileSync(path, 'utf8');
const eol  = src.includes('\r\n') ? '\r\n' : '\n';       // the file is CRLF on Windows
const marker = new RegExp(`${eol}\\];${eol}${eol}export const LEVELS`);
if (!marker.test(src)) { console.error('Could not find the end of the VOCAB array'); process.exit(1); }
if (src.includes('Story words (from the reading exercises)')) {
  console.error('Story-word block already present — remove it before re-running.'); process.exit(1);
}

const tail = `];${eol}${eol}export const LEVELS`;
writeFileSync(path, src.replace(marker, block.replace(/\n/g, eol) + tail));

console.log(`\nAppended ${rows.length} entries, ids ${rows[0].id}–${rows[rows.length - 1].id}`);
for (const lv of ['A1', 'A2', 'B1', 'B2', 'C1']) if (byLevel[lv]) console.log(`  ${lv}: ${byLevel[lv].length}`);
writeFileSync('scripts/.new-word-ids.json', JSON.stringify(rows.map(r => r.id)));
console.log('New ids written to scripts/.new-word-ids.json (input for the TTS step)');
