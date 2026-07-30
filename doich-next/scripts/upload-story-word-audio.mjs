// Step 4: upload the new word audio to Supabase storage.
//
// public/audio/ is gitignored and the app reads NEXT_PUBLIC_AUDIO_BASE_URL, which
// points at the Supabase `audio` bucket — files that only exist on disk never reach
// production, and PlayButton swallows the 404 so the failure is silent.
//
// Run from doich-next/: node scripts/upload-story-word-audio.mjs [--force]
import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = readFileSync('.env.local', 'utf8');
const get = key => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'));

const ids = JSON.parse(readFileSync('scripts/.new-word-ids.json', 'utf8'));
console.log(`Uploading ${ids.length} files to the "audio" bucket…`);

let ok = 0, failed = 0;
const failures = [];

for (const id of ids) {
  const src = `public/audio/${id}.mp3`;
  if (!existsSync(src)) { failures.push(`${id}: missing locally`); failed++; continue; }

  const { error } = await sb.storage
    .from('audio')
    .upload(`${id}.mp3`, readFileSync(src), { contentType: 'audio/mpeg', upsert: true });

  if (error) { failures.push(`${id}: ${error.message}`); failed++; }
  else { ok++; if (ok % 25 === 0) console.log(`  ${ok}/${ids.length}`); }
}

console.log(`\nUploaded: ${ok}  Failed: ${failed}`);
if (failures.length) { console.log('\nFailures:'); failures.forEach(f => console.log(' ', f)); }
