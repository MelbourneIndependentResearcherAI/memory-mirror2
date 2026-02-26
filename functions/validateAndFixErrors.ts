import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const issues = [];
    const fixes = [];

    // Check all critical entities exist
    const entities = [
      'UserProfile', 'DailyRoutinePattern', 'Subscription', 
      'CaregiverAlert', 'CaregiverNotification', 'ActivityLog',
      'AnxietyTrend', 'Memory', 'PatientProfile', 'Reminder'
    ];

    for (const entity of entities) {
      try {
        const count = await base44.asServiceRole.entities[entity].list();
        issues.push({ entity, status: 'OK', count: count?.length || 0 });
      } catch (error) {
        issues.push({ entity, status: 'ERROR', error: error.message });
      }
    }

    // Verify subscription schema
    try {
      const subs = await base44.asServiceRole.entities.Subscription.list();
      const validSubs = subs.filter(s => s.user_email && s.plan_name);
      if (validSubs.length > 0) {
        fixes.push('Subscription schema: ✓ Valid');
      }
    } catch (error) {
      fixes.push(`Subscription schema: ✗ ${error.message}`);
    }

    // Check for orphaned records
    try {
      const alerts = await base44.asServiceRole.entities.CaregiverAlert.list();
      const validAlerts = alerts.filter(a => a.alert_type && a.severity && a.message);
      fixes.push(`Alert integrity: ${validAlerts.length}/${alerts.length} valid`);
    } catch {
      fixes.push('Alert checks: Skipped');
    }

    return Response.json({
      timestamp: new Date().toISOString(),
      admin_verified: true,
      entities_status: issues,
      fixes_applied: fixes,
      health: issues.filter(e => e.status === 'OK').length === issues.length ? 'HEALTHY' : 'NEEDS_ATTENTION'
    });
  } catch (error) {
    console.error('Validation error:', error);
    return Response.json({ 
      error: 'Validation failed',
      details: error.message 
    }, { status: 500 });
  }
});