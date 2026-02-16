import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionType } = await req.json();

    // Gather all personalization data
    const profiles = await base44.entities.UserProfile.list();
    const profile = profiles[0];
    
    const photos = await base44.entities.FamilyMedia.filter({ media_type: 'photo' });
    const videos = await base44.entities.FamilyMedia.filter({ media_type: 'video' });
    const memories = await base44.entities.Memory.list('-created_date', 20);

    if (!profile) {
      return Response.json({ 
        error: 'No user profile found. Please set up a profile first.' 
      }, { status: 400 });
    }

    const prompt = `You are a memory care specialist creating an interactive memory session. Generate a structured memory session that uses photos, videos, and life experiences to engage someone with dementia in meaningful conversation.

USER PROFILE:
- Name: ${profile.loved_one_name} (prefers: ${profile.preferred_name || profile.loved_one_name})
- Era: ${profile.favorite_era}
- Interests: ${profile.interests?.join(', ') || 'none listed'}
- Life experiences: ${profile.life_experiences?.map(e => e.title).join(', ') || 'none listed'}
- Important people: ${profile.important_people?.map(p => p.name).join(', ') || 'none listed'}

AVAILABLE MEDIA:
- ${photos.length} photos available: ${photos.slice(0, 5).map(p => p.caption || p.title).join(', ')}
- ${videos.length} videos available
- ${memories.length} documented memories

Create a ${sessionType || 'general'} memory session with 5 interactive prompts that:
1. Reference specific photos/videos when possible
2. Connect to their life experiences and interests
3. Use open-ended questions that encourage storytelling
4. Progress from easy recall to deeper memories
5. Are gentle and never corrective

Return JSON:
{
  "session_title": "string",
  "duration_minutes": 15-30,
  "prompts": [
    {
      "order": 1,
      "media_reference": "photo/video caption or null",
      "opening_statement": "warm introduction to the topic",
      "guiding_questions": ["question 1", "question 2", "question 3"],
      "follow_up_prompts": ["if they engage", "if they hesitate"],
      "memory_triggers": ["specific details to mention"]
    }
  ],
  "closing_statement": "gentle wrap-up"
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          session_title: { type: 'string' },
          duration_minutes: { type: 'number' },
          prompts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                order: { type: 'number' },
                media_reference: { type: 'string' },
                opening_statement: { type: 'string' },
                guiding_questions: { type: 'array', items: { type: 'string' } },
                follow_up_prompts: { type: 'array', items: { type: 'string' } },
                memory_triggers: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          closing_statement: { type: 'string' }
        }
      }
    });

    // Attach actual media objects to prompts
    const sessionWithMedia = {
      ...response,
      prompts: response.prompts.map(prompt => {
        // Find matching media
        let matchingMedia = null;
        if (prompt.media_reference) {
          matchingMedia = photos.find(p => 
            (p.caption && prompt.media_reference.toLowerCase().includes(p.caption.toLowerCase())) ||
            (p.title && prompt.media_reference.toLowerCase().includes(p.title.toLowerCase()))
          );
          if (!matchingMedia) {
            matchingMedia = videos.find(v => 
              v.title && prompt.media_reference.toLowerCase().includes(v.title.toLowerCase())
            );
          }
        }
        
        return {
          ...prompt,
          media: matchingMedia
        };
      })
    };

    return Response.json(sessionWithMedia);

  } catch (error) {
    console.error('Memory session generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});