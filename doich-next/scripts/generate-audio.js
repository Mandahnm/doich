// Run from doich-next/ folder: node scripts/generate-audio.js
const fs   = require('fs');
const path = require('path');

const API_KEY  = process.env.ELEVENLABS_API_KEY  || 'sk_d24fd8b099f04bffdc04f295cad2ca91226fc0bdaa650514';
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'IKne3meq5aSn9XLyUdCD';
const OUT_DIR  = path.join(__dirname, '..', 'public', 'audio');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Parse words directly from vocab.js source (avoids ESM import issues)
const vocabSrc = fs.readFileSync(path.join(__dirname, '..', 'lib', 'vocab.js'), 'utf8');
const wordRegex = /\{\s*id:\s*(\d+)[\s\S]*?de:\s*'([^']+)'[\s\S]*?\}/g;
const words = [];
let m;
while ((m = wordRegex.exec(vocabSrc)) !== null) {
  const genderMatch = m[0].match(/gender:\s*'([^']+)'/);
  const gender = genderMatch ? genderMatch[1] : null;
  const text = gender ? `${gender} ${m[2]}` : m[2];
  words.push({ id: Number(m[1]), de: m[2], text });
}

console.log(`Found ${words.length} words. Starting generation...\n`);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generateAudio(word) {
  const outFile = path.join(OUT_DIR, `${word.id}.mp3`);
  if (fs.existsSync(outFile)) {
    process.stdout.write(`skip ${word.id} (${word.de})\n`);
    return;
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: word.text,
      model_id: 'eleven_multilingual_v2',
      language_code: 'de',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`\nERROR ${word.id} (${word.de}): ${res.status} ${err}`);
    return;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outFile, buffer);
  process.stdout.write(`done  ${word.id} (${word.de})\n`);
}

async function main() {
  let done = 0;
  for (const word of words) {
    await generateAudio(word);
    done++;
    if (done % 50 === 0) console.log(`\n--- ${done}/${words.length} complete ---\n`);
    await sleep(200); // avoid rate limiting
  }
  console.log(`\nAll done! ${words.length} files in public/audio/`);
}

main().catch(console.error);
