// Run from doich-next/: node scripts/rename-heimat-story.mjs
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const OLD_ID = '861b8214-ad58-4e28-b0bc-bb0d57709479';
const NEW_ID = 'c1000000-5000-0000-0000-000000000002';

const env = readFileSync('.env.local', 'utf8');
const get = key => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'));

// 1. Fetch existing story
const { data: story, error: storyErr } = await sb.from('stories').select('*').eq('id', OLD_ID).single();
if (storyErr || !story) { console.error('Story not found:', storyErr?.message); process.exit(1); }
console.log(`Found story: "${story.title}"`);

// 2. Fetch existing questions
const { data: questions, error: qErr } = await sb.from('comprehension_questions').select('*').eq('story_id', OLD_ID).order('sort_order');
if (qErr) { console.error('Questions fetch failed:', qErr.message); process.exit(1); }
console.log(`Found ${questions.length} comprehension questions`);

// 3. Download existing audio
const audioUrl = story.audio_url;
let audioBuffer = null;
if (audioUrl) {
  console.log('Downloading existing audio...');
  const res = await fetch(audioUrl);
  if (res.ok) {
    audioBuffer = Buffer.from(await res.arrayBuffer());
    console.log(`Audio downloaded (${(audioBuffer.length / 1024).toFixed(1)} KB)`);
  } else {
    console.warn('Could not download audio, will skip audio migration');
  }
}

// 4. Insert new story with correct ID
const { error: insertErr } = await sb.from('stories').insert({
  id:         NEW_ID,
  title:      story.title,
  level:      story.level,
  sort_order: story.sort_order,
  body:       story.body,
  new_words:  story.new_words,
});
if (insertErr) { console.error('Insert new story failed:', insertErr.message); process.exit(1); }
console.log(`New story inserted with ID: ${NEW_ID}`);

// 5. Insert questions with new story_id
const newQuestions = questions.map(({ id: _id, story_id: _sid, ...q }) => ({ ...q, story_id: NEW_ID }));
const { error: qInsertErr } = await sb.from('comprehension_questions').insert(newQuestions);
if (qInsertErr) { console.error('Insert questions failed:', qInsertErr.message); process.exit(1); }
console.log(`${newQuestions.length} questions migrated`);

// 6. Upload audio under new filename
if (audioBuffer) {
  const { error: uploadErr } = await sb.storage.from('story-audio').upload(`${NEW_ID}.mp3`, audioBuffer, { contentType: 'audio/mpeg', upsert: true });
  if (uploadErr) { console.error('Audio upload failed:', uploadErr.message); process.exit(1); }
  const { data: { publicUrl } } = sb.storage.from('story-audio').getPublicUrl(`${NEW_ID}.mp3`);
  const { error: urlErr } = await sb.from('stories').update({ audio_url: publicUrl }).eq('id', NEW_ID);
  if (urlErr) { console.error('audio_url update failed:', urlErr.message); process.exit(1); }
  console.log(`Audio uploaded as ${NEW_ID}.mp3`);
}

// 7. Delete old questions and story
await sb.from('comprehension_questions').delete().eq('story_id', OLD_ID);
await sb.from('stories').delete().eq('id', OLD_ID);
if (audioUrl) await sb.storage.from('story-audio').remove([`${OLD_ID}.mp3`]);
console.log('Old story, questions and audio removed');

console.log('\nDone! Story is now at ID: ' + NEW_ID);
