import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reflection_type } = await req.json();

    // Fetch relevant content based on reflection type
    const memories = await base44.entities.Memory.list('-created_date', 20);
    const familyMedia = await base44.entities.FamilyMedia.list('-created_date', 20);
    const music = await base44.entities.Music.list('-created_date', 20);
    const stories = await base44.entities.Story.list('-created_date', 20);
    const profile = await base44.entities.UserProfile.list();

    const userProfile = profile[0] || {};
    const lovedOneName = userProfile.loved_one_name || 'there';
    const preferredEra = userProfile.favorite_era || 'present';

    // Select content for this reflection session
    const selectedMemories = memories.slice(0, 3);
    const selectedPhotos = familyMedia.filter(m => m.media_type === 'photo').slice(0, 2);
    const selectedMusic = music.slice(0, 2);
    const selectedStory = stories[0];

    // Generate AI-powered reflection prompts
    const prompt = `You are a compassionate AI companion helping ${lovedOneName} reflect on positive memories.

Available content for this reflection session:
- Memories: ${selectedMemories.map(m => m.description).join(', ')}
- Photos: ${selectedPhotos.map(p => p.caption || p.title).join(', ')}
- Music: ${selectedMusic.map(m => `${m.title} by ${m.artist}`).join(', ')}
- Story: ${selectedStory?.title || 'none'}

Create a warm, guided reflection session with 3-4 gentle prompts that:
1. Start by mentioning a specific happy memory or photo
2. Ask open-ended questions about feelings and experiences
3. Connect memories to the present day in a comforting way
4. End with a positive affirmation

Return as JSON array of reflection steps:
[
  {
    "type": "intro",
    "content": "warm greeting",
    "media_id": "optional_photo_or_music_id",
    "media_type": "photo|music|story"
  },
  {
    "type": "reflection",
    "content": "gentle question or prompt",
    "media_id": "optional_id"
  },
  ...
]

Keep each prompt short (2-3 sentences) and emotionally supportive.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          session_title: { type: "string" },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                content: { type: "string" },
                media_id: { type: "string" },
                media_type: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Attach actual content objects for easy rendering
    const stepsWithContent = response.steps.map(step => {
      let mediaContent = null;
      if (step.media_id) {
        if (step.media_type === 'photo') {
          mediaContent = selectedPhotos.find(p => p.id === step.media_id) || selectedPhotos[0];
        } else if (step.media_type === 'music') {
          mediaContent = selectedMusic.find(m => m.id === step.media_id) || selectedMusic[0];
        } else if (step.media_type === 'story') {
          mediaContent = selectedStory;
        }
      }
      return { ...step, media_content: mediaContent };
    });

    return Response.json({
      session_title: response.session_title,
      steps: stepsWithContent,
      content_pool: {
        memories: selectedMemories,
        photos: selectedPhotos,
        music: selectedMusic,
        story: selectedStory
      }
    });

  } catch (error) {
    console.error('Memory reflection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});