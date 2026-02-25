import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Info, Clock, Activity, Bell, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function InsightsPanel() {
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['caregiverAlerts'],
    queryFn: async () => {
      try {
        return await base44.entities.CaregiverAlert.list('-created_date', 20);
      } catch (error) {
        console.error('Error loading alerts:', error);
        return [];
      }
    },
    staleTime: 1000 * 30, // 30 seconds for real-time alerts
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: async () => {
      try {
        return await base44.entities.ActivityLog.list('-created_date', 50);
      } catch (error) {
        console.error('Error loading activity:', error);
        return [];
      }
    },
    staleTime: 1000 * 60, // 1 minute
  });

  const markAsReadMutation = useMutation({
    mutationFn: (alertId) => base44.entities.CaregiverAlert.update(alertId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiverAlerts'] });
    },
  });

  // Proactive pattern analysis
  useEffect(() => {
    const analyzePatterns = async () => {
      if (recentActivity.length < 10) return;

      const last24Hours = recentActivity.filter(a => {
        const created = new Date(a.created_date);
        const now = new Date();
        return (now - created) / (1000 * 60 * 60) < 24;
      });

      // Check for low activity
      if (last24Hours.length < 3) {
        const existingAlert = alerts.find(a => 
          a.alert_type === 'low_activity' && !a.is_read
        );
        if (!existingAlert) {
          base44.entities.CaregiverAlert.create({
            alert_type: 'low_activity',
            severity: 'warning',
            message: 'Low activity detected in the last 24 hours. Consider checking in.',
            pattern_data: { activity_count: last24Hours.length }
          }).catch(() => {});
        }
      }

      // Check for high anxiety patterns
      const anxietyEvents = last24Hours.filter(a => 
        a.anxiety_level && a.anxiety_level >= 6
      );
      if (anxietyEvents.length >= 3) {
        const existingAlert = alerts.find(a => 
          a.alert_type === 'high_anxiety' && !a.is_read
        );
        if (!existingAlert) {
          base44.entities.CaregiverAlert.create({
            alert_type: 'high_anxiety',
            severity: 'urgent',
            message: 'Multiple high anxiety episodes detected. Immediate check-in recommended.',
            pattern_data: { anxiety_count: anxietyEvents.length, avg_level: anxietyEvents.reduce((sum, e) => sum + e.anxiety_level, 0) / anxietyEvents.length }
          }).catch(() => {});
        }
      }

      // Check for repeated calls
      const callEvents = last24Hours.filter(a => a.activity_type === 'phone_call');
      if (callEvents.length >= 5) {
        const existingAlert = alerts.find(a => 
          a.alert_type === 'repeated_calls' && !a.is_read
        );
        if (!existingAlert) {
          base44.entities.CaregiverAlert.create({
            alert_type: 'repeated_calls',
            severity: 'warning',
            message: `${callEvents.length} phone calls made today. May indicate distress or confusion.`,
            pattern_data: { call_count: callEvents.length }
          }).catch(() => {});
        }
      }
    };

    analyzePatterns();
  }, [recentActivity, alerts]);

  const unreadAlerts = alerts.filter(a => !a.is_read);

  const severityConfig = {
    info: { icon: Info, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', borderColor: 'border-blue-300' },
    warning: { icon: AlertTriangle, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', borderColor: 'border-amber-300' },
    urgent: { icon: Bell, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', borderColor: 'border-red-300' }
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 dark:border-orange-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950 dark:to-pink-950">
          <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
            <Activity className="w-6 h-6" />
            Proactive Insights & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {unreadAlerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">All clear! No alerts at this time.</p>
              <p className="text-sm mt-2">We're monitoring activity patterns and will notify you of any concerns.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unreadAlerts.map((alert) => {
                const config = severityConfig[alert.severity] || severityConfig.info;
                const Icon = config.icon;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${config.color} border-2 ${config.borderColor} rounded-xl p-4 shadow-md`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold mb-1">{alert.message}</p>
                        <p className="text-xs opacity-75">
                          {new Date(alert.created_date).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsReadMutation.mutate(alert.id)}
                        className="min-h-[36px]"
                      >
                        Mark Read
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['chat', 'phone_call', 'game_played', 'security_check'].map((type) => {
              const count = recentActivity.filter(a => a.activity_type === type).length;
              const icons = {
                chat: '💬',
                phone_call: '📞',
                game_played: '🎮',
                security_check: '🔒'
              };
              return (
                <div key={type} className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950 dark:to-pink-950 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">{icons[type]}</div>
                  <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{count}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                    {type.replace('_', ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}