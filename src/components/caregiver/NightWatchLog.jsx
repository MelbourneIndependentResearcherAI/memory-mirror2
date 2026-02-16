import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, AlertTriangle, CheckCircle, Clock, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function NightWatchLog() {
  const [selectedIncident, setSelectedIncident] = useState(null);

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['nightIncidents'],
    queryFn: () => base44.entities.NightIncident.list('-timestamp', 30)
  });

  const severityColors = {
    low: 'text-green-600 bg-green-50 dark:bg-green-950',
    medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950',
    high: 'text-red-600 bg-red-50 dark:bg-red-950',
    resolved: 'text-blue-600 bg-blue-50 dark:bg-blue-950'
  };

  const outcomeLabels = {
    returned_to_bed: 'Returned to Bed',
    caregiver_assisted: 'Caregiver Assisted',
    stayed_awake: 'Stayed Awake',
    escalated: 'Escalated'
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading night watch logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Moon className="w-6 h-6 text-indigo-500" />
            Night Watch Log
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track nighttime activity and incidents
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {incidents.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {incidents.filter(i => i.severity === 'high').length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {incidents.length > 0
                ? Math.round(incidents.reduce((sum, i) => sum + (i.duration_minutes || 0), 0) / incidents.length)
                : 0}
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">min</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Per incident
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>
            Detailed log of nighttime activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No incidents recorded</p>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  onClick={() => setSelectedIncident(selectedIncident?.id === incident.id ? null : incident)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[incident.severity]}`}>
                          {incident.severity}
                        </span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                          {incident.incident_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(incident.timestamp), 'MMM dd, h:mm a')}
                        </span>
                        {incident.duration_minutes && (
                          <span>{incident.duration_minutes} minutes</span>
                        )}
                        {incident.outcome && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {outcomeLabels[incident.outcome]}
                          </span>
                        )}
                      </div>

                      {incident.user_statement && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">
                          "{incident.user_statement.substring(0, 100)}..."
                        </p>
                      )}
                    </div>

                    {incident.caregiver_notified && (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                  </div>

                  {/* Expanded Details */}
                  {selectedIncident?.id === incident.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                      {incident.conversation_log?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" />
                            Conversation Log
                          </h4>
                          <div className="space-y-2 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 max-h-64 overflow-y-auto">
                            {incident.conversation_log.map((msg, idx) => (
                              <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-slate-700 dark:text-slate-300' : 'text-blue-600 dark:text-blue-400'}`}>
                                <span className="font-medium">{msg.role === 'user' ? 'User' : 'AI'}:</span> {msg.content}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {incident.ai_response && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            AI Response
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-950 rounded p-2">
                            {incident.ai_response}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}