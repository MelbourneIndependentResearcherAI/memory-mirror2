import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { days = 7 } = await req.json();
    
    // Get recent activity logs
    const activities = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 100);
    
    // Get anxiety trends
    const anxietyTrends = await base44.asServiceRole.entities.AnxietyTrend.list('-created_date', 30);
    
    // Get recent conversations
    const conversations = await base44.asServiceRole.entities.Conversation.list('-created_date', 20);
    
    // Analyze patterns
    const analysisPrompt = `You are an AI assistant helping caregivers understand their loved one's emotional state and conversation patterns.

RECENT ACTIVITY DATA:
${activities.slice(0, 20).map(a => `- ${a.activity_type} (anxiety: ${a.anxiety_level || 0}/10) - ${JSON.stringify(a.details || {})}`).join('\n')}

ANXIETY TRENDS (last 30 days):
${anxietyTrends.map(t => `- ${t.date}: anxiety ${t.anxiety_level}/10, trigger: ${t.trigger_category}, mode: ${t.mode_used}`).join('\n')}

RECENT CONVERSATIONS:
${conversations.slice(0, 5).map(c => `- Mode: ${c.mode}, Era: ${c.detected_era || 'unknown'}, Messages: ${c.messages?.length || 0}`).join('\n')}

Based on this data, provide:
1. Overall emotional state summary (1-2 sentences)
2. Key patterns observed (3-4 bullet points)
3. Potential triggers or concerns (2-3 items)
4. Recommended actions for caregiver (3-4 specific suggestions)
5. Conversation starters that would be comforting (5 examples)
6. Suggested activities based on preferences (5 activities)
7. Predicted distress risk level (low/medium/high) with reasoning

Format as JSON:
{
  "summary": "string",
  "patterns": ["string"],
  "concerns": ["string"],
  "recommendations": ["string"],
  "conversationStarters": ["string"],
  "suggestedActivities": ["string"],
  "distressRisk": {"level": "low|medium|high", "reasoning": "string"}
}`;

    const insights = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          patterns: { type: "array", items: { type: "string" } },
          concerns: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          conversationStarters: { type: "array", items: { type: "string" } },
          suggestedActivities: { type: "array", items: { type: "string" } },
          distressRisk: { 
            type: "object",
            properties: {
              level: { type: "string" },
              reasoning: { type: "string" }
            }
          }
        }
      }
    });

    // Generate alert if high risk detected
    if (insights.distressRisk?.level === 'high' || insights.distressRisk?.level === 'medium') {
      await base44.asServiceRole.entities.CaregiverAlert.create({
        alert_type: 'check_in_suggested',
        severity: insights.distressRisk.level === 'high' ? 'warning' : 'info',
        message: `AI Analysis: ${insights.distressRisk.reasoning}`,
        pattern_data: {
          summary: insights.summary,
          concerns: insights.concerns,
          timestamp: new Date().toISOString()
        }
      });
    }

    return Response.json({
      insights,
      activityCount: activities.length,
      avgAnxietyLevel: anxietyTrends.length > 0 
        ? (anxietyTrends.reduce((sum, t) => sum + (t.anxiety_level || 0), 0) / anxietyTrends.length).toFixed(1)
        : 0,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Insights generation error:', error);
    return Response.json({ 
      error: 'Failed to generate insights', 
      details: error.message 
    }, { status: 500 });
  }
});