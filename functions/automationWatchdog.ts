import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Automation Watchdog - runs every 15 minutes
 * Monitors system health by checking entity data integrity,
 * recent activity patterns, and error signals.
 * Creates CaregiverAlerts for any critical issues found.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = Date.now();
    const report = {
      timestamp: new Date().toISOString(),
      checks: {},
      issues: [],
      actions: [],
    };

    // Run all health checks in parallel
    const [
      recentActivity,
      unresolvedAlerts,
      oldPendingNotifications,
      recentNightIncidents,
      recentSubscriptions,
    ] = await Promise.all([
      base44.asServiceRole.entities.ActivityLog.list('-created_date', 20).catch(() => []),
      base44.asServiceRole.entities.CaregiverAlert.filter({ resolved: false }).catch(() => []),
      base44.asServiceRole.entities.CaregiverNotification.filter({
        created_date: { $lt: new Date(now - 48 * 60 * 60 * 1000).toISOString() }
      }).catch(() => []),
      base44.asServiceRole.entities.NightIncident.list('-created_date', 5).catch(() => []),
      base44.asServiceRole.entities.Subscription.filter({ status: 'active' }).catch(() => []),
    ]);

    // ── CHECK 1: Activity log freshness (is the app being used / automations running?) ──
    const lastActivityLog = recentActivity[0];
    if (lastActivityLog) {
      const hoursSinceLastLog = (now - new Date(lastActivityLog.created_date).getTime()) / (1000 * 60 * 60);
      report.checks.activity_freshness = {
        status: hoursSinceLastLog < 2 ? 'pass' : hoursSinceLastLog < 6 ? 'warning' : 'fail',
        hours_since_last_log: Math.round(hoursSinceLastLog * 10) / 10,
      };
      if (hoursSinceLastLog > 6) {
        report.issues.push({ severity: 'high', check: 'activity_freshness', message: `No activity logged for ${Math.round(hoursSinceLastLog)}h — automations may be down` });
      }
    } else {
      report.checks.activity_freshness = { status: 'warning', message: 'No activity logs found' };
    }

    // ── CHECK 2: Unresolved alert accumulation ──
    report.checks.unresolved_alerts = {
      status: unresolvedAlerts.length < 10 ? 'pass' : unresolvedAlerts.length < 30 ? 'warning' : 'fail',
      count: unresolvedAlerts.length,
    };
    if (unresolvedAlerts.length >= 30) {
      report.issues.push({ severity: 'medium', check: 'unresolved_alerts', message: `${unresolvedAlerts.length} unresolved caregiver alerts — auto-resolver may be stuck` });
    }

    // ── CHECK 3: Stale notifications piling up ──
    report.checks.stale_notifications = {
      status: oldPendingNotifications.length < 20 ? 'pass' : 'warning',
      count: oldPendingNotifications.length,
    };
    if (oldPendingNotifications.length >= 20) {
      report.issues.push({ severity: 'low', check: 'stale_notifications', message: `${oldPendingNotifications.length} notifications older than 48h not cleaned up` });

      // Auto-fix: delete oldest stale notifications (cap at 50)
      const toDelete = oldPendingNotifications.slice(0, 50);
      await Promise.all(toDelete.map(n => base44.asServiceRole.entities.CaregiverNotification.delete(n.id).catch(() => {})));
      report.actions.push(`Auto-deleted ${toDelete.length} stale notifications`);
    }

    // ── CHECK 4: Urgent unresolved alerts older than 24h ──
    const urgentStaleAlerts = unresolvedAlerts.filter(a => {
      const ageHours = (now - new Date(a.created_date).getTime()) / (1000 * 60 * 60);
      return a.severity === 'urgent' && ageHours > 24;
    });
    report.checks.urgent_stale_alerts = {
      status: urgentStaleAlerts.length === 0 ? 'pass' : 'fail',
      count: urgentStaleAlerts.length,
    };
    if (urgentStaleAlerts.length > 0) {
      report.issues.push({ severity: 'high', check: 'urgent_stale_alerts', message: `${urgentStaleAlerts.length} urgent alerts unresolved for >24h` });
    }

    // ── CHECK 5: Auto-resolve very old low-severity alerts (>7 days) ──
    const veryOldAlerts = unresolvedAlerts.filter(a => {
      const ageDays = (now - new Date(a.created_date).getTime()) / (1000 * 60 * 60 * 24);
      return ageDays > 7 && a.severity !== 'urgent';
    });
    if (veryOldAlerts.length > 0) {
      await Promise.all(veryOldAlerts.map(a =>
        base44.asServiceRole.entities.CaregiverAlert.update(a.id, {
          resolved: true,
          resolved_at: new Date().toISOString(),
          notes: 'Auto-resolved by watchdog after 7 days',
        }).catch(() => {})
      ));
      report.actions.push(`Auto-resolved ${veryOldAlerts.length} stale low-severity alerts`);
    }

    // ── CHECK 6: Night incident spike ──
    const recentIncidents = recentNightIncidents.filter(i => {
      const ageHours = (now - new Date(i.created_date).getTime()) / (1000 * 60 * 60);
      return ageHours < 8;
    });
    report.checks.night_incidents = {
      status: recentIncidents.length < 3 ? 'pass' : 'warning',
      recent_count: recentIncidents.length,
    };

    // ── SUMMARY ──
    const highIssues = report.issues.filter(i => i.severity === 'high').length;
    const overallStatus = highIssues > 0 ? 'degraded' : report.issues.length > 0 ? 'warning' : 'healthy';

    // Create a watchdog CaregiverAlert only if there are high-severity issues
    if (highIssues > 0) {
      const issuesSummary = report.issues.filter(i => i.severity === 'high').map(i => i.message).join('; ');
      await base44.asServiceRole.entities.CaregiverAlert.create({
        alert_type: 'safety_concern',
        severity: 'high',
        message: `🤖 Watchdog detected ${highIssues} high-severity issue(s): ${issuesSummary}`,
        timestamp: new Date().toISOString(),
        resolved: false,
      }).catch(() => {});
    }

    // Log watchdog run
    await base44.asServiceRole.entities.ActivityLog.create({
      activity_type: 'security_check',
      details: {
        watchdog: true,
        status: overallStatus,
        issues: report.issues.length,
        actions: report.actions.length,
        checks_summary: Object.fromEntries(
          Object.entries(report.checks).map(([k, v]) => [k, v.status])
        ),
      },
    });

    return Response.json({
      success: true,
      status: overallStatus,
      issues_found: report.issues.length,
      actions_taken: report.actions.length,
      ...report,
    });

  } catch (error) {
    console.error('Watchdog fatal error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});