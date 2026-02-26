import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { context, current_era, conversation_topics, emotional_state, anxiety_level, user_profile } = await req.json();

    // Fetch family media and memories using service role
    const [media, memories] = await Promise.all([
      base44.asServiceRole.entities.FamilyMedia.list('-created_date', 100),
      base44.asServiceRole.entities.Memory.list('-created_date', 100)
    ]);

    // Use AI to intelligently match media/memories to conversation context with emotional awareness
    const analysisPrompt = `You are an AI memory assistant analyzing conversation to suggest relevant, comforting memories for a person with dementia.

CONVERSATION CONTEXT: ${context}
CURRENT ERA: ${current_era}
RECENT TOPICS: ${conversation_topics?.join(', ') || 'general conversation'}
EMOTIONAL STATE: ${emotional_state || 'neutral'}
ANXIETY LEVEL: ${anxiety_level || 0}/10
${user_profile ? `
PERSON'S PROFILE:
- Name: ${user_profile.loved_one_name}
- Interests: ${user_profile.interests?.join(', ') || 'unknown'}
- Important people: ${user_profile.important_people?.map(p => `${p.name} (${p.relationship})`).join(', ') || 'unknown'}
` : ''}

AVAILABLE PHOTOS:
${media.slice(0, 20).map((m, i) => `${i+1}. "${m.title}" (${m.era || 'unknown era'}) - ${m.caption || 'no description'}
   People: ${m.people_in_media?.join(', ') || 'none listed'}`).join('\n')}

AVAILABLE MEMORIES:
${memories.slice(0, 20).map((m, i) => `${i+1}. "${m.title}" (${m.era || 'present'}, ${m.emotional_tone || 'neutral'}) - ${m.description?.substring(0, 100)}...
   Location: ${m.location || 'not specified'}
   People: ${m.people_involved?.join(', ') || 'not specified'}`).join('\n')}

CRITICAL THERAPEUTIC GUIDELINES:
- If anxiety is HIGH (7+): Select ONLY calming, safe, joyful memories from their comfort zone
- If anxiety is MEDIUM (4-6): Select positive, familiar memories
- If anxiety is LOW: Can explore any relevant memories
- ALWAYS prioritize memories matching their current era
- Consider their interests and important people

TASK: Intelligently select the MOST relevant and therapeutic photos/memories. Consider:
1. **Emotional Appropriateness**: Match to current emotional state and anxiety level
2. **Era Alignment**: Prioritize memories from detected era
3. **Topic Relevance**: Direct connections to what they're talking about
4. **Therapeutic Value**: What would bring comfort, joy, or meaningful connection?
5. **Personal Significance**: Leverage profile data (interests, important people)

For EACH selected item, generate a warm, personalized conversation starter that feels natural.

Return a JSON object with:
{
  "relevant_photos": [array of photo numbers that are relevant, max 3],
  "relevant_memories": [array of memory numbers that are relevant, max 3],
  "photo_prompts": ["personalized prompt for photo 1", "prompt for photo 2", ...],
  "memory_prompts": ["personalized prompt for memory 1", "prompt for memory 2", ...],
  "reasoning": "brief explanation of why these are relevant",
  "should_show": true/false (show popup only if highly relevant),
  "suggested_mention": "a natural way to introduce these memories in conversation"
}`;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          relevant_photos: { type: "array", items: { type: "number" } },
          relevant_memories: { type: "array", items: { type: "number" } },
          photo_prompts: { type: "array", items: { type: "string" } },
          memory_prompts: { type: "array", items: { type: "string" } },
          reasoning: { type: "string" },
          should_show: { type: "boolean" },
          suggested_mention: { type: "string" }
        },
        required: ["relevant_photos", "relevant_memories", "should_show"]
      }
    });

    // Map numbers back to actual records and enrich with AI prompts
    const selectedPhotos = aiAnalysis.relevant_photos
      ?.map((num, idx) => {
        const photo = media[num - 1];
        return photo ? { ...photo, ai_prompt: aiAnalysis.photo_prompts?.[idx] } : null;
      })
      .filter(Boolean) || [];
    
    const selectedMemories = aiAnalysis.relevant_memories
      ?.map((num, idx) => {
        const memory = memories[num - 1];
        return memory ? { ...memory, ai_prompt: aiAnalysis.memory_prompts?.[idx] } : null;
      })
      .filter(Boolean) || [];

    return Response.json({
      photos: selectedPhotos,
      memories: selectedMemories,
      should_show: aiAnalysis.should_show,
      reasoning: aiAnalysis.reasoning,
      suggested_mention: aiAnalysis.suggested_mention
    });

  } catch (error) {
    console.error('Error finding relevant media:', error);
    return Response.json({ 
      error: error.message,
      photos: [],
      memories: [],
      should_show: false
    }, { status: 500 });
  }
});