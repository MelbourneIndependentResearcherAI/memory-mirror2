import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, voice_id, stability = 0.75, similarity_boost = 0.75 } = await req.json();
    
    if (!text || !voice_id) {
      return Response.json({ 
        error: 'Missing required fields: text and voice_id' 
      }, { status: 400 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json({ 
        error: 'ElevenLabs API key not configured',
        fallback: true
      }, { status: 500 });
    }

    // Call ElevenLabs text-to-speech API with cloned voice
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: stability,
            similarity_boost: similarity_boost,
          }
        })
      }
    );

    if (!ttsResponse.ok) {
      const error = await ttsResponse.text();
      return Response.json({ 
        error: 'Voice synthesis failed', 
        details: error,
        fallback: true
      }, { status: ttsResponse.status });
    }

    // Return audio stream
    const audioBuffer = await ttsResponse.arrayBuffer();
    
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      }
    });

  } catch (error) {
    console.error('Voice synthesis error:', error);
    return Response.json({ 
      error: error.message || 'Voice synthesis failed',
      fallback: true
    }, { status: 500 });
  }
});