import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentType = 'story', theme, mood } = await req.json();

    // Fetch user's personal data
    const [profiles, journals, media, memories, lifeExperiences] = await Promise.all([
      base44.entities.UserProfile.list(),
      base44.entities.CareJournal.list('-entry_date', 10),
      base44.entities.FamilyMedia.list('-created_date', 15),
      base44.entities.Memory.list('-created_date', 20),
      base44.asServiceRole.entities.UserProfile.list()
    ]);

    const profile = profiles[0] || {};
    const experiences = profile.life_experiences || [];
    const importantPeople = profile.important_people || [];

    // Prepare rich context from their life
    const lifeContext = `
PERSONAL PROFILE:
- Name: ${profile.loved_one_name || 'someone special'}
- Birth Year: ${profile.birth_year || 'the past'}
- Favorite Era: ${profile.favorite_era || 'the good old days'}
- Interests: ${profile.interests?.join(', ') || 'many wonderful things'}

IMPORTANT PEOPLE IN THEIR LIFE:
${importantPeople.map(p => `- ${p.name} (${p.relationship})`).join('\n') || 'Family and friends who care deeply'}

LIFE EXPERIENCES & STORIES:
${experiences.map(exp => `- ${exp.title}: ${exp.description || ''} (${exp.era || ''})`).join('\n') || 'A lifetime of beautiful moments'}

RECENT CARE JOURNAL OBSERVATIONS:
${journals.slice(0, 5).map(j => `- ${j.title}: ${j.notes?.substring(0, 100) || ''}`).join('\n') || 'Peaceful days filled with care'}

FAMILY MEDIA CAPTIONS:
${media.slice(0, 8).map(m => `- ${m.title}: ${m.caption?.substring(0, 80) || ''} (${m.era || ''})`).join('\n') || 'Cherished photographs and moments'}

PRESERVED MEMORIES:
${memories.slice(0, 10).map(m => `- ${m.title}: ${m.description?.substring(0, 100) || ''}`).join('\n') || 'Precious memories held close'}
`;

    const contentRequest = contentType === 'poem' 
      ? `Write a gentle, heartfelt poem (8-12 lines)` 
      : `Write a short, comforting story (300-400 words)`;

    const creativePrompt = `
${contentRequest} that is DEEPLY PERSONALIZED to this individual's life.

${lifeContext}

REQUIREMENTS:
- Theme: ${theme || 'comfort and nostalgia'}
- Mood: ${mood || 'peaceful and warm'}
- Incorporate their actual life experiences, people, and interests
- Use their favorite era's language and cultural references
- Reference specific details from their memories and photos
- Make it feel like their own story being told back to them
- Keep language simple and emotionally resonant
- End on a comforting, affirming note

This should feel like a gift created just for them - a reflection of their beautiful life and the people who love them.
`;

    const creative = await base44.integrations.Core.InvokeLLM({
      prompt: creativePrompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          personal_elements_included: {
            type: "array",
            items: { type: "string" }
          },
          emotional_tone: { type: "string" },
          suggested_narration_style: { type: "string" }
        },
        required: ["title", "content"]
      }
    });

    // Ensure we have valid content
    if (!creative.title || !creative.content) {
      throw new Error('Story generation returned incomplete data');
    }

    // Save as a personalized story/poem
    await base44.asServiceRole.entities.Story.create({
      title: creative.title,
      content: creative.content,
      era: profile.favorite_era || 'any',
      theme: theme || 'family',
      mood: mood || 'peaceful',
      length: contentType === 'poem' ? 'short' : 'medium',
      uploaded_by_family: false,
      narrator_note: `Deeply personalized for ${profile.loved_one_name}. ${creative.suggested_narration_style || 'Read with warmth'}`
    });

    return Response.json({
      success: true,
      creative,
      personalization: {
        elements: creative.personal_elements_included,
        based_on: {
          life_experiences: experiences.length,
          important_people: importantPeople.length,
          family_media: media.length,
          preserved_memories: memories.length
        }
      }
    });

  } catch (error) {
    console.error('Personalized story generation error:', error);
    return Response.json({ 
      error: error.message,
      fallback: {
        title: "A Peaceful Moment",
        content: "Once upon a time, in a place filled with love and care, there was comfort and peace."
      }
    }, { status: 500 });
  }
});