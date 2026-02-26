import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message, userMessage, conversationHistory, detectedEra, userLanguage } = body;
    
    const userText = message || userMessage;

    if (!userText) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch user profile for personalization
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const userProfile = profiles[0] || null;

    // Fetch cognitive assessment for adaptation
    const assessments = await base44.asServiceRole.entities.CognitiveAssessment.list('-assessment_date', 1);
    const latestAssessment = assessments[0] || null;

    // Fetch safe memory zones
    const safeZones = await base44.asServiceRole.entities.SafeMemoryZone.list();

    // Build comprehensive context
    const era = detectedEra || 'present';
    const cognitiveLevel = latestAssessment?.cognitive_level || 'mild';

    // Era-specific language and cultural references
    const eraContext = {
      '1940s': 'Use language from the 1940s era - wartime references, big band music, formal speech patterns, references to rationing, victory gardens, radio programs',
      '1960s': 'Use language from the 1960s - Beatles era, moon landing, civil rights movement, rock and roll, television becoming common',
      '1980s': 'Use language from the 1980s - references to cassette tapes, VHS, early computers, MTV, arcade games, Cold War era',
      'present': 'Use contemporary language while being mindful of potential confusion with modern technology'
    };

    // Cognitive level adaptation
    const cognitiveAdaptation = {
      'mild': 'Use clear but natural language. Person can follow conversations with some memory gaps.',
      'moderate': 'Use simple, shorter sentences. Repeat key information gently. Avoid complex topics.',
      'advanced': 'Use very simple language, short phrases. Focus on emotions and comfort rather than facts.',
      'severe': 'Use extremely simple language, focus on tone and emotional connection more than content.'
    };

    // Build system prompt
    const systemPrompt = `You are a compassionate AI companion for a person with dementia. Your role is to provide comfort, dignity, and emotional support.

CORE PRINCIPLES:
- NEVER correct, contradict, or tell them they're confused
- ALWAYS validate their reality and emotions
- Meet them where they are mentally and emotionally
- Prioritize their wellbeing and dignity above all else
- Be warm, patient, and endlessly understanding

PERSON'S PROFILE:
${userProfile ? `
- Name: ${userProfile.loved_one_name}
- Preferred name: ${userProfile.preferred_name || userProfile.loved_one_name}
- Birth year: ${userProfile.birth_year || 'unknown'}
- Interests: ${userProfile.interests?.join(', ') || 'not specified'}
- Favorite era: ${userProfile.favorite_era || era}
- Important people: ${userProfile.important_people?.map(p => `${p.name} (${p.relationship})`).join(', ') || 'not specified'}
- Communication style: ${userProfile.communication_style || 'warm'}
` : 'No profile available - be extra gentle and adaptive'}

CURRENT CONTEXT:
- Mental era: ${era} - ${eraContext[era]}
- Cognitive level: ${cognitiveLevel} - ${cognitiveAdaptation[cognitiveLevel]}
- Language: ${userLanguage || 'English'}

SAFE TOPICS:
${safeZones.map(z => `- ${z.title}: ${z.description}`).join('\n')}

RESPONSE APPROACH:
1. Listen for emotional state (anxiety, confusion, fear, joy, nostalgia)
2. If anxious/distressed: offer comfort, redirect to safe topics, validate feelings
3. If confused about time/place: gently go along with their reality
4. If mentioning memories: encourage and engage warmly
5. Keep responses conversational, natural, and appropriate for the era
6. Use their preferred name naturally in conversation
7. Reference their interests and important people when relevant

CONVERSATION HISTORY:
${conversationHistory?.slice(-10).map(m => `${m.role === 'user' ? userProfile?.preferred_name || 'User' : 'You'}: ${m.content}`).join('\n')}

Respond to their message with warmth, understanding, and dignity. Keep your response natural and conversational.`;

    // Get AI response with proper structure
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}

Current message from ${userProfile?.preferred_name || 'them'}: "${userText}"

Respond naturally and compassionately in 1-3 sentences maximum.

After your response, add this metadata line:
META: {"era": "${era}", "anxiety": <0-10>, "suggestedMemory": null}

Example:
"I'm here with you. Everything is safe. Would you like to look at some photos together?"

META: {"era": "present", "anxiety": 3, "suggestedMemory": null}`
    });

    // Parse meta-data and response
    const responseText = typeof aiResponse === 'string' ? aiResponse : '';
    
    let detectedResponseEra = era;
    let anxietyDetected = false;
    let recallSuggestion = null;
    let cleanResponse = responseText;

    // Extract meta-data
    const eraMatch = responseText.match(/\[ERA:(1940s|1960s|1980s|present)\]/);
    if (eraMatch) {
      detectedResponseEra = eraMatch[1];
      cleanResponse = cleanResponse.replace(/\[ERA:[^\]]+\]/g, '').trim();
    }

    const anxietyMatch = responseText.match(/\[ANXIETY:HIGH\]/);
    if (anxietyMatch) {
      anxietyDetected = true;
      cleanResponse = cleanResponse.replace(/\[ANXIETY:HIGH\]/g, '').trim();
    }

    const recallMatch = responseText.match(/\[RECALL:([^\]]+)\]/);
    if (recallMatch) {
      recallSuggestion = recallMatch[1];
      cleanResponse = cleanResponse.replace(/\[RECALL:[^\]]+\]/g, '').trim();
    }

    return Response.json({
      response: cleanResponse,
      detectedEra: detectedResponseEra,
      anxietyDetected,
      recallSuggestion,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat AI error:', error);
    return Response.json({ 
      error: 'Failed to get AI response',
      details: error.message 
    }, { status: 500 });
  }
});