import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch recent data for analysis
    const [activities, anxietyTrends, conversations, nightIncidents] = await Promise.all([
      base44.entities.ActivityLog.list('-created_date', 100),
      base44.entities.AnxietyTrend.list('-timestamp', 50),
      base44.entities.Conversation.list('-created_date', 50),
      base44.entities.NightIncident.list('-timestamp', 30)
    ]);

    // Calculate baseline metrics
    const now = new Date();
    const last24h = activities.filter(a => new Date(a.created_date) > new Date(now - 24*60*60*1000));
    const last7days = activities.filter(a => new Date(a.created_date) > new Date(now - 7*24*60*60*1000));
    const last30days = activities.filter(a => new Date(a.created_date) > new Date(now - 30*24*60*60*1000));

    const avgDaily = last30days.length / 30;
    const avgWeekly = last7days.length / 7;
    const todayCount = last24h.length;

    // Anxiety analysis
    const recentAnxiety = anxietyTrends.slice(0, 10).map(t => t.anxiety_level || 5);
    const avgAnxiety = recentAnxiety.reduce((a, b) => a + b, 0) / recentAnxiety.length;
    const historicalAnxiety = anxietyTrends.slice(10, 50).map(t => t.anxiety_level || 5);
    const baselineAnxiety = historicalAnxiety.reduce((a, b) => a + b, 0) / Math.max(historicalAnxiety.length, 1);

    // Night incident analysis
    const recentNightIncidents = nightIncidents.filter(n => 
      new Date(n.timestamp) > new Date(now - 7*24*60*60*1000)
    );
    const historicalNightIncidents = nightIncidents.filter(n => 
      new Date(n.timestamp) <= new Date(now - 7*24*60*60*1000)
    );

    // Conversation pattern analysis
    const recentConversations = conversations.slice(0, 20);
    const avgConversationLength = recentConversations.reduce((sum, c) => 
      sum + (c.messages?.length || 0), 0) / Math.max(recentConversations.length, 1);

    // Use AI to detect anomalies and generate insights
    const analysisPrompt = `You are an AI healthcare analyst monitoring a person with dementia. Analyze the following data for behavioral anomalies and well-being changes:

ACTIVITY DATA:
- Today: ${todayCount} interactions
- 7-day average: ${avgWeekly.toFixed(1)} interactions/day
- 30-day average: ${avgDaily.toFixed(1)} interactions/day

MOOD DATA:
- Recent anxiety level: ${avgAnxiety.toFixed(1)}/10
- Baseline anxiety level: ${baselineAnxiety.toFixed(1)}/10
- Change: ${((avgAnxiety - baselineAnxiety)).toFixed(1)} points

NIGHT PATTERNS:
- Recent week incidents: ${recentNightIncidents.length}
- Historical average: ${(historicalNightIncidents.length / 4).toFixed(1)} per week

CONVERSATION PATTERNS:
- Average conversation length: ${avgConversationLength.toFixed(1)} messages
- Recent conversations: ${recentConversations.length}

Analyze these patterns and return a JSON object with:
{
  "anomalies": [
    {
      "type": "activity_drop|anxiety_spike|night_disturbance|social_withdrawal|repetitive_behavior",
      "severity": "low|medium|high",
      "title": "Brief alert title",
      "description": "Clear explanation of the anomaly",
      "recommendation": "Specific action to take",
      "confidence": 0.0-1.0
    }
  ],
  "overall_status": "stable|caution|concerning",
  "summary": "Brief overall assessment"
}

Only report anomalies with confidence >= 0.6. Consider:
- Activity drops > 30% from baseline
- Anxiety increases > 2 points
- Sudden increase in night incidents
- Changes in conversation patterns

Be compassionate and actionable in recommendations.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          anomalies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                severity: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                recommendation: { type: "string" },
                confidence: { type: "number" }
              }
            }
          },
          overall_status: { type: "string" },
          summary: { type: "string" }
        }
      }
    });

    // Create alerts for detected anomalies
    const alertsCreated = [];
    for (const anomaly of aiResponse.anomalies) {
      if (anomaly.confidence >= 0.6) {
        const alert = await base44.entities.CaregiverAlert.create({
          alert_type: 'behavior_anomaly',
          severity: anomaly.severity,
          title: `🔍 ${anomaly.title}`,
          message: `${anomaly.description}\n\n💡 Recommendation: ${anomaly.recommendation}`,
          is_read: false,
          confidence_score: anomaly.confidence,
          anomaly_type: anomaly.type
        });
        alertsCreated.push(alert);
      }
    }

    return Response.json({
      status: 'success',
      analysis: aiResponse,
      alerts_created: alertsCreated.length,
      metrics: {
        activity: { today: todayCount, weekly_avg: avgWeekly, monthly_avg: avgDaily },
        anxiety: { recent: avgAnxiety, baseline: baselineAnxiety, change: avgAnxiety - baselineAnxiety },
        night_incidents: { recent_week: recentNightIncidents.length, historical_avg: historicalNightIncidents.length / 4 }
      }
    });

  } catch (error) {
    console.error('Anomaly detection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});