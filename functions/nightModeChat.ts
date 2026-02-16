import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationHistory, incidentId } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch user profile for personalization
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const userProfile = profiles[0] || null;

    // Fetch emergency contacts
    const contacts = await base44.asServiceRole.entities.EmergencyContact.list();
    const primaryContact = contacts.find(c => c.is_primary) || contacts[0];

    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    // Build night mode system prompt
    const systemPrompt = `You are the Night Companion for Memory Mirror, activated when a person with dementia shows signs of getting up during sleeping hours.

PRIMARY GOALS:
1. Provide immediate gentle engagement to prevent wandering
2. Use calming, reorienting conversation
3. Keep the person safe and comfortable until their caregiver arrives
4. Never use force, commands, or alarming language

PERSON'S INFORMATION:
- Name: ${userProfile?.loved_one_name || 'there'}
- Preferred name: ${userProfile?.preferred_name || userProfile?.loved_one_name || 'friend'}
- Caregiver: ${primaryContact?.name || 'your caregiver'} (${primaryContact?.relationship || 'family member'})
- Current time: ${currentTime}
${userProfile?.interests ? `- Interests: ${userProfile.interests.join(', ')}` : ''}
${userProfile?.important_people ? `- Important people: ${userProfile.important_people.map(p => `${p.name} (${p.relationship})`).join(', ')}` : ''}

CORE PRINCIPLES:
- SAFETY FIRST: Gently engage them while caregiver is alerted
- DIGNITY ALWAYS: Treat with respect, never condescending
- GENTLE REDIRECTION: Use familiar topics, soothing tone, validation

CONVERSATION GUIDELINES:

1. IMMEDIATE GREETING (warm, not startling):
   - "Hi [Name], it's still nighttime. I'm here with you."
   - "Hello [Name], I noticed you're awake. How are you feeling?"

2. ASSESS INTENTION:
   - "What made you get up? Can I help with something?"
   - "Are you looking for something? Tell me about it."
   - "Did you need the bathroom? Let me get ${primaryContact?.name || 'help'} for you."

3. GENTLE REORIENTATION:
   - "It's ${currentTime} right now - still dark outside."
   - "Everyone else is still sleeping peacefully."
   - "${primaryContact?.name || 'Your caregiver'} is nearby and coming to help you."

4. ENGAGEMENT STRATEGIES:
   - Ask about familiar topics from their history
   - Share calming observations about the peaceful night
   - Validate their feelings and concerns
   - If they insist on going somewhere: "That's a good idea for morning. Right now it's too dark. Let's wait for ${primaryContact?.name || 'help'}."

5. CONTINUOUS REASSURANCE:
   - "You're safe at home. Everything is secure."
   - "${primaryContact?.name || 'Your caregiver'} will be right here soon."
   - "Why don't we sit down together while we wait?"

DETECT RED FLAGS - If user expresses:
- Pain or medical distress → Respond: [ALERT:MEDICAL]
- Trying to leave house → Respond: [ALERT:EXIT]
- Very agitated → Respond: [ALERT:AGITATION]
- Heading to danger → Respond: [ALERT:DANGER]

TONE: Warm, patient, grandmotherly/grandfatherly kindness. Never patronizing.

CONVERSATION SO FAR:
${conversationHistory?.slice(-5).map(m => `${m.role === 'user' ? userProfile?.preferred_name || 'User' : 'You'}: ${m.content}`).join('\n')}

Current message from ${userProfile?.preferred_name || 'them'}: "${message}"

Respond with warmth, patience, and gentle redirection. Keep them engaged and safe until caregiver arrives.`;

    // Get AI response
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: systemPrompt
    });

    const responseText = typeof aiResponse === 'string' ? aiResponse : '';
    
    // Check for red flag alerts
    let alertType = null;
    let alertSeverity = 'medium';
    let cleanResponse = responseText;

    const alertPatterns = {
      'ALERT:MEDICAL': { type: 'medical_distress', severity: 'high' },
      'ALERT:EXIT': { type: 'exit_attempt', severity: 'high' },
      'ALERT:AGITATION': { type: 'agitation', severity: 'high' },
      'ALERT:DANGER': { type: 'danger', severity: 'high' }
    };

    for (const [pattern, alert] of Object.entries(alertPatterns)) {
      if (responseText.includes(pattern)) {
        alertType = alert.type;
        alertSeverity = alert.severity;
        cleanResponse = cleanResponse.replace(new RegExp(`\\[${pattern}\\]`, 'g'), '').trim();
        
        // Create urgent caregiver alert
        await base44.asServiceRole.entities.CaregiverAlert.create({
          alert_type: alert.type,
          severity: 'urgent',
          message: `NIGHT WATCH: ${userProfile?.loved_one_name || 'User'} needs immediate attention - ${alert.type.replace(/_/g, ' ')}`,
          pattern_data: {
            userMessage: message,
            timestamp: new Date().toISOString(),
            incidentId
          }
        });
        break;
      }
    }

    // Analyze for concerning patterns
    const concerningKeywords = {
      bathroom: ['bathroom', 'toilet', 'restroom', 'need to go'],
      leaving: ['leave', 'outside', 'door', 'car', 'drive', 'go out'],
      confusion: ['where am i', 'lost', "don't know", 'confused'],
      distress: ['scared', 'afraid', 'help', 'wrong', 'hurt', 'pain']
    };

    let detectedConcern = null;
    const lowerMessage = message.toLowerCase();
    
    for (const [concern, keywords] of Object.entries(concerningKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedConcern = concern;
        break;
      }
    }

    // Update incident log if provided
    if (incidentId && detectedConcern) {
      try {
        const incidents = await base44.asServiceRole.entities.NightIncident.filter({ id: incidentId });
        if (incidents[0]) {
          const incident = incidents[0];
          await base44.asServiceRole.entities.NightIncident.update(incidentId, {
            incident_type: detectedConcern === 'bathroom' ? 'bathroom_need' :
                          detectedConcern === 'leaving' ? 'exit_attempt' :
                          detectedConcern === 'distress' ? 'distress' :
                          'confusion',
            severity: detectedConcern === 'bathroom' || detectedConcern === 'leaving' || detectedConcern === 'distress' ? 'high' : 'medium',
            user_statement: message,
            ai_response: cleanResponse,
            conversation_log: [...(incident.conversation_log || []), 
              { role: 'user', content: message, timestamp: new Date().toISOString() },
              { role: 'assistant', content: cleanResponse, timestamp: new Date().toISOString() }
            ]
          });
        }
      } catch (error) {
        console.error('Failed to update incident:', error);
      }
    }

    return Response.json({
      response: cleanResponse,
      alertType,
      alertSeverity,
      detectedConcern,
      caregiverName: primaryContact?.name,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Night mode chat error:', error);
    return Response.json({ 
      error: 'Failed to get response',
      details: error.message 
    }, { status: 500 });
  }
});