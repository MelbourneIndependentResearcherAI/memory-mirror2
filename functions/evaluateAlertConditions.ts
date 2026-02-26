import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { patient_profile_id, activity_data } = body;

    if (!patient_profile_id || !activity_data) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get all enabled alert conditions for this patient
    const alertConditions = await base44.asServiceRole.entities.AlertCondition.filter(
      { is_enabled: true },
      '-created_date',
      100
    );

    const triggeredAlerts = [];
    const now = new Date();

    for (const condition of alertConditions) {
      // Check if cooldown has passed
      if (condition.last_triggered) {
        const lastTriggeredTime = new Date(condition.last_triggered);
        const cooldownMs = (condition.cooldown_minutes || 30) * 60 * 1000;
        if (now.getTime() - lastTriggeredTime.getTime() < cooldownMs) {
          continue;
        }
      }

      let shouldTrigger = false;
      let alertData = {};

      switch (condition.condition_type) {
        case 'no_interaction': {
          const { last_message_time } = activity_data;
          if (last_message_time) {
            const inactiveMs = now.getTime() - new Date(last_message_time).getTime();
            const thresholdMs = condition.threshold_value * 60 * 60 * 1000; // Convert hours to ms
            if (inactiveMs > thresholdMs) {
              shouldTrigger = true;
              alertData = {
                hours_inactive: Math.round(inactiveMs / (60 * 60 * 1000)),
                threshold_hours: condition.threshold_value
              };
            }
          }
          break;
        }

        case 'high_anxiety': {
          const { anxiety_level } = activity_data;
          if (anxiety_level && anxiety_level >= condition.threshold_value) {
            shouldTrigger = true;
            alertData = {
              anxiety_level,
              threshold: condition.threshold_value
            };
          }
          break;
        }

        case 'prolonged_distress': {
          const { consecutive_distress_minutes } = activity_data;
          if (consecutive_distress_minutes && consecutive_distress_minutes >= condition.threshold_value) {
            shouldTrigger = true;
            alertData = {
              distress_minutes: consecutive_distress_minutes,
              threshold_minutes: condition.threshold_value
            };
          }
          break;
        }

        case 'repeated_confusion': {
          const { confusion_count } = activity_data;
          if (confusion_count && confusion_count >= condition.threshold_value) {
            shouldTrigger = true;
            alertData = {
              confusion_count,
              threshold: condition.threshold_value
            };
          }
          break;
        }

        case 'exit_attempt': {
          const { exit_attempt_detected } = activity_data;
          if (exit_attempt_detected) {
            shouldTrigger = true;
            alertData = { exit_attempt: true };
          }
          break;
        }
      }

      if (shouldTrigger) {
        // Create caregiver alert
        await base44.asServiceRole.entities.CaregiverAlert.create({
          patient_profile_id,
          alert_type: condition.condition_type,
          severity: condition.severity,
          message: `Alert: ${condition.condition_name}`,
          pattern_data: alertData,
          timestamp: now.toISOString()
        });

        // Update condition's last triggered time
        await base44.asServiceRole.entities.AlertCondition.update(condition.id, {
          last_triggered: now.toISOString()
        });

        triggeredAlerts.push({
          condition_id: condition.id,
          condition_name: condition.condition_name,
          severity: condition.severity
        });

        // Send notifications if configured
        if (condition.notification_method?.includes('email')) {
          // Note: Email sending would require additional integration
          console.log('Email notification would be sent');
        }
      }
    }

    return Response.json({
      success: true,
      triggered_alerts: triggeredAlerts,
      count: triggeredAlerts.length
    });
  } catch (error) {
    console.error('Alert evaluation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});