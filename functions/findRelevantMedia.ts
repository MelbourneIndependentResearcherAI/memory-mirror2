import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { context, current_era, conversation_topics } = await req.json();

    // Fetch family media and memories using service role
    const [media, memories] = await Promise.all([
      base44.asServiceRole.entities.FamilyMedia.list('-created_date', 100),
      base44.asServiceRole.entities.Memory.list('-created_date', 100)
    ]);

    // Use AI to intelligently match media/memories to conversation context
    const analysisPrompt = `You are analyzing a conversation to find relevant photos and memories for a person with dementia.

CONVERSATION CONTEXT: ${context}
CURRENT ERA: ${current_era}
RECENT TOPICS: ${conversation_topics?.join(', ') || 'general conversation'}

AVAILABLE PHOTOS:
${media.slice(0, 20).map((m, i) => `${i+1}. "${m.title}" (${m.era || 'unknown era'}) - ${m.caption || 'no description'}
   People: ${m.people_in_media?.join(', ') || 'none listed'}`).join('\n')}

AVAILABLE MEMORIES:
${memories.slice(0, 20).map((m, i) => `${i+1}. "${m.title}" (${m.era || 'present'}, ${m.emotional_tone || 'neutral'}) - ${m.description?.substring(0, 100)}...
   Location: ${m.location || 'not specified'}
   People: ${m.people_involved?.join(', ') || 'not specified'}`).join('\n')}

TASK: Identify which photos and memories are most relevant to the current conversation. Consider:
1. Era match (is the conversation happening in a specific time period?)
2. Emotional context (what would bring comfort or joy right now?)
3. Topic relevance (names, places, activities mentioned)
4. Therapeutic value (what would help redirect if there's anxiety?)

For EACH selected item, generate a personalized conversation prompt that invites them to discuss that memory.

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