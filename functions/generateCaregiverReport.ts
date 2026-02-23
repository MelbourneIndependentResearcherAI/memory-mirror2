import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { report_type, patient_id } = await req.json();

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (report_type) {
      case 'daily':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const startDateISO = startDate.toISOString();

    // Fetch all relevant data
    const [activityLogs, anxietyTrends, nightIncidents, conversations] = await Promise.all([
      base44.asServiceRole.entities.ActivityLog.filter({ 
        created_date: { $gte: startDateISO } 
      }, '-created_date', 500),
      base44.asServiceRole.entities.AnxietyTrend.filter({ 
        timestamp: { $gte: startDateISO } 
      }, '-timestamp', 500),
      base44.asServiceRole.entities.NightIncident.filter({ 
        timestamp: { $gte: startDateISO } 
      }, '-timestamp', 200),
      base44.asServiceRole.entities.Conversation.filter({ 
        created_date: { $gte: startDateISO } 
      }, '-created_date', 500)
    ]);

    // Activity Summary
    const activity_summary = {
      'Total Sessions': activityLogs.length,
      'Chat Sessions': activityLogs.filter(log => log.activity_type === 'chat_session').length,
      'Phone Calls': activityLogs.filter(log => log.activity_type === 'phone_call').length,
      'Night Watch Activations': activityLogs.filter(log => log.activity_type === 'night_watch').length,
      'Security Checks': activityLogs.filter(log => log.activity_type === 'security_check').length,
      'Banking Interactions': activityLogs.filter(log => log.activity_type === 'bank_interaction').length
    };

    // Mood Analysis
    const anxietyLevels = anxietyTrends.map(t => t.anxiety_level).filter(l => l != null);
    const average_anxiety = anxietyLevels.length > 0 
      ? (anxietyLevels.reduce((a, b) => a + b, 0) / anxietyLevels.length).toFixed(1)
      : 0;
    const peak_anxiety = anxietyLevels.length > 0 ? Math.max(...anxietyLevels) : 0;
    const calm_periods = anxietyTrends.filter(t => t.anxiety_level <= 3).length;

    const mood_analysis = {
      average_anxiety,
      peak_anxiety,
      calm_periods,
      anxiety_spikes: anxietyTrends.filter(t => t.anxiety_level >= 7).length
    };

    // Significant Events
    const significant_events = [];

    // High anxiety events
    anxietyTrends.filter(t => t.anxiety_level >= 7).forEach(trend => {
      significant_events.push({
        timestamp: trend.timestamp,
        type: 'anxiety_spike',
        severity: trend.anxiety_level >= 9 ? 'high' : 'medium',
        details: `Anxiety level reached ${trend.anxiety_level}/10. Trigger: ${trend.trigger_context || 'Unknown'}`
      });
    });

    // Night incidents
    nightIncidents.forEach(incident => {
      significant_events.push({
        timestamp: incident.timestamp,
        type: 'night_incident',
        severity: incident.severity,
        details: `${incident.incident_type} - ${incident.outcome || 'Monitoring'}. Duration: ${incident.duration_minutes || 0} minutes`
      });
    });

    // Extended conversations (may indicate distress)
    conversations.forEach(conv => {
      const messageCount = conv.messages?.length || 0;
      if (messageCount >= 20) {
        significant_events.push({
          timestamp: conv.created_date,
          type: 'extended_conversation',
          severity: 'low',
          details: `Extended conversation with ${messageCount} messages. May indicate engagement or seeking reassurance.`
        });
      }
    });

    // Sort by timestamp
    significant_events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Communication Summary
    const total_conversations = conversations.length;
    const total_messages = conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0);
    const avg_conversation_length = total_conversations > 0 
      ? Math.round(total_messages / total_conversations)
      : 0;

    // Most active time
    const hourCounts = {};
    conversations.forEach(conv => {
      const hour = new Date(conv.created_date).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const most_active_hour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b, '0'
    );
    const most_active_time = `${most_active_hour}:00 - ${parseInt(most_active_hour) + 1}:00`;

    const communication_summary = {
      total_conversations,
      avg_conversation_length,
      most_active_time,
      total_messages
    };

    return Response.json({
      report_type,
      date_range: {
        start: startDateISO,
        end: now.toISOString()
      },
      activity_summary,
      mood_analysis,
      significant_events: significant_events.slice(0, 50),
      communication_summary,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});