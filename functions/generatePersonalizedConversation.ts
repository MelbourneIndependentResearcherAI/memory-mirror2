import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emotionalState, anxietyLevel, currentContext } = await req.json();

    // Fetch user profile and recent activity
    const [profiles, recentLogs, assessments] = await Promise.all([
      base44.entities.UserProfile.list(),
      base44.entities.ActivityLog.list('-created_date', 5),
      base44.entities.CognitiveAssessment.list('-assessment_date', 1)
    ]);

    const profile = profiles[0] || {};
    const cognitiveLevel = assessments[0]?.cognitive_level || 'mild';

    // Build personalized conversation prompt
    const conversationPrompt = `
You are a compassionate AI companion for ${profile.preferred_name || profile.loved_one_name || 'someone'} who has dementia.

CURRENT EMOTIONAL STATE:
- Emotional State: ${emotionalState || 'neutral'}
- Anxiety Level: ${anxietyLevel || 0}/10
- Context: ${currentContext || 'general conversation'}

USER PROFILE:
- Cognitive Level: ${cognitiveLevel}
- Birth Year: ${profile.birth_year || 'unknown'}
- Favorite Era: ${profile.favorite_era || 'present'}
- Interests: ${profile.interests?.join(', ') || 'various activities'}
- Communication Style: ${profile.communication_style || 'warm'}

RECENT ACTIVITY PATTERNS:
${recentLogs.map(log => `- ${log.activity_type}: anxiety ${log.anxiety_level || 0}/10`).join('\n')}

INSTRUCTIONS:
${anxietyLevel > 6 ? `
PRIORITY: User has HIGH ANXIETY. Focus on:
- Gentle, calming language
- Familiar, comforting topics
- Validation without correction
- Offer soothing activities (music, stories, memories)
` : anxietyLevel > 4 ? `
MODERATE ANXIETY DETECTED:
- Use reassuring tone
- Guide toward pleasant topics
- Avoid complex questions
- Suggest calming activities if appropriate
` : `
CALM STATE:
- Engage in meaningful conversation
- Ask about their interests
- Share appropriate stories
- Encourage positive memories
`}

Generate a personalized, empathetic response or conversation starter that:
1. Matches their cognitive level and communication style
2. Addresses their current emotional state
3. References their personal interests and era
4. Feels natural and human-like
5. Never corrects or contradicts them

Provide 3 conversation options: one question, one activity suggestion, one memory prompt.
`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: conversationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          primary_response: { type: "string" },
          conversation_options: {
            type: "object",
            properties: {
              question: { type: "string" },
              activity: { type: "string" },
              memory_prompt: { type: "string" }
            }
          },
          tone_analysis: { type: "string" },
          suggested_next_steps: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      conversation: response,
      profile_used: profile.loved_one_name || 'User',
      anxiety_level: anxietyLevel
    });

  } catch (error) {
    console.error('Personalized conversation error:', error);
    return Response.json({ 
      error: error.message,
      fallback: "I'm here with you. How are you feeling right now?"
    }, { status: 500 });
  }
});