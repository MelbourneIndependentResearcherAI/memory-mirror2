import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather all relevant data
    const [feedbacks, activityLogs, journals, anxietyTrends, cognitiveAssessments, nightIncidents] = await Promise.all([
      base44.entities.Feedback.list('-created_date', 30),
      base44.entities.ActivityLog.list('-created_date', 100),
      base44.entities.CareJournal.list('-created_date', 20),
      base44.entities.AnxietyTrend.list('-date', 30),
      base44.entities.CognitiveAssessment.list('-assessment_date', 5),
      base44.entities.NightIncident.list('-timestamp', 20)
    ]);

    // Prepare comprehensive analysis prompt
    const analysisPrompt = `You are an expert dementia care AI assistant analyzing data for a caregiver. Provide actionable, compassionate insights.

**RECENT FEEDBACK (${feedbacks.length} items):**
${feedbacks.slice(0, 10).map(f => `- ${f.rating}★ "${f.title}": ${f.content.substring(0, 150)}`).join('\n')}

**ACTIVITY PATTERNS (Last ${activityLogs.length} activities):**
${Object.entries(activityLogs.reduce((acc, log) => {
  acc[log.activity_type] = (acc[log.activity_type] || 0) + 1;
  return acc;
}, {})).map(([type, count]) => `- ${type}: ${count} times`).join('\n')}

**CARE JOURNAL ENTRIES (${journals.length} recent):**
${journals.slice(0, 5).map(j => `- ${j.title}: ${j.notes?.substring(0, 100) || 'No notes'} (Mood: ${j.mood_observed || 'not recorded'})`).join('\n')}

**ANXIETY TRENDS (${anxietyTrends.length} days):**
Average anxiety: ${anxietyTrends.length > 0 ? (anxietyTrends.reduce((sum, a) => sum + (a.anxiety_level || 0), 0) / anxietyTrends.length).toFixed(1) : 'N/A'}
High anxiety days: ${anxietyTrends.filter(a => a.anxiety_level >= 7).length}

**COGNITIVE STATUS:**
${cognitiveAssessments.length > 0 ? `Current level: ${cognitiveAssessments[0].cognitive_level}
Recent changes: ${cognitiveAssessments.length > 1 ? 'Tracked over ' + cognitiveAssessments.length + ' assessments' : 'First assessment'}` : 'No assessments yet'}

**NIGHTTIME INCIDENTS (${nightIncidents.length} recent):**
${nightIncidents.slice(0, 5).map(i => `- ${i.incident_type}: ${i.outcome} (${i.severity} severity)`).join('\n')}

Analyze this data and provide:
1. **Overall Status Summary** (2-3 sentences about current wellbeing)
2. **Key Patterns Identified** (3-5 bullet points of trends you notice)
3. **Emotional State Assessment** (current emotional state and triggers)
4. **Recommendations for Caregivers** (4-6 specific, actionable suggestions)
5. **Suggested Activities for AI Companion** (5 specific conversation topics or activities)
6. **Areas of Concern** (if any - be honest but compassionate)
7. **Positive Highlights** (things going well)

Format as JSON with these exact keys: overallSummary, keyPatterns (array), emotionalState, recommendations (array), suggestedActivities (array), areasOfConcern (array), positiveHighlights (array)`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          overallSummary: { type: "string" },
          keyPatterns: { type: "array", items: { type: "string" } },
          emotionalState: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } },
          suggestedActivities: { type: "array", items: { type: "string" } },
          areasOfConcern: { type: "array", items: { type: "string" } },
          positiveHighlights: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({
      success: true,
      insights: result,
      dataAnalyzed: {
        feedbackCount: feedbacks.length,
        activityCount: activityLogs.length,
        journalCount: journals.length,
        anxietyDays: anxietyTrends.length,
        assessmentsCount: cognitiveAssessments.length,
        nightIncidentsCount: nightIncidents.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Care insights generation failed:', error);
    return Response.json({ 
      error: error.message,
      fallback: {
        overallSummary: "Unable to generate detailed insights at this time. Please check individual reports for more information.",
        keyPatterns: ["Data analysis temporarily unavailable"],
        emotionalState: "Unable to assess",
        recommendations: ["Continue regular check-ins", "Monitor daily activities", "Maintain routine care"],
        suggestedActivities: ["General conversation", "Memory recall exercises", "Music listening"],
        areasOfConcern: [],
        positiveHighlights: ["Care system is actively monitoring"]
      }
    }, { status: 500 });
  }
});