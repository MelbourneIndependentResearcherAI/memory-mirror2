import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mood, era, context } = await req.json();

    // Get user profile for personalization
    const profiles = await base44.entities.UserProfile.list();
    const profile = profiles[0];

    // Get user's uploaded music
    const uploadedMusic = await base44.entities.Music.list();

    // Build AI prompt for music suggestions
    const prompt = `You are a music therapy expert specializing in dementia care. Suggest 5 songs that would be appropriate right now.

CONTEXT:
- Current mood: ${mood || 'neutral'}
- Era preference: ${era || 'any'}
- Conversation context: ${context || 'general conversation'}
${profile?.favorite_music?.length > 0 ? `- Their favorite artists: ${profile.favorite_music.join(', ')}` : ''}
${profile?.interests?.length > 0 ? `- Their interests: ${profile.interests.join(', ')}` : ''}

${uploadedMusic.length > 0 ? `AVAILABLE UPLOADED MUSIC:\n${uploadedMusic.map(m => `- ${m.title} by ${m.artist || 'Unknown'}`).join('\n')}` : ''}

Return a JSON array of song suggestions with:
{
  "suggestions": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "reason": "Why this song fits the moment",
      "era": "1940s/1960s/1980s/present",
      "searchQuery": "exact search query for YouTube/Spotify"
    }
  ]
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                artist: { type: 'string' },
                reason: { type: 'string' },
                era: { type: 'string' },
                searchQuery: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json(response);

  } catch (error) {
    console.error('Music suggestion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});