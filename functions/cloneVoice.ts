import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { audio_file_url, voice_name, voice_description } = await req.json();
    
    if (!audio_file_url || !voice_name) {
      return Response.json({ 
        error: 'Missing required fields: audio_file_url and voice_name' 
      }, { status: 400 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json({ 
        error: 'ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to your environment variables.',
        setup_url: 'https://elevenlabs.io/app/settings/api-keys'
      }, { status: 500 });
    }

    // Fetch the audio file
    const audioResponse = await fetch(audio_file_url);
    if (!audioResponse.ok) {
      return Response.json({ error: 'Failed to fetch audio file' }, { status: 400 });
    }
    
    const audioBlob = await audioResponse.blob();

    // Create form data for ElevenLabs API
    const formData = new FormData();
    formData.append('name', voice_name);
    formData.append('files', audioBlob, 'sample.mp3');
    
    if (voice_description) {
      formData.append('description', voice_description);
    }

    // Call ElevenLabs voice cloning API
    const cloneResponse = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData
    });

    if (!cloneResponse.ok) {
      const error = await cloneResponse.text();
      return Response.json({ 
        error: 'Voice cloning failed', 
        details: error 
      }, { status: cloneResponse.status });
    }

    const result = await cloneResponse.json();

    return Response.json({
      success: true,
      voice_id: result.voice_id,
      message: 'Voice cloned successfully'
    });

  } catch (error) {
    console.error('Voice cloning error:', error);
    return Response.json({ 
      error: error.message || 'Voice cloning failed' 
    }, { status: 500 });
  }
});