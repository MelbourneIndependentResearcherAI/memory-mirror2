import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

const severityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  urgent: 'bg-red-100 text-red-800 border-red-300'
};

const severityIcons = {
  low: <AlertCircle className="w-5 h-5" />,
  medium: <AlertCircle className="w-5 h-5" />,
  high: <AlertCircle className="w-5 h-5" />,
  urgent: <AlertCircle className="w-5 h-5" />
};

export default function AlertNotificationCenter({ patientProfileId }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('unresolved');

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['caregiverAlerts', patientProfileId, filter],
    queryFn: async () => {
      try {
        const query = filter === 'unresolved'
          ? { patient_profile_id: patientProfileId, resolved: false }
          : { patient_profile_id: patientProfileId };
        
        const result = await base44.entities.CaregiverAlert.filter(query, '-timestamp', 50);
        return result || [];
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        return [];
      }
    },
    staleTime: 1000 * 30, // Refresh every 30 seconds
    retry: 1
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => base44.entities.CaregiverAlert.update(id, {
      resolved: true,
      resolved_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiverAlerts'] });
      toast.success('Alert marked as resolved');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CaregiverAlert.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiverAlerts'] });
      toast.success('Alert deleted');
    }
  });

  // Poll for new alerts
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">Loading alerts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Alert Notifications</h3>
          {unresolvedCount > 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {unresolvedCount} unresolved alert{unresolvedCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === 'unresolved' ? 'default' : 'outline'}
            onClick={() => setFilter('unresolved')}
          >
            Active
          </Button>
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p>No alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-l-4 ${severityColors[alert.severity] || severityColors.medium} ${
                alert.resolved ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {severityIcons[alert.severity]}
                  <div className="flex-1">
                    <p className="font-semibold capitalize">{alert.alert_type.replace(/_/g, ' ')}</p>
                    <p className="text-sm mt-1">{alert.message}</p>
                    {alert.pattern_data && (
                      <div className="text-xs mt-2 opacity-75">
                        {JSON.stringify(alert.pattern_data).substring(0, 100)}
                      </div>
                    )}
                    <p className="text-xs mt-2 opacity-60">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!alert.resolved ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resolveMutation.mutate(alert.id)}
                        title="Mark as resolved"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                    </>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(alert.id)}
                    title="Delete alert"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}