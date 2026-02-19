import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Comprehensive health check function
 * Runs automated tests on critical app components
 * Returns detailed health report
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const startTime = Date.now();
    
    const healthReport = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {},
      issues: [],
      recommendations: []
    };

    // 1. Database Connectivity Check
    try {
      await base44.asServiceRole.entities.UserProfile.list('-created_date', 1);
      healthReport.checks.database = {
        status: 'pass',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      healthReport.checks.database = {
        status: 'fail',
        error: error.message
      };
      healthReport.issues.push({
        severity: 'critical',
        component: 'database',
        message: 'Database connection failed',
        error: error.message
      });
      healthReport.status = 'unhealthy';
    }

    // 2. Entity Integrity Check
    const entityCheckStart = Date.now();
    try {
      const entities = ['UserProfile', 'CareJournal', 'Memory', 'ActivityLog', 'Reminder'];
      const entityResults = {};
      
      for (const entity of entities) {
        try {
          const count = await base44.asServiceRole.entities[entity].list('-created_date', 1);
          entityResults[entity] = { status: 'pass', recordCount: count.length };
        } catch (err) {
          entityResults[entity] = { status: 'fail', error: err.message };
          healthReport.issues.push({
            severity: 'high',
            component: 'entities',
            message: `Entity ${entity} check failed`,
            error: err.message
          });
        }
      }
      
      healthReport.checks.entities = {
        status: Object.values(entityResults).every(r => r.status === 'pass') ? 'pass' : 'partial',
        details: entityResults,
        responseTime: Date.now() - entityCheckStart
      };
    } catch (error) {
      healthReport.checks.entities = {
        status: 'fail',
        error: error.message
      };
    }

    // 3. Error Log Analysis
    try {
      const recentLogs = await base44.asServiceRole.entities.ActivityLog.list('-created_date', 100);
      const errorCount = recentLogs.filter(log => 
        log.details?.error || log.activity_type === 'error'
      ).length;
      
      healthReport.checks.errorRate = {
        status: errorCount < 10 ? 'pass' : errorCount < 50 ? 'warning' : 'fail',
        recentErrors: errorCount,
        totalChecked: recentLogs.length
      };
      
      if (errorCount > 50) {
        healthReport.issues.push({
          severity: 'high',
          component: 'error_rate',
          message: `High error rate detected: ${errorCount} errors in recent activity`
        });
      }
    } catch (error) {
      healthReport.checks.errorRate = {
        status: 'unknown',
        error: error.message
      };
    }

    // 4. Performance Metrics
    const totalCheckTime = Date.now() - startTime;
    healthReport.checks.performance = {
      status: totalCheckTime < 2000 ? 'pass' : totalCheckTime < 5000 ? 'warning' : 'fail',
      totalCheckTime: totalCheckTime,
      target: '< 2000ms'
    };
    
    if (totalCheckTime > 5000) {
      healthReport.issues.push({
        severity: 'medium',
        component: 'performance',
        message: `Health check took ${totalCheckTime}ms (target: <2000ms)`
      });
    }

    // 5. Recommendations
    if (healthReport.issues.length === 0) {
      healthReport.recommendations.push('System is operating normally');
    } else {
      const criticalIssues = healthReport.issues.filter(i => i.severity === 'critical');
      if (criticalIssues.length > 0) {
        healthReport.recommendations.push('URGENT: Address critical issues immediately');
        healthReport.status = 'critical';
      }
      
      const highIssues = healthReport.issues.filter(i => i.severity === 'high');
      if (highIssues.length > 0) {
        healthReport.recommendations.push('Address high-priority issues within 1 hour');
        if (healthReport.status === 'healthy') healthReport.status = 'degraded';
      }
    }

    // Log health check result
    await base44.asServiceRole.entities.ActivityLog.create({
      activity_type: 'health_check',
      details: {
        status: healthReport.status,
        issueCount: healthReport.issues.length,
        duration: totalCheckTime
      }
    });

    return Response.json(healthReport);
    
  } catch (error) {
    return Response.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});