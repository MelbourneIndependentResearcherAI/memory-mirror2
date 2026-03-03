import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const conditions = await base44.asServiceRole.entities.AlertCondition.filter({ is_enabled: true });
    const triggeredAlerts = [];
    
    for (const condition of conditions) {
      // Check cooldown - don't trigger if recently triggered
      if (condition.last_triggered) {
        const cooldownMs = (condition.cooldown_minutes || 30) * 60 * 1000;
        const timeSinceLastTrigger = Date.now() - new Date(condition.last_triggered).getTime();
        if (timeSinceLastTrigger < cooldownMs) {
          continue;
        }
      }
      
      let shouldTrigger = false;
      
      if (condition.condition_type === 'no_interaction') {
        const activityLogs = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 1);
        if (activityLogs.length > 0) {
          const lastActivity = new Date(activityLogs[0].created_date);
          const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
          const thresholdHours = condition.threshold_unit === 'hours'
            ? condition.threshold_value
            : condition.threshold_value / 60;
          shouldTrigger = hoursSinceActivity >= thresholdHours;
        }
      } else if (condition.condition_type === 'high_anxiety') {
        const recentActivities = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 5);
        const avgAnxiety = recentActivities.reduce((sum, log) => sum + (log.anxiety_level || 0), 0) / (recentActivities.length || 1);
        shouldTrigger = avgAnxiety >= condition.threshold_value;
      } else if (condition.condition_type === 'night_incident') {
        const nightIncidents = await base44.asServiceRole.entities.NightIncident.filter({
          severity: { $in: ['medium', 'high'] }
        });
        const recentNightIncident = nightIncidents.find(incident => {
          const hoursSince = (Date.now() - new Date(incident.timestamp).getTime()) / (1000 * 60 * 60);
          return hoursSince < 1;
        });
        shouldTrigger = !!recentNightIncident;
      } else if (condition.condition_type === 'prolonged_distress') {
        const distressLogs = await base44.asServiceRole.entities.ActivityLog.filter({
          activity_type: 'anxiety_detected',
          anxiety_level: { $gte: 7 }
        });
        shouldTrigger = distressLogs.length >= condition.threshold_value;
      }
      
      if (shouldTrigger) {
        const contacts = await base44.asServiceRole.entities.EmergencyContact.filter({
          id: { $in: condition.notify_contacts || [] }
        });
        
        const notificationMethods = condition.notification_method || ['email'];
        
        await Promise.all(contacts.map(async (contact) => {
          if (notificationMethods.includes('email') || notificationMethods.includes('app_notification')) {
            try {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: contact.phone,
                subject: `🚨 ${condition.severity?.toUpperCase()} Alert: ${condition.condition_name}`,
                body: `Alert Condition Triggered:\n\n${condition.condition_name}\n\nType: ${condition.condition_type}\nSeverity: ${condition.severity}\nThreshold: ${condition.threshold_value} ${condition.threshold_unit}\n\nPlease check on your loved one immediately.\n\nContact: ${contact.name}\nRelationship: ${contact.relationship || 'Not specified'}\n\n- Memory Mirror Alert System`,
                from_name: 'Memory Mirror Alerts'
              });
            } catch (err) {
              console.error('Failed to send email:', err);
            }
          }
        }));
        
        await base44.asServiceRole.entities.AlertCondition.update(condition.id, {
          last_triggered: new Date().toISOString()
        });
        
        triggeredAlerts.push({
          condition: condition.condition_name,
          severity: condition.severity,
          contacts_notified: contacts.length
        });
      }
    }
    
    return Response.json({
      success: true,
      message: `Checked ${conditions.length} conditions, triggered ${triggeredAlerts.length} alerts`,
      triggeredAlerts
    });
    
  } catch (error) {
    console.error('Alert check error:', error);
    return Response.json(
      { error: error.message || 'Failed to check alert conditions' },
      { status: 500 }
    );
  }
});