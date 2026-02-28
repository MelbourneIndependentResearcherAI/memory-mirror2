import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Default ElevenLabs voice IDs (pre-made voices, no cloning needed)
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // "Bella" - warm, caring female voice

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, voice_id, stability = 0.5, similarity_boost = 0.75, style = 0.0 } = await req.json();

    if (!text) {
      return Response.json({ error: 'Missing required field: text' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'ElevenLabs API key not configured', fallback: true }, { status: 500 });
    }

    const selectedVoiceId = voice_id || DEFAULT_VOICE_ID;

    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.substring(0, 5000),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability,
            similarity_boost,
            style,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!ttsResponse.ok) {
      const error = await ttsResponse.text();
      return Response.json({ error: 'TTS failed', details: error, fallback: true }, { status: ttsResponse.status });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      }
    });

  } catch (error) {
    return Response.json({ error: error.message, fallback: true }, { status: 500 });
  }
});