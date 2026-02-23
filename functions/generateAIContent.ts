import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, userProfile, existingStories = [], existingMemories = [] } = await req.json();

    let result;

    if (type === 'story') {
      // Generate personalized story
      const prompt = `You are a creative storyteller crafting a personalized story for an elderly person with dementia.

Patient Profile:
- Name: ${userProfile.loved_one_name}
- Preferred Name: ${userProfile.preferred_name || userProfile.loved_one_name}
- Birth Year: ${userProfile.birth_year}
- Favorite Era: ${userProfile.favorite_era}
- Interests: ${userProfile.interests?.join(', ') || 'general interests'}
- Important People: ${userProfile.important_people?.map(p => p.name).join(', ') || 'family members'}
- Life Experiences: ${userProfile.life_experiences?.map(e => e.title).join(', ') || 'various experiences'}

Previously Created Stories Themes: ${existingStories.length > 0 ? existingStories.slice(0, 3).map(s => s.title).join(', ') : 'none yet'}

Create a warm, engaging, SHORT story (2-3 paragraphs) that:
1. Connects to their favorite era and interests
2. Includes positive emotions and familiar themes
3. Is comforting and nostalgic
4. Uses simple, clear language
5. Avoids sad or confusing elements

Format as JSON: { "title": "Story Title", "content": "Story content", "theme": "family|friendship|nature|adventure|comfort|childhood|holidays", "mood": "happy|peaceful|nostalgic|exciting|comforting" }`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            theme: { type: 'string' },
            mood: { type: 'string' }
          },
          required: ['title', 'content', 'theme', 'mood']
        }
      });

      result = {
        type: 'story',
        story: response
      };
    } else if (type === 'journal_prompt') {
      // Generate journal prompts
      const prompt = `Generate 5 gentle journal prompts for an elderly person with dementia to encourage reflection and engagement.

Patient Profile:
- Name: ${userProfile.loved_one_name}
- Interests: ${userProfile.interests?.join(', ') || 'general interests'}
- Important People: ${userProfile.important_people?.map(p => p.name).join(', ') || 'family'}
- Favorite Era: ${userProfile.favorite_era}

Create prompts that:
1. Are simple and encouraging
2. Connect to their interests and memories
3. Are positive and nostalgic
4. Don't require complex thinking
5. Invite sharing and storytelling

Format as JSON: { "prompts": ["prompt1", "prompt2", "prompt3", "prompt4", "prompt5"] }`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            prompts: { type: 'array', items: { type: 'string' } }
          },
          required: ['prompts']
        }
      });

      result = {
        type: 'journal_prompts',
        prompts: response.prompts
      };
    } else if (type === 'cognitive_exercise') {
      // Generate cognitive exercises based on cognitive level
      const { cognitiveLevel } = await req.json();

      const levelDescriptions = {
        1: 'Very mild cognitive decline - can handle complex activities with minor support',
        2: 'Mild cognitive decline - needs some guidance, enjoys games',
        3: 'Moderate cognitive decline - shorter games, simple rules, visual support helpful',
        4: 'Moderately severe - very simple games, large text, familiar concepts',
        5: 'Severe - extremely simple, sensory engagement, emotional comfort',
        6: 'Very severe - recognition activities, music, touch, comfort focus'
      };

      const prompt = `Generate cognitive exercise content for someone at cognitive level ${cognitiveLevel} (${levelDescriptions[cognitiveLevel]}).

Patient Profile:
- Name: ${userProfile.loved_one_name}
- Interests: ${userProfile.interests?.join(', ') || 'general'}
- Favorite Era: ${userProfile.favorite_era}

Create appropriate exercises for this level:
- Level 1-2: Complex crosswords, detailed bingo, trivia
- Level 3: Medium crosswords, bingo with visual aids
- Level 4: Simple bingo, large text puzzles
- Level 5: Very simple matching, familiar words
- Level 6: Recognition cards, sensory activities

Format as JSON with exercise type based on level (bingo or crossword).

Example bingo format: { "type": "bingo", "title": "...", "cards": [{ "numbers": [...25 numbers], "numbers_called": [...] }], "difficulty": "..." }
Example crossword format: { "type": "crossword", "title": "...", "grid": [...], "clues": { "across": [...], "down": [...] }, "difficulty": "..." }`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            title: { type: 'string' },
            difficulty: { type: 'string' }
          }
        }
      });

      result = {
        type: 'cognitive_exercise',
        exercise: response,
        cognitiveLevel
      };
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});