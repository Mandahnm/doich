import { NextResponse } from 'next/server';
import { createClient }  from '@supabase/supabase-js';

// Server-side Supabase with service role — never exposed to the browser
function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * POST /api/admin/generate-tts
 *
 * Body: { story_id: string, secret: string }
 *
 * 1. Verifies ADMIN_SECRET
 * 2. Fetches the story body from Supabase
 * 3. Calls OpenAI gpt-4o-mini-tts to synthesise German narration
 * 4. Uploads the MP3 to Supabase Storage bucket "story-audio"
 * 5. Saves the public URL back to stories.audio_url
 *
 * Run once per story after seeding:
 *   curl -X POST http://localhost:3000/api/admin/generate-tts \
 *        -H "Content-Type: application/json" \
 *        -d '{"story_id":"<uuid>","secret":"<ADMIN_SECRET>"}'
 */
export async function POST(request) {
  try {
    const { story_id, secret } = await request.json();

    // ── Auth guard ────────────────────────────────────────────────────────
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!story_id) {
      return NextResponse.json({ error: 'story_id required' }, { status: 400 });
    }

    const sb = getServerSupabase();

    // ── Fetch story ───────────────────────────────────────────────────────
    const { data: story, error: fetchErr } = await sb
      .from('stories')
      .select('id, title, body')
      .eq('id', story_id)
      .single();

    if (fetchErr || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // ── Build narration text ──────────────────────────────────────────────
    // Concatenate all German paragraph texts with a short pause between them
    const narrationText = (story.body || [])
      .map(p => p.text)
      .join('\n\n');

    if (!narrationText.trim()) {
      return NextResponse.json({ error: 'Story body is empty' }, { status: 400 });
    }

    // ── Call OpenAI gpt-4o-mini-tts ───────────────────────────────────────
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model:        'gpt-4o-mini-tts',
        input:        narrationText,
        voice:        'alloy',
        instructions: 'Speak in clear, standard German at a calm teaching pace. Pronounce each word carefully.',
        response_format: 'mp3',
      }),
    });

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text();
      console.error('OpenAI TTS error:', errText);
      return NextResponse.json({ error: 'TTS generation failed', detail: errText }, { status: 502 });
    }

    // ── Upload MP3 to Supabase Storage ────────────────────────────────────
    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
    const fileName    = `${story_id}.mp3`;

    const { error: uploadErr } = await sb.storage
      .from('story-audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert:      true,          // overwrite if re-generating
      });

    if (uploadErr) {
      console.error('Storage upload error:', uploadErr.message);
      return NextResponse.json({ error: 'Upload failed', detail: uploadErr.message }, { status: 500 });
    }

    // ── Get public URL ────────────────────────────────────────────────────
    const { data: { publicUrl } } = sb.storage
      .from('story-audio')
      .getPublicUrl(fileName);

    // ── Save URL back to stories table ────────────────────────────────────
    const { error: updateErr } = await sb
      .from('stories')
      .update({ audio_url: publicUrl })
      .eq('id', story_id);

    if (updateErr) {
      console.error('DB update error:', updateErr.message);
      return NextResponse.json({ error: 'DB update failed', detail: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, url: publicUrl, story_id });

  } catch (err) {
    console.error('generate-tts error:', err);
    return NextResponse.json({ error: 'Internal error', detail: err.message }, { status: 500 });
  }
}
