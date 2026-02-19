import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle, CheckCircle2, Clock, TrendingUp, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthStatus = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('healthCheck', {});
      setHealthStatus(response.data);
      setLastUpdate(new Date());
      
      if (response.data.status === 'critical') {
        toast.error('Critical system issues detected!');
      } else if (response.data.status === 'degraded') {
        toast.warning('System degradation detected');
      }
    } catch (error) {
      toast.error('Failed to fetch health status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const runAutoFix = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('autoFixErrors', {});
      toast.success(`Auto-fix complete: ${response.data.fixedIssues} issues resolved`);
      await fetchHealthStatus();
    } catch (error) {
      toast.error('Auto-fix failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealthStatus, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status) => {
    const colors = {
      pass: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      fail: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      healthy: 'text-green-600',
      degraded: 'text-yellow-600',
      unhealthy: 'text-red-600',
      critical: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const getStatusIcon = (status) => {
    if (status === 'pass' || status === 'healthy') return <CheckCircle2 className="w-5 h-5" />;
    if (status === 'warning' || status === 'degraded') return <AlertCircle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            System Monitoring
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            24/7 automated maintenance and health monitoring
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={runAutoFix}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            Run Auto-Fix
          </Button>
          <Button
            onClick={fetchHealthStatus}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {healthStatus && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                System Status
                <Badge className={getStatusColor(healthStatus.status)}>
                  {healthStatus.status.toUpperCase()}
                </Badge>
              </span>
              {lastUpdate && (
                <span className="text-sm font-normal text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(healthStatus.checks || {}).map(([key, check]) => (
                <div key={key} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(check.status)}
                    <span className={`font-semibold capitalize ${getStatusColor(check.status)}`}>
                      {key.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {check.responseTime && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {check.responseTime}ms
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues */}
      {healthStatus?.issues && healthStatus.issues.length > 0 && (
        <Card className="border-2 border-red-300 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Detected Issues ({healthStatus.issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthStatus.issues.map((issue, idx) => (
                <div key={idx} className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <Badge className={`${
                      issue.severity === 'critical' ? 'bg-red-600' :
                      issue.severity === 'high' ? 'bg-orange-600' :
                      issue.severity === 'medium' ? 'bg-yellow-600' :
                      'bg-blue-600'
                    } text-white`}>
                      {issue.severity}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">{issue.message}</p>
                      {issue.component && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Component: {issue.component}
                        </p>
                      )}
                      {issue.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-mono">
                          {issue.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {healthStatus?.recommendations && healthStatus.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {healthStatus.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Auto-refresh Toggle */}
      <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="w-5 h-5"
        />
        <label className="text-slate-700 dark:text-slate-300">
          Auto-refresh every minute
        </label>
      </div>

      {/* Agent Status */}
      <Card>
        <CardHeader>
          <CardTitle>🤖 AI Maintenance Agents Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-800 dark:text-green-400">App Monitor</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Checking health every 5 min</p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-800 dark:text-green-400">Error Resolver</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Auto-fixing every 30 min</p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-800 dark:text-green-400">Performance Optimizer</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Monitoring performance 24/7</p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-800 dark:text-green-400">Data Integrity Guardian</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Validating data continuously</p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-green-800 dark:text-green-400">UX Guardian</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Ensuring optimal patient experience</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}