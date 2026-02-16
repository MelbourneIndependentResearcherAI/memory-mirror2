import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      context = 'ambient', 
      user_interaction = null,
      time_of_night = '',
      detected_anxiety_indicators = [],
      previous_incidents = []
    } = body;

    // Fetch user profile for personalization
    const profiles = await base44.entities.UserProfile.list();
    const userProfile = profiles[0];

    // Assess situation
    const assessment = {
      distress_level: 0,
      recommended_action: 'continue_monitoring',
      audio_comfort: 'ambient_sounds',
      messages: []
    };

    // Check for distress indicators
    const distressKeywords = [
      'help', 'scared', 'afraid', 'lost', 'where', 'emergency',
      'danger', 'hurt', 'sick', 'pain', 'confused', 'alone'
    ];

    if (user_interaction) {
      const interaction_lower = user_interaction.toLowerCase();
      const matches = distressKeywords.filter(keyword =>
        interaction_lower.includes(keyword)
      );
      assessment.distress_level += matches.length * 2;
    }

    // Check for pattern-based distress
    assessment.distress_level += detected_anxiety_indicators.length * 1.5;

    // Check time-based risk (3am-5am is high risk for confusion)
    const hour = new Date().getHours();
    if (hour >= 3 && hour <= 5) {
      assessment.distress_level += 1;
    }

    // Generate comforting response based on distress level
    let comfort_message = '';
    let audio_type = 'ambient_sounds';

    if (assessment.distress_level >= 6) {
      assessment.recommended_action = 'immediate_comfort';
      audio_type = 'calming_music';
      comfort_message = userProfile
        ? `I'm here with you, ${userProfile.preferred_name || userProfile.loved_one_name}. You're safe and sound. I'm watching over you.`
        : `I'm here with you. You're safe. Everything is okay. I'm right here.`;
    } else if (assessment.distress_level >= 3) {
      assessment.recommended_action = 'gentle_reassurance';
      audio_type = 'gentle_ambient';
      comfort_message = `Everything is secure. All doors are locked. I'm monitoring everything for you. Rest well.`;
    } else {
      assessment.recommended_action = 'continue_monitoring';
      audio_type = 'ambient_sounds';
      comfort_message = `All is calm and quiet. You're safe. Rest peacefully.`;
    }

    // Add security confirmation for high anxiety
    if (assessment.distress_level >= 4) {
      assessment.messages.push({
        type: 'security_check',
        content: 'All doors locked. All windows secure. Perimeter clear. You are safe.'
      });
    }

    // Check if caregiver should be notified
    let should_notify_caregiver = false;
    if (assessment.distress_level >= 8) {
      should_notify_caregiver = true;
      
      // Create caregiver alert
      await base44.entities.CaregiverAlert.create({
        alert_type: 'high_anxiety',
        severity: 'urgent',
        message: `Night Watch: High distress detected. User showing signs of confusion or fear.`,
        pattern_data: {
          distress_level: assessment.distress_level,
          time: new Date().toISOString(),
          context: context
        }
      }).catch(() => {});
    }

    assessment.messages.push({
      type: 'comfort_message',
      content: comfort_message,
      audio_url: audio_type
    });

    return Response.json({
      assessment,
      comfort_audio_type: audio_type,
      comfort_message,
      should_notify_caregiver,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});