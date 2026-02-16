import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { context, sentiment_analysis, detected_era } = await req.json();

    // Fetch relevant memories and media
    const memories = await base44.asServiceRole.entities.Memory.list('-created_date', 20);
    const mediaItems = await base44.asServiceRole.entities.FamilyMedia.list('-created_date', 20);
    const safeZones = await base44.asServiceRole.entities.SafeMemoryZone.list();

    // Use LLM to intelligently select relevant memories
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are helping select relevant positive memories to share with a person with dementia.

Current context: ${context}
Emotional state: ${JSON.stringify(sentiment_analysis)}
Detected era: ${detected_era}

Available memories: ${JSON.stringify(memories.slice(0, 10).map(m => ({
  id: m.id,
  title: m.title,
  description: m.description,
  era: m.era,
  emotional_tone: m.emotional_tone,
  people_involved: m.people_involved,
  location: m.location
})))}

Available photos/videos: ${JSON.stringify(mediaItems.slice(0, 10).map(m => ({
  id: m.id,
  title: m.title,
  caption: m.caption,
  era: m.era,
  people_in_media: m.people_in_media
})))}

Safe topics: ${JSON.stringify(safeZones.map(s => ({
  title: s.title,
  description: s.description,
  keywords: s.keywords
})))}

Select 1-3 relevant memories or media items that would be most comforting and appropriate given the current emotional state and context.
If anxiety is high, prioritize calming, safe memories. Match the detected era if possible.

Return the selected items with reasoning for why they're appropriate.`,
      response_json_schema: {
        type: 'object',
        properties: {
          selected_memories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                type: { type: 'string', enum: ['memory', 'media'] },
                title: { type: 'string' },
                reasoning: { type: 'string' },
                suggested_mention: { type: 'string' }
              }
            }
          },
          should_proactively_mention: {
            type: 'boolean'
          },
          tone_recommendation: {
            type: 'string'
          }
        }
      }
    });

    // Enrich with full data
    const enrichedMemories = result.selected_memories?.map(item => {
      if (item.type === 'memory') {
        const memory = memories.find(m => m.id === item.id);
        return { ...item, full_data: memory };
      } else if (item.type === 'media') {
        const media = mediaItems.find(m => m.id === item.id);
        return { ...item, full_data: media };
      }
      return item;
    });

    return Response.json({
      ...result,
      selected_memories: enrichedMemories
    });
  } catch (error) {
    console.error('Memory recall error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});