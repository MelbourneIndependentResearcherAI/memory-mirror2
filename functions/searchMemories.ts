import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { natural_query, current_era, search_type = 'comprehensive' } = await req.json();

    if (!natural_query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Fetch all memories and photos
    const [memories, photos, sharedMemories] = await Promise.all([
      base44.asServiceRole.entities.Memory.list('-created_date', 200),
      base44.asServiceRole.entities.FamilyMedia.list('-created_date', 200),
      base44.asServiceRole.entities.SharedMemory.list('-created_date', 200)
    ]);

    // Use AI to intelligently interpret search query and match results
    const searchPrompt = `You are a memory search assistant for a person with dementia. Analyze the search query and find the most relevant memories and photos.

USER'S SEARCH QUERY: "${natural_query}"
CURRENT ERA CONTEXT: ${current_era}

AVAILABLE MEMORIES (${memories.length} total):
${memories.slice(0, 50).map((m, i) => `${i+1}. "${m.title}" (${m.era}, ${m.emotional_tone})
   Description: ${m.description?.substring(0, 150)}...
   People: ${m.people_involved?.join(', ') || 'none'}
   Location: ${m.location || 'not specified'}
   Tags: ${m.tags?.join(', ') || 'none'}`).join('\n\n')}

AVAILABLE PHOTOS/VIDEOS (${photos.length} total):
${photos.slice(0, 50).map((p, i) => `${i+1}. "${p.title}" (${p.era || 'unknown'})
   Caption: ${p.caption || 'no description'}
   People: ${p.people_in_media?.join(', ') || 'none'}
   Type: ${p.media_type}`).join('\n\n')}

SHARED FAMILY MEMORIES (${sharedMemories.length} total):
${sharedMemories.slice(0, 30).map((s, i) => `${i+1}. "${s.title}" (${s.era || 'unknown'}, ${s.memory_type})
   Content: ${s.content?.substring(0, 100)}...
   People: ${s.people_involved?.join(', ') || 'none'}
   Tags: ${s.tags?.join(', ') || 'none'}`).join('\n\n')}

TASK:
1. Interpret the user's natural language query
2. Find the most relevant memories and photos (rank by relevance)
3. For each result, explain WHY it matches the query
4. Provide a relevance score (0-1)
5. Give a brief interpretation of what the user is looking for

Return results ordered by relevance (highest first).`;

    const searchResults = await base44.integrations.Core.InvokeLLM({
      prompt: searchPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          interpretation: { 
            type: 'string',
            description: 'What the user is looking for in plain language'
          },
          memory_results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                memory_number: { type: 'number' },
                relevance_score: { type: 'number' },
                relevance_reason: { type: 'string' }
              }
            }
          },
          photo_results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                photo_number: { type: 'number' },
                relevance_score: { type: 'number' },
                relevance_reason: { type: 'string' }
              }
            }
          },
          shared_memory_results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                memory_number: { type: 'number' },
                relevance_score: { type: 'number' },
                relevance_reason: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Map results back to actual records
    const matchedMemories = searchResults.memory_results
      ?.map(result => {
        const memory = memories[result.memory_number - 1];
        return memory ? {
          ...memory,
          relevance_score: result.relevance_score,
          relevance_reason: result.relevance_reason
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.relevance_score - a.relevance_score) || [];

    const matchedPhotos = searchResults.photo_results
      ?.map(result => {
        const photo = photos[result.photo_number - 1];
        return photo ? {
          ...photo,
          relevance_score: result.relevance_score,
          relevance_reason: result.relevance_reason
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.relevance_score - a.relevance_score) || [];

    const matchedSharedMemories = searchResults.shared_memory_results
      ?.map(result => {
        const memory = sharedMemories[result.memory_number - 1];
        return memory ? {
          ...memory,
          relevance_score: result.relevance_score,
          relevance_reason: result.relevance_reason
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.relevance_score - a.relevance_score) || [];

    return Response.json({
      interpretation: searchResults.interpretation,
      memories: matchedMemories.slice(0, 10),
      photos: matchedPhotos.slice(0, 10),
      shared_memories: matchedSharedMemories.slice(0, 5),
      total_results: matchedMemories.length + matchedPhotos.length + matchedSharedMemories.length,
      query: natural_query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Memory search error:', error);
    return Response.json({ 
      error: error.message,
      memories: [],
      photos: [],
      shared_memories: []
    }, { status: 500 });
  }
});