import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Automated Error Resolution Function
 * Detects and fixes common issues automatically
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const resolutionReport = {
      timestamp: new Date().toISOString(),
      actionsTaken: [],
      fixedIssues: 0,
      escalatedIssues: []
    };

    // 1. Clean up old error logs (older than 30 days)
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const oldLogs = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 1000);
      
      let deletedCount = 0;
      for (const log of oldLogs) {
        if (log.created_date < thirtyDaysAgo) {
          await base44.asServiceRole.entities.ActivityLog.delete(log.id);
          deletedCount++;
        }
      }
      
      if (deletedCount > 0) {
        resolutionReport.actionsTaken.push({
          action: 'cleanup_old_logs',
          description: `Deleted ${deletedCount} old activity logs`,
          status: 'success'
        });
        resolutionReport.fixedIssues++;
      }
    } catch (error) {
      resolutionReport.escalatedIssues.push({
        issue: 'log_cleanup_failed',
        error: error.message
      });
    }

    // 2. Validate data integrity
    try {
      const profiles = await base44.asServiceRole.entities.UserProfile.list();
      
      for (const profile of profiles) {
        let needsUpdate = false;
        const updates = {};
        
        // Fix missing communication_style
        if (!profile.communication_style) {
          updates.communication_style = 'warm';
          needsUpdate = true;
        }
        
        // Fix invalid interests array
        if (profile.interests && !Array.isArray(profile.interests)) {
          updates.interests = [];
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await base44.asServiceRole.entities.UserProfile.update(profile.id, updates);
          resolutionReport.actionsTaken.push({
            action: 'fix_profile_data',
            description: `Fixed data integrity for profile ${profile.id}`,
            status: 'success'
          });
          resolutionReport.fixedIssues++;
        }
      }
    } catch (error) {
      resolutionReport.escalatedIssues.push({
        issue: 'data_validation_failed',
        error: error.message
      });
    }

    // 3. Check for stuck reminders
    try {
      const reminders = await base44.asServiceRole.entities.Reminder.list();
      const now = new Date();
      
      for (const reminder of reminders) {
        // Reminders that haven't been acknowledged in 24 hours
        if (reminder.is_active && reminder.last_acknowledged) {
          const lastAck = new Date(reminder.last_acknowledged);
          const hoursSince = (now - lastAck) / (1000 * 60 * 60);
          
          if (hoursSince > 24) {
            await base44.asServiceRole.entities.CaregiverAlert.create({
              alert_type: 'check_in_suggested',
              severity: 'warning',
              message: `Reminder "${reminder.title}" hasn't been acknowledged in ${Math.floor(hoursSince)} hours`,
              pattern_data: { reminder_id: reminder.id, hours_since: hoursSince }
            });
            
            resolutionReport.actionsTaken.push({
              action: 'alert_stuck_reminder',
              description: `Created alert for unacknowledged reminder: ${reminder.title}`,
              status: 'success'
            });
          }
        }
      }
    } catch (error) {
      resolutionReport.escalatedIssues.push({
        issue: 'reminder_check_failed',
        error: error.message
      });
    }

    // 4. Monitor anxiety trends
    try {
      const recentTrends = await base44.asServiceRole.entities.AnxietyTrend.list('-date', 7);
      
      // Check for sustained high anxiety
      const highAnxietyDays = recentTrends.filter(t => t.anxiety_level >= 7).length;
      
      if (highAnxietyDays >= 3) {
        await base44.asServiceRole.entities.CaregiverAlert.create({
          alert_type: 'high_anxiety',
          severity: 'urgent',
          message: `High anxiety detected for ${highAnxietyDays} of the last 7 days. Recommend caregiver check-in.`,
          pattern_data: { high_anxiety_days: highAnxietyDays, period: '7_days' }
        });
        
        resolutionReport.actionsTaken.push({
          action: 'anxiety_alert',
          description: `Created urgent alert for sustained high anxiety`,
          status: 'success'
        });
      }
    } catch (error) {
      resolutionReport.escalatedIssues.push({
        issue: 'anxiety_monitoring_failed',
        error: error.message
      });
    }

    // Log the resolution actions
    await base44.asServiceRole.entities.ActivityLog.create({
      activity_type: 'auto_maintenance',
      details: {
        fixed: resolutionReport.fixedIssues,
        escalated: resolutionReport.escalatedIssues.length,
        actions: resolutionReport.actionsTaken.length
      }
    });

    return Response.json(resolutionReport);
    
  } catch (error) {
    return Response.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});