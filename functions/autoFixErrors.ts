import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const fixes = [];
    const errors = [];

    // 1. Fix stuck notifications (run cleanup in parallel batches)
    try {
      const oldNotifications = await base44.asServiceRole.entities.CaregiverNotification.filter({
        created_date: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() }
      });
      
      await Promise.all(oldNotifications.map(n => 
        base44.asServiceRole.entities.CaregiverNotification.delete(n.id)
      ));
      
      fixes.push(`Cleaned ${oldNotifications.length} old notifications`);
    } catch (error) {
      errors.push(`Notification cleanup failed: ${error.message}`);
    }

    // 2. Fix orphaned care team members
    try {
      const [team, profiles] = await Promise.all([
        base44.asServiceRole.entities.CaregiverTeam.list(),
        base44.asServiceRole.entities.PatientProfile.list()
      ]);
      const validProfileIds = new Set(profiles.map(p => p.id));
      
      const orphaned = team.filter(m => m.patient_profile_id && !validProfileIds.has(m.patient_profile_id));
      await Promise.all(orphaned.map(m => base44.asServiceRole.entities.CaregiverTeam.delete(m.id)));
      
      if (orphaned.length > 0) {
        fixes.push(`Removed ${orphaned.length} orphaned team members`);
      }
    } catch (error) {
      errors.push(`Team cleanup failed: ${error.message}`);
    }

    // 3. Clean old activity logs (cap at 100 to avoid timeouts)
    try {
      const oldLogs = await base44.asServiceRole.entities.ActivityLog.filter({
        created_date: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() }
      });
      
      const toDelete = oldLogs.slice(0, 100);
      await Promise.all(toDelete.map(log => base44.asServiceRole.entities.ActivityLog.delete(log.id)));
      
      fixes.push(`Cleaned ${toDelete.length} old activity logs`);
    } catch (error) {
      errors.push(`Activity log cleanup failed: ${error.message}`);
    }

    // 4. Auto-resolve old unresolved alerts (resolved field is boolean)
    try {
      const oldAlerts = await base44.asServiceRole.entities.CaregiverAlert.filter({
        resolved: false,
        created_date: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
      });
      
      await Promise.all(oldAlerts.map(alert =>
        base44.asServiceRole.entities.CaregiverAlert.update(alert.id, {
          resolved: true,
          resolved_at: new Date().toISOString(),
          notes: 'Auto-resolved by maintenance agent after 7 days'
        })
      ));
      
      if (oldAlerts.length > 0) {
        fixes.push(`Auto-resolved ${oldAlerts.length} old alerts`);
      }
    } catch (error) {
      errors.push(`Alert resolution failed: ${error.message}`);
    }

    // Log the maintenance run
    await base44.asServiceRole.entities.ActivityLog.create({
      activity_type: 'auto_maintenance',
      details: {
        fixes_applied: fixes,
        errors_encountered: errors,
        timestamp: new Date().toISOString()
      }
    });

    return Response.json({
      success: true,
      fixes_applied: fixes.length,
      errors_encountered: errors.length,
      fixes,
      errors
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});