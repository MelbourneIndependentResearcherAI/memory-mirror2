import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    // Use LLM to analyze sentiment and emotional state
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the emotional state and sentiment of this text from a person with dementia. 
      
Text: "${text}"

Provide a detailed emotional analysis including:
- Overall sentiment (positive, negative, neutral, mixed)
- Emotional tone (calm, anxious, confused, distressed, happy, sad, fearful, angry, nostalgic, content)
- Anxiety level (0-10 scale)
- Detected themes (confusion, fear, loneliness, joy, memory recall, physical discomfort, paranoia, etc.)
- Recommended response approach (validate, redirect, reassure, engage positively, etc.)
- Any trigger words or phrases that indicate specific concerns

Be sensitive and specific to dementia care contexts.`,
      response_json_schema: {
        type: 'object',
        properties: {
          sentiment: {
            type: 'string',
            enum: ['positive', 'negative', 'neutral', 'mixed']
          },
          emotional_tone: {
            type: 'array',
            items: { type: 'string' }
          },
          anxiety_level: {
            type: 'number',
            description: 'Anxiety level from 0-10'
          },
          themes: {
            type: 'array',
            items: { type: 'string' }
          },
          response_approach: {
            type: 'string'
          },
          trigger_words: {
            type: 'array',
            items: { type: 'string' }
          },
          needs_immediate_attention: {
            type: 'boolean'
          }
        },
        required: ['sentiment', 'emotional_tone', 'anxiety_level', 'themes', 'response_approach']
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});