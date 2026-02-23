import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function can be called by a scheduled automation or manually
    // It checks all active alert conditions and triggers notifications if needed
    
    const conditions = await base44.asServiceRole.entities.AlertCondition.filter({ is_enabled: true });
    const triggeredAlerts = [];
    
    for (const condition of conditions) {
      let shouldTrigger = false;
      
      // Check cooldown - don't trigger if recently triggered
      if (condition.last_triggered) {
        const cooldownMs = (condition.cooldown_minutes || 30) * 60 * 1000;
        const timeSinceLastTrigger = Date.now() - new Date(condition.last_triggered).getTime();
        if (timeSinceLastTrigger < cooldownMs) {
          continue; // Skip this condition, still in cooldown
        }
      }
      
      // Check each condition type
      switch (condition.condition_type) {
        case 'no_interaction':
          // Check last activity log timestamp
          const activityLogs = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 1);
          if (activityLogs.length > 0) {
            const lastActivity = new Date(activityLogs[0].created_date);
            const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
            const thresholdHours = condition.threshold_unit === 'hours' 
              ? condition.threshold_value 
              : condition.threshold_value / 60;
            shouldTrigger = hoursSinceActivity >= thresholdHours;
          }
          break;
          
        case 'high_anxiety':
          // Check recent anxiety levels
          const recentActivities = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 5);
          const avgAnxiety = recentActivities.reduce((sum, log) => sum + (log.anxiety_level || 0), 0) / recentActivities.length;
          shouldTrigger = avgAnxiety >= condition.threshold_value;
          break;
          
        case 'night_incident':
          // Check for recent night incidents
          const nightIncidents = await base44.asServiceRole.entities.NightIncident.filter({
            severity: { $in: ['medium', 'high'] }
          });
          const recentNightIncident = nightIncidents.find(incident => {
            const incidentTime = new Date(incident.timestamp).getTime();
            const hoursSince = (Date.now() - incidentTime) / (1000 * 60 * 60);
            return hoursSince < 1; // Within last hour
          });
          shouldTrigger = !!recentNightIncident;
          break;
          
        case 'prolonged_distress':
          // Check for continuous high anxiety over time
          const distressLogs = await base44.asServiceRole.entities.ActivityLog.filter({
            activity_type: 'anxiety_detected',
            anxiety_level: { $gte: 7 }
          });
          shouldTrigger = distressLogs.length >= condition.threshold_value;
          break;
      }
      
      if (shouldTrigger) {
        // Send notifications to designated contacts
        const contacts = await base44.asServiceRole.entities.EmergencyContact.filter({
          id: { $in: condition.notify_contacts || [] }
        });
        
        for (const contact of contacts) {
          const notificationMethods = condition.notification_method || ['email'];
          
          for (const method of notificationMethods) {
            if (method === 'email' || method === 'app_notification') {
              // Send email notification
              try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                  to: contact.phone, // Assuming email in phone field or separate
                  subject: `🚨 ${condition.severity.toUpperCase()} Alert: ${condition.condition_name}`,
                  body: `Alert Condition Triggered:\n\n${condition.condition_name}\n\nType: ${condition.condition_type}\nSeverity: ${condition.severity}\n\nPlease check on your loved one immediately.\n\n- Memory Mirror Alert System`,
                  from_name: 'Memory Mirror Alerts'
                });
              } catch (err) {
                console.error('Failed to send email:', err);
              }
            }
            
            // SMS and phone calls would require additional integration
            if (method === 'sms') {
              console.log(`SMS alert would be sent to ${contact.phone}`);
            }
            
            if (method === 'phone_call') {
              console.log(`Phone call would be initiated to ${contact.phone}`);
            }
          }
        }
        
        // Update last_triggered timestamp
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