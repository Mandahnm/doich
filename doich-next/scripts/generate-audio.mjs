import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local so OPENAI_API_KEY is available without any extra deps
const envFile = path.join(__dirname, '../.env.local');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const eq = line.indexOf('=');
    if (eq > 0 && !line.startsWith('#')) {
      process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }
  }
}

const { VOCAB } = await import('../lib/vocab.js');

const API_KEY  = process.env.OPENAI_API_KEY;
const OUT_DIR  = path.join(__dirname, '../public/audio');

if (!API_KEY) {
  console.error('Error: OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

async function fetchAudio(text) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'tts-1', voice: 'alloy', input: text }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

let generated = 0, skipped = 0, failed = 0;
const failures = [];

for (const word of VOCAB) {
  const dest = path.join(OUT_DIR, `${word.id}.mp3`);

  if (fs.existsSync(dest)) {
    skipped++;
    continue;
  }

  try {
    const buf = await fetchAudio(word.de);
    fs.writeFileSync(dest, buf);
    generated++;
    process.stdout.write(`\r[${generated + skipped}/${VOCAB.length}] ✓ ${word.de.padEnd(24)}`);
  } catch (err) {
    failed++;
    failures.push(`${word.id} (${word.de}): ${err.message}`);
    process.stdout.write(`\r[${generated + skipped}/${VOCAB.length}] ✗ ${word.de.padEnd(24)}`);
  }

  // 10 req/s — well within the default OpenAI rate limit
  await new Promise(r => setTimeout(r, 100));
}

console.log(`\n\nGenerated: ${generated}  Skipped: ${skipped}  Failed: ${failed}`);
if (failures.length) {
  console.log('\nFailed words:');
  failures.forEach(f => console.log(' ', f));
}
