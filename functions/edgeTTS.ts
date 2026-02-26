import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, voice = 'en-US-JennyNeural', rate = '0%', pitch = '0Hz' } = await req.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    // Use Microsoft Edge TTS API (free and high-quality)
    const ssml = `<speak version='1.0' xml:lang='en-US'>
      <voice name='${voice}'>
        <prosody rate='${rate}' pitch='${pitch}'>
          ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </prosody>
      </voice>
    </speak>`;

    const ttsResponse = await fetch('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: ssml
    });

    if (!ttsResponse.ok) {
      return Response.json({ error: 'TTS generation failed' }, { status: 500 });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return Response.json({
      audio: `data:audio/mp3;base64,${base64Audio}`,
      voice: voice,
      text: text
    });

  } catch (error) {
    console.error('Edge TTS error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});