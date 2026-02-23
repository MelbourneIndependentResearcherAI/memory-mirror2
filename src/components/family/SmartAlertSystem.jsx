import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, Moon, Users, RefreshCw, CheckCircle, AlertTriangle, XCircle, Sparkles, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartAlertSystem() {
  const [analyzing, setAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['smartAlerts'],
    queryFn: async () => {
      const allAlerts = await base44.entities.CaregiverAlert.list('-created_date', 50);
      return allAlerts.filter(a => a.alert_type === 'behavior_anomaly');
    }
  });

  const runAnalysisMutation = useMutation({
    mutationFn: () => base44.functions.invoke('detectBehaviorAnomalies', {}),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['smartAlerts'] });
      const alertsFound = response.data.alerts_created || 0;
      if (alertsFound > 0) {
        toast.success(`Analysis complete! Found ${alertsFound} new insight${alertsFound > 1 ? 's' : ''}`);
      } else {
        toast.success('Analysis complete! No concerning patterns detected.');
      }
    },
    onError: (error) => {
      toast.error('Analysis failed. Please try again.');
      console.error(error);
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.CaregiverAlert.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartAlerts'] });
      toast.success('Marked as reviewed');
    }
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => base44.entities.CaregiverAlert.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smartAlerts'] });
      toast.success('Alert dismissed');
    }
  });

  const runAnalysis = async () => {
    setAnalyzing(true);
    await runAnalysisMutation.mutateAsync();
    setAnalyzing(false);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'low': return <Bell className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30';
      case 'medium': return 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30';
      case 'low': return 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30';
      default: return 'border-slate-300 bg-slate-50';
    }
  };

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'activity_drop': return <TrendingUp className="w-5 h-5 rotate-180" />;
      case 'anxiety_spike': return <AlertTriangle className="w-5 h-5" />;
      case 'night_disturbance': return <Moon className="w-5 h-5" />;
      case 'social_withdrawal': return <Users className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const unreadAlerts = alerts.filter(a => !a.is_read);
  const readAlerts = alerts.filter(a => a.is_read);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-blue-950/30 border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">AI Smart Alert System</CardTitle>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  AI-powered behavior analysis and anomaly detection
                </p>
              </div>
            </div>
            <Button
              onClick={runAnalysis}
              disabled={analyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2 min-h-[44px]"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
        <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-slate-700 dark:text-slate-300">
          This system continuously monitors interaction patterns, mood changes, and activity logs to detect
          meaningful deviations from normal behavior. Run analysis anytime to get AI insights.
        </AlertDescription>
      </Alert>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Alerts</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{unreadAlerts.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Reviewed</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{readAlerts.length}</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Insights</p>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{alerts.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {unreadAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            Active Alerts ({unreadAlerts.length})
          </h3>
          
          <AnimatePresence>
            {unreadAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`border-2 ${getSeverityColor(alert.severity)}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        {getAnomalyIcon(alert.anomaly_type)}
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-lg">
                            {alert.title}
                          </h4>
                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line mb-3">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <Badge variant="outline">
                              {Math.round(alert.confidence_score * 100)}% confidence
                            </Badge>
                            <span>
                              {new Date(alert.created_date).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={
                        alert.severity === 'high' ? 'bg-red-600' :
                        alert.severity === 'medium' ? 'bg-amber-600' : 'bg-blue-600'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => markAsReadMutation.mutate(alert.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 min-h-[44px]"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Reviewed
                      </Button>
                      <Button
                        onClick={() => dismissMutation.mutate(alert.id)}
                        variant="ghost"
                        size="sm"
                        className="min-h-[44px] min-w-[44px]"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Reviewed Alerts */}
      {readAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Reviewed Insights ({readAlerts.length})
          </h3>
          
          <div className="space-y-3">
            {readAlerts.slice(0, 5).map((alert) => (
              <Card key={alert.id} className="border opacity-70 hover:opacity-100 transition-opacity">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <BellOff className="w-4 h-4 text-slate-400 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(alert.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => dismissMutation.mutate(alert.id)}
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px] min-w-[44px]"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {alerts.length === 0 && !isLoading && (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Brain className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
              No alerts yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Run your first analysis to start monitoring behavior patterns
            </p>
            <Button
              onClick={runAnalysis}
              disabled={analyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Run Analysis Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}