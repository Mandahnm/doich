import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const AUDIO_DIR = path.join(process.cwd(), 'public', 'new fixed audios');

// word name → numeric ID mapping
const MAP = {
  'a posteriori': 848, 'a priori': 847, 'ambivalent': 776, 'bald': 234,
  'bilingual': 2071, 'blind': 1508, 'blond': 1415, 'de facto': 845,
  'de jure': 846, 'deskriptiv': 792, 'destruktiv': 2077, 'direkt': 1418,
  'dominant': 774, 'extra': 2128, 'extrem': 2129, 'fair': 2187,
  'fast': 1427, 'graduell': 784, 'hell': 1035, 'ideal': 2346,
  'illegal': 2347, 'inklusiv': 787, 'intensiv': 2362, 'international': 355,
  'irrelevant': 582, 'kaputt': 1184, 'konservativ': 811, 'konstruktiv': 923,
  'kooperativ': 2074, 'kumulativ': 785, 'latent': 783, 'locker': 1622,
  'marginal': 773, 'mild': 1625, 'modern': 353, 'normal': 2597,
  'objektiv': 579, 'parallel': 1639, 'progressiv': 810, 'radioaktiv': 2080,
  'regional': 1801, 'relevant': 581, 'stark': 1452, 'starten': 2874,
  'still': 1818, 'stoppen': 1776, 'stringent': 799, 'subjektiv': 580,
  'surfen': 1394, 'tolerant': 1824, 'total': 1454, 'transparent': 578,
  'wild': 2001,
};

let ok = 0, fail = 0;

for (const [word, id] of Object.entries(MAP)) {
  const srcFile = path.join(AUDIO_DIR, `${word}.mp3`);

  if (!fs.existsSync(srcFile)) {
    console.log(`SKIP  ${word}.mp3 — file not found`);
    fail++;
    continue;
  }

  const fileBuffer = fs.readFileSync(srcFile);
  const destPath   = `${id}.mp3`;

  const { error } = await supabase.storage
    .from('audio')
    .upload(destPath, fileBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,       // overwrite existing
    });

  if (error) {
    console.log(`FAIL  ${word} -> ${destPath}  (${error.message})`);
    fail++;
  } else {
    console.log(`OK    ${word} -> ${destPath}`);
    ok++;
  }
}

console.log(`\nDone: ${ok} uploaded, ${fail} failed/skipped`);
