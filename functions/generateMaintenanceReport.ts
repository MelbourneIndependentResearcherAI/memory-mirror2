import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Daily Maintenance Report Generator
 * Creates comprehensive health and performance reports
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const report = {
      generated: new Date().toISOString(),
      period: '24_hours',
      summary: {},
      metrics: {},
      issues: [],
      recommendations: []
    };

    // Get last 24 hours of activity
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Activity Summary
    try {
      const recentActivity = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 1000);
      const last24h = recentActivity.filter(log => log.created_date >= yesterday);
      
      const activityByType = {};
      last24h.forEach(log => {
        activityByType[log.activity_type] = (activityByType[log.activity_type] || 0) + 1;
      });
      
      report.metrics.totalActivities = last24h.length;
      report.metrics.activityBreakdown = activityByType;
      report.metrics.errorCount = activityByType.error || 0;
      report.metrics.chatInteractions = activityByType.chat || 0;
      
      // Error rate
      const errorRate = last24h.length > 0 
        ? ((activityByType.error || 0) / last24h.length * 100).toFixed(2)
        : 0;
      
      report.metrics.errorRate = `${errorRate}%`;
      
      if (errorRate > 5) {
        report.issues.push({
          severity: 'high',
          message: `Error rate (${errorRate}%) exceeds acceptable threshold (5%)`,
          component: 'stability'
        });
      }
    } catch (error) {
      report.issues.push({
        severity: 'critical',
        message: 'Failed to analyze activity logs',
        error: error.message
      });
    }

    // 2. User Engagement
    try {
      const journals = await base44.asServiceRole.entities.CareJournal.list('-entry_date', 100);
      const recentJournals = journals.filter(j => j.entry_date >= yesterday);
      
      report.metrics.newJournals = recentJournals.length;
      report.metrics.activeUsers = new Set(recentJournals.map(j => j.created_by)).size;
    } catch (error) {
      report.issues.push({
        severity: 'medium',
        message: 'Failed to analyze user engagement',
        error: error.message
      });
    }

    // 3. Anxiety Monitoring
    try {
      const trends = await base44.asServiceRole.entities.AnxietyTrend.list('-date', 7);
      const avgAnxiety = trends.length > 0
        ? (trends.reduce((sum, t) => sum + t.anxiety_level, 0) / trends.length).toFixed(1)
        : 0;
      
      report.metrics.averageAnxiety = avgAnxiety;
      report.metrics.highAnxietyDays = trends.filter(t => t.anxiety_level >= 7).length;
      
      if (avgAnxiety > 6) {
        report.issues.push({
          severity: 'high',
          message: `Average anxiety level (${avgAnxiety}/10) is elevated`,
          component: 'wellbeing'
        });
        report.recommendations.push('Consider increasing caregiver check-ins and proactive support');
      }
    } catch (error) {
      report.issues.push({
        severity: 'low',
        message: 'Failed to analyze anxiety trends',
        error: error.message
      });
    }

    // 4. System Health
    try {
      const healthCheckLogs = await base44.asServiceRole.entities.ActivityLog
        .filter({ activity_type: 'health_check' }, '-created_date', 10);
      
      const recentHealthChecks = healthCheckLogs.filter(log => log.created_date >= yesterday);
      const failedChecks = recentHealthChecks.filter(log => 
        log.details?.status === 'unhealthy' || log.details?.status === 'critical'
      ).length;
      
      report.metrics.healthChecksPassed = recentHealthChecks.length - failedChecks;
      report.metrics.healthChecksFailed = failedChecks;
      
      if (failedChecks > 0) {
        report.issues.push({
          severity: 'critical',
          message: `${failedChecks} health checks failed in the last 24 hours`,
          component: 'system_health'
        });
      }
    } catch (error) {
      report.issues.push({
        severity: 'medium',
        message: 'Failed to analyze system health',
        error: error.message
      });
    }

    // 5. Summary
    report.summary.status = report.issues.filter(i => i.severity === 'critical').length > 0
      ? 'Critical - Immediate action required'
      : report.issues.filter(i => i.severity === 'high').length > 0
      ? 'Warning - Attention needed'
      : report.issues.length > 0
      ? 'Minor issues detected'
      : 'Healthy - All systems operational';
    
    report.summary.totalIssues = report.issues.length;
    report.summary.criticalIssues = report.issues.filter(i => i.severity === 'critical').length;
    report.summary.highIssues = report.issues.filter(i => i.severity === 'high').length;

    // 6. Recommendations
    if (report.summary.status === 'Healthy - All systems operational') {
      report.recommendations.push('Continue monitoring - no action required');
    }
    
    if (report.metrics.errorRate && parseFloat(report.metrics.errorRate) > 3) {
      report.recommendations.push('Investigate error logs and implement fixes');
    }
    
    if (report.metrics.activeUsers < 5) {
      report.recommendations.push('Low user engagement - consider outreach campaign');
    }

    // Email report to developers (would need email integration)
    const reportText = `
Memory Mirror - Daily Maintenance Report
Generated: ${report.generated}

STATUS: ${report.summary.status}

METRICS:
- Total Activities: ${report.metrics.totalActivities || 0}
- Chat Interactions: ${report.metrics.chatInteractions || 0}
- Error Rate: ${report.metrics.errorRate || '0%'}
- Active Users: ${report.metrics.activeUsers || 0}
- New Journals: ${report.metrics.newJournals || 0}
- Average Anxiety: ${report.metrics.averageAnxiety || 'N/A'}/10

ISSUES DETECTED: ${report.summary.totalIssues}
${report.issues.map(i => `- [${i.severity.toUpperCase()}] ${i.message}`).join('\n')}

RECOMMENDATIONS:
${report.recommendations.map(r => `- ${r}`).join('\n')}
    `;

    // Log the report
    await base44.asServiceRole.entities.ActivityLog.create({
      activity_type: 'maintenance_report',
      details: {
        status: report.summary.status,
        issues: report.summary.totalIssues,
        report: reportText
      }
    });

    return Response.json({
      report,
      reportText
    });
    
  } catch (error) {
    return Response.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});