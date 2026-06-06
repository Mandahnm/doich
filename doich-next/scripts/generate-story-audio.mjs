// Run from doich-next/: node scripts/generate-story-audio.mjs <story_id>
// Example: node scripts/generate-story-audio.mjs 861b8214-ad58-4e28-b0bc-bb0d57709479
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const story_id = process.argv[2];
if (!story_id) { console.error('Usage: node scripts/generate-story-audio.mjs <story_id>'); process.exit(1); }

// Read credentials from .env.local
const env = readFileSync('.env.local', 'utf8');
const get = key => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim();

const SUPABASE_URL     = get('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY     = get('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_API_KEY   = get('OPENAI_API_KEY');

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fetch story
const { data: story, error } = await sb.from('stories').select('id, title, body').eq('id', story_id).single();
if (error || !story) { console.error('Story not found:', error?.message); process.exit(1); }

console.log(`Generating audio for: "${story.title}"`);

const narrationText = story.body.map(p => p.text).join('\n\n');

// Call OpenAI TTS
const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
  body: JSON.stringify({
    model: 'gpt-4o-mini-tts',
    input: narrationText,
    voice: 'alloy',
    instructions: 'Speak in clear, standard German at a calm teaching pace. Pronounce each word carefully.',
    response_format: 'mp3',
  }),
});

if (!ttsRes.ok) { console.error('TTS failed:', await ttsRes.text()); process.exit(1); }

const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
console.log(`Audio generated (${(audioBuffer.length / 1024).toFixed(1)} KB), uploading...`);

// Upload to Supabase Storage
const { error: uploadErr } = await sb.storage.from('story-audio').upload(`${story_id}.mp3`, audioBuffer, { contentType: 'audio/mpeg', upsert: true });
if (uploadErr) { console.error('Upload failed:', uploadErr.message); process.exit(1); }

// Get public URL and save to stories table
const { data: { publicUrl } } = sb.storage.from('story-audio').getPublicUrl(`${story_id}.mp3`);
const { error: updateErr } = await sb.from('stories').update({ audio_url: publicUrl }).eq('id', story_id);
if (updateErr) { console.error('DB update failed:', updateErr.message); process.exit(1); }

console.log(`Done! audio_url saved:\n${publicUrl}`);
