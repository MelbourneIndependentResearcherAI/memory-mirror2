import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation_history, recent_interactions } = await req.json();

    // Get previous assessments for trend analysis using service role
    const previousAssessments = await base44.asServiceRole.entities.CognitiveAssessment.list('-assessment_date', 5);

    const assessmentPrompt = `You are a dementia care AI specialist analyzing conversation patterns to assess cognitive decline stage.

RECENT CONVERSATION HISTORY (last 10 exchanges):
${conversation_history?.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n') || 'No history available'}

INTERACTION PATTERNS (last 7 days):
${recent_interactions ? JSON.stringify(recent_interactions, null, 2) : 'No data'}

PREVIOUS ASSESSMENTS (for trend tracking):
${previousAssessments.length > 0 ? previousAssessments.map(a => `${a.assessment_date}: ${a.cognitive_level} - indicators: ${JSON.stringify(a.indicators)}`).join('\n') : 'No previous assessments'}

ANALYZE for the following indicators:

1. **Memory Recall Accuracy** (0-10, 10=excellent):
   - Can they recall recent events?
   - Recognition of familiar people/places
   - Consistency in personal history

2. **Temporal Confusion** (0-10, 10=highly confused):
   - Awareness of current time period
   - Mixing of different eras
   - Disorientation to date/time

3. **Language Complexity** (0-10, 10=complex):
   - Sentence structure
   - Vocabulary richness
   - Ability to follow complex topics

4. **Repetition Frequency** (0-10, 10=very frequent):
   - Asking same questions
   - Repeating stories
   - Circular conversations

5. **Emotional Stability** (0-10, 10=very stable):
   - Mood consistency
   - Anxiety levels
   - Emotional regulation

Based on these indicators, classify cognitive level:
- **mild**: Early stage, mostly independent, some memory issues
- **moderate**: Noticeable decline, needs assistance, confusion increasing
- **advanced**: Significant impairment, needs extensive support, frequent disorientation
- **severe**: Profound cognitive loss, minimal verbal communication, high dependency

Return JSON with cognitive assessment and specific adaptation recommendations.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: assessmentPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          cognitive_level: {
            type: "string",
            enum: ["mild", "moderate", "advanced", "severe"]
          },
          indicators: {
            type: "object",
            properties: {
              memory_recall_accuracy: { type: "number" },
              temporal_confusion: { type: "number" },
              language_complexity: { type: "number" },
              repetition_frequency: { type: "number" },
              emotional_stability: { type: "number" }
            }
          },
          conversation_patterns: {
            type: "object",
            properties: {
              average_response_length: { type: "number" },
              comprehension_level: { type: "string" },
              preferred_topics: { type: "array", items: { type: "string" } }
            }
          },
          recommended_adaptations: {
            type: "array",
            items: { type: "string" }
          },
          reasoning: { type: "string" },
          trend: {
            type: "string",
            enum: ["stable", "declining", "improving", "unknown"]
          }
        },
        required: ["cognitive_level", "indicators", "recommended_adaptations"]
      }
    });

    // Save assessment using service role
    const today = new Date().toISOString().split('T')[0];
    await base44.asServiceRole.entities.CognitiveAssessment.create({
      assessment_date: today,
      cognitive_level: analysis.cognitive_level,
      indicators: analysis.indicators,
      conversation_patterns: analysis.conversation_patterns,
      recommended_adaptations: analysis.recommended_adaptations,
      notes: analysis.reasoning
    });

    return Response.json({
      cognitive_level: analysis.cognitive_level,
      indicators: analysis.indicators,
      adaptations: analysis.recommended_adaptations,
      trend: analysis.trend,
      reasoning: analysis.reasoning
    });

  } catch (error) {
    console.error('Cognitive assessment error:', error);
    return Response.json({ 
      error: error.message,
      cognitive_level: 'mild',
      adaptations: []
    }, { status: 500 });
  }
});