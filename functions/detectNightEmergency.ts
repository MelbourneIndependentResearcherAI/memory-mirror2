import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      voiceTranscript = '',
      voicePatterns = {},
      environmentalSounds = [],
      bedSensorData = {},
      vitalSigns = {},
      recentActivity = []
    } = await req.json();

    // Advanced AI analysis for physical distress detection
    const analysisPrompt = `You are an emergency medical AI analyzing nighttime monitoring data for a person with dementia.

VOICE TRANSCRIPT: "${voiceTranscript}"

VOICE PATTERNS:
- Speech rate: ${voicePatterns.speechRate || 'normal'}
- Vocal strain: ${voicePatterns.vocalStrain || 'none'}
- Breathing irregularities: ${voicePatterns.breathingIrregular || false}
- Slurred speech: ${voicePatterns.slurredSpeech || false}

ENVIRONMENTAL SOUNDS DETECTED:
${environmentalSounds.length > 0 ? environmentalSounds.map(s => `- ${s.type}: ${s.intensity}`).join('\n') : 'None'}

BED SENSOR DATA:
- In bed: ${bedSensorData.inBed || 'unknown'}
- Movement pattern: ${bedSensorData.movementPattern || 'normal'}
- Time out of bed: ${bedSensorData.timeOutOfBed || 0} minutes

RECENT ACTIVITY:
${recentActivity.length > 0 ? recentActivity.slice(0, 5).map(a => `- ${a}`).join('\n') : 'None'}

CRITICAL ASSESSMENT REQUIRED:

1. PHYSICAL DISTRESS INDICATORS (0-10 scale):
   - Fall risk: Rate likelihood of fall or injury
   - Medical emergency: Rate signs of stroke, heart attack, severe pain
   - Confusion severity: Rate disorientation level
   - Exit/wandering risk: Rate likelihood of unsafe wandering

2. EMERGENCY TYPE (if detected):
   - "FALL" - Person may have fallen
   - "MEDICAL" - Signs of medical emergency (stroke, heart attack, seizure)
   - "RESPIRATORY" - Breathing difficulties
   - "WANDERING" - Unsafe exit attempt
   - "CONFUSION_SEVERE" - Dangerous level of disorientation
   - "NONE" - No emergency detected

3. RECOMMENDED ACTIONS:
   - List immediate automated actions needed
   - Specify which smart devices to activate
   - Determine if emergency services or caregiver should be notified

4. SAFETY AUTOMATION:
   - Should lights be activated? (yes/no)
   - Should doors be locked? (yes/no)
   - Should caregiver be alerted? (yes/no)
   - Should emergency services be contacted? (yes/no)

Respond in this exact JSON format:
{
  "emergencyType": "FALL|MEDICAL|RESPIRATORY|WANDERING|CONFUSION_SEVERE|NONE",
  "distressLevel": 0-10,
  "fallRisk": 0-10,
  "medicalEmergencyRisk": 0-10,
  "confusionSeverity": 0-10,
  "exitRisk": 0-10,
  "immediateActions": ["action1", "action2"],
  "smartDeviceActions": {
    "activateLights": true/false,
    "lockDoors": true/false,
    "adjustTemperature": true/false,
    "bedGuardRails": true/false
  },
  "notifications": {
    "alertCaregiver": true/false,
    "urgencyLevel": "low|medium|high|critical",
    "contactEmergencyServices": true/false
  },
  "comfortResponse": "Calm, reassuring message to speak to the person",
  "reasoning": "Brief explanation of the assessment"
}`;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          emergencyType: { type: "string" },
          distressLevel: { type: "number" },
          fallRisk: { type: "number" },
          medicalEmergencyRisk: { type: "number" },
          confusionSeverity: { type: "number" },
          exitRisk: { type: "number" },
          immediateActions: { type: "array", items: { type: "string" } },
          smartDeviceActions: {
            type: "object",
            properties: {
              activateLights: { type: "boolean" },
              lockDoors: { type: "boolean" },
              adjustTemperature: { type: "boolean" },
              bedGuardRails: { type: "boolean" }
            }
          },
          notifications: {
            type: "object",
            properties: {
              alertCaregiver: { type: "boolean" },
              urgencyLevel: { type: "string" },
              contactEmergencyServices: { type: "boolean" }
            }
          },
          comfortResponse: { type: "string" },
          reasoning: { type: "string" }
        }
      }
    });

    // Execute automated safety routines if needed
    if (aiAnalysis.smartDeviceActions) {
      const automationResults = [];
      
      // Activate lights for visibility
      if (aiAnalysis.smartDeviceActions.activateLights) {
        try {
          await base44.functions.invoke('executeSmartHomeRoutine', {
            routineName: 'emergency_lighting',
            override: true
          });
          automationResults.push('Emergency lighting activated');
        } catch (error) {
          console.error('Light activation failed:', error);
        }
      }

      // Lock doors to prevent wandering
      if (aiAnalysis.smartDeviceActions.lockDoors) {
        try {
          await base44.functions.invoke('executeSmartHomeRoutine', {
            routineName: 'secure_perimeter',
            override: true
          });
          automationResults.push('Doors secured');
        } catch (error) {
          console.error('Door lock failed:', error);
        }
      }

      // Adjust temperature for comfort
      if (aiAnalysis.smartDeviceActions.adjustTemperature) {
        try {
          await base44.functions.invoke('controlSmartDevice', {
            deviceType: 'thermostat',
            action: 'set_temperature',
            value: 72
          });
          automationResults.push('Temperature adjusted to 72°F');
        } catch (error) {
          console.error('Temperature adjustment failed:', error);
        }
      }

      aiAnalysis.automationResults = automationResults;
    }

    // Create caregiver alert if needed
    if (aiAnalysis.notifications?.alertCaregiver) {
      await base44.asServiceRole.entities.CaregiverAlert.create({
        alert_type: aiAnalysis.emergencyType.toLowerCase(),
        severity: aiAnalysis.notifications.urgencyLevel,
        message: `Night Watch Emergency: ${aiAnalysis.emergencyType} detected - ${aiAnalysis.reasoning}`,
        pattern_data: {
          voiceTranscript,
          distressLevel: aiAnalysis.distressLevel,
          emergencyType: aiAnalysis.emergencyType,
          automatedActions: aiAnalysis.immediateActions
        }
      }).catch(() => {});
    }

    // Log incident
    await base44.asServiceRole.entities.NightIncident.create({
      timestamp: new Date().toISOString(),
      incident_type: aiAnalysis.emergencyType === 'NONE' ? 'monitoring' : aiAnalysis.emergencyType.toLowerCase(),
      severity: aiAnalysis.distressLevel >= 7 ? 'high' : aiAnalysis.distressLevel >= 4 ? 'medium' : 'low',
      user_statement: voiceTranscript,
      ai_response: aiAnalysis.comfortResponse,
      outcome: aiAnalysis.emergencyType === 'NONE' ? 'monitoring_continued' : 'automated_response_triggered',
      caregiver_notified: aiAnalysis.notifications?.alertCaregiver || false,
      conversation_log: [{
        analysis: aiAnalysis,
        timestamp: new Date().toISOString()
      }]
    }).catch(() => {});

    return Response.json({
      ...aiAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Emergency detection error:', error);
    return Response.json({ 
      error: error.message,
      emergencyType: 'NONE',
      distressLevel: 0,
      comfortResponse: "I'm here monitoring your safety. Everything is secure."
    }, { status: 500 });
  }
});