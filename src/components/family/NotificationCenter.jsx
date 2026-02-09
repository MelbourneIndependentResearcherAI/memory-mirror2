import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns';

export default function NotificationCenter() {
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['caregiver-alerts'],
    queryFn: () => base44.entities.CaregiverAlert.list('-created_date', 50),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.CaregiverAlert.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['caregiver-alerts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CaregiverAlert.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['caregiver-alerts'] }),
  });

  const unreadAlerts = alerts.filter(a => !a.is_read);
  const readAlerts = alerts.filter(a => a.is_read);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <Bell className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-50 border-red-300 dark:bg-red-950 dark:border-red-700';
      case 'warning':
        return 'bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-700';
      default:
        return 'bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <Bell className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          <strong>Notification Center:</strong> Stay informed about important activities and status changes. Urgent alerts require immediate attention.
        </AlertDescription>
      </Alert>

      {unreadAlerts.length === 0 && readAlerts.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-slate-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No notifications at this time</p>
          </CardContent>
        </Card>
      )}

      {unreadAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              New Alerts ({unreadAlerts.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => unreadAlerts.forEach(a => markReadMutation.mutate(a.id))}
            >
              Mark All as Read
            </Button>
          </div>
          
          <div className="grid gap-3">
            {unreadAlerts.map((alert) => (
              <Card key={alert.id} className={`border-2 ${getSeverityColor(alert.severity)}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        {alert.alert_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                        {alert.message}
                      </p>
                      {alert.pattern_data && (
                        <div className="bg-white/50 dark:bg-slate-900/50 p-2 rounded text-xs">
                          <pre className="overflow-auto">{JSON.stringify(alert.pattern_data, null, 2)}</pre>
                        </div>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {format(parseISO(alert.created_date), 'PPpp')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markReadMutation.mutate(alert.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(alert.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {readAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Past Notifications ({readAlerts.length})
          </h3>
          
          <div className="grid gap-3 opacity-60">
            {readAlerts.slice(0, 10).map((alert) => (
              <Card key={alert.id} className="border">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">
                        {alert.alert_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(parseISO(alert.created_date), 'PPp')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(alert.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}