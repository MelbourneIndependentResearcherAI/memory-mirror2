import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather comprehensive user data
    const [profiles, activityLogs, reminders, playlists, media, conversations] = await Promise.all([
      base44.entities.UserProfile.list(),
      base44.entities.ActivityLog.list('-created_date', 20),
      base44.entities.Reminder.filter({ is_active: true }),
      base44.entities.Playlist.list(),
      base44.entities.FamilyMedia.list('-created_date', 10),
      base44.entities.Conversation.list('-created_date', 10)
    ]);

    const profile = profiles[0] || {};
    const currentHour = new Date().getHours();
    
    // Analyze patterns
    const recentAnxietyLevels = activityLogs
      .filter(log => log.anxiety_level != null)
      .map(log => log.anxiety_level);
    
    const avgAnxiety = recentAnxietyLevels.length > 0
      ? recentAnxietyLevels.reduce((a, b) => a + b, 0) / recentAnxietyLevels.length
      : 0;

    const lastActivityTime = activityLogs[0]?.created_date 
      ? new Date(activityLogs[0].created_date).getTime()
      : 0;
    
    const hoursSinceActivity = (Date.now() - lastActivityTime) / (1000 * 60 * 60);

    // Time of day context
    let timeContext = '';
    if (currentHour >= 6 && currentHour < 12) timeContext = 'morning';
    else if (currentHour >= 12 && currentHour < 17) timeContext = 'afternoon';
    else if (currentHour >= 17 && currentHour < 21) timeContext = 'evening';
    else timeContext = 'night';

    // Build engagement prompt
    const engagementPrompt = `
You are an AI companion analyzing when to proactively reach out to a person with dementia.

USER PROFILE:
- Name: ${profile.loved_one_name || 'User'}
- Interests: ${profile.interests?.join(', ') || 'various activities'}
- Favorite Era: ${profile.favorite_era || 'present'}
- Daily Routine Preferences: ${JSON.stringify(profile.daily_routine_preferences || {})}

CURRENT PATTERNS:
- Time of Day: ${timeContext} (${currentHour}:00)
- Hours Since Last Activity: ${hoursSinceActivity.toFixed(1)}
- Average Recent Anxiety: ${avgAnxiety.toFixed(1)}/10
- Active Reminders: ${reminders.length}
- Available Playlists: ${playlists.length}
- Recent Family Media: ${media.length}

ACTIVITY HISTORY (last 20):
${activityLogs.slice(0, 10).map(log => 
  `- ${new Date(log.created_date).toLocaleTimeString()}: ${log.activity_type} (anxiety: ${log.anxiety_level || 0}/10)`
).join('\n')}

Based on this data, determine:
1. Should we proactively engage right now? (yes/no with reasoning)
2. What type of engagement would be best? (conversation, music, story, memory, activity, reminder)
3. Specific suggestion personalized to their interests and current state
4. Confidence level (0-100) that this will be well-received

Consider:
- Is it an appropriate time of day?
- Has it been too long since last interaction?
- Is their anxiety elevated?
- What are their established routines?
- What activities have worked well recently?
`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: engagementPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          should_engage: { type: "boolean" },
          reasoning: { type: "string" },
          engagement_type: { 
            type: "string",
            enum: ["conversation", "music", "story", "memory", "activity", "reminder", "none"]
          },
          specific_suggestion: { type: "string" },
          conversation_starter: { type: "string" },
          confidence: { type: "number" },
          best_time_window: { type: "string" }
        }
      }
    });

    // Create activity log for proactive engagement
    if (analysis.should_engage && analysis.confidence > 60) {
      await base44.entities.ActivityLog.create({
        activity_type: 'proactive_engagement_suggested',
        details: {
          type: analysis.engagement_type,
          suggestion: analysis.specific_suggestion,
          confidence: analysis.confidence
        },
        anxiety_level: avgAnxiety
      });
    }

    return Response.json({
      success: true,
      engagement: analysis,
      context: {
        timeOfDay: timeContext,
        hoursSinceActivity,
        avgAnxiety,
        userName: profile.loved_one_name
      }
    });

  } catch (error) {
    console.error('Proactive engagement error:', error);
    return Response.json({ 
      error: error.message,
      engagement: {
        should_engage: false,
        reasoning: 'Error analyzing patterns'
      }
    }, { status: 500 });
  }
});