import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Moon, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function NightWatchLog({ onBack }) {
  const [expandedIncident, setExpandedIncident] = useState(null);

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['nightIncidents'],
    queryFn: () => base44.entities.NightIncident.list('-created_date', 50)
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getIncidentIcon = (type) => {
    switch (type) {
      case 'exit_attempt': return '🚪';
      case 'distress': return '😰';
      case 'bathroom_need': return '🚽';
      case 'movement_detected': return '👣';
      case 'successfully_redirected': return '✅';
      default: return '📋';
    }
  };

  const formatIncidentType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading night watch logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronUp className="w-5 h-5" />
            </Button>
          )}
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Moon className="w-6 h-6 text-indigo-600" />
            Night Watch Log
          </h2>
        </div>
        <Badge variant="outline" className="text-sm">
          {incidents.length} Total Incidents
        </Badge>
      </div>

      {incidents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Moon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No nighttime incidents recorded yet</p>
            <p className="text-sm text-slate-400 mt-2">
              Night Watch logs will appear here when activated
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getIncidentIcon(incident.incident_type)}</div>
                    <div>
                      <CardTitle className="text-lg">
                        {formatIncidentType(incident.incident_type)}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-sm text-slate-500">
                          {new Date(incident.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(incident.severity)}>
                    {incident.severity}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {incident.user_statement && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">What they said:</p>
                      <p className="text-sm text-blue-800">"{incident.user_statement}"</p>
                    </div>
                  )}

                  {incident.ai_response && (
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-slate-900 mb-1">AI Response:</p>
                      <p className="text-sm text-slate-700">"{incident.ai_response}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    {incident.duration_minutes && (
                      <span className="text-slate-600">
                        Duration: {incident.duration_minutes} minutes
                      </span>
                    )}
                    {incident.outcome && (
                      <Badge variant="outline" className="bg-green-50">
                        {formatIncidentType(incident.outcome)}
                      </Badge>
                    )}
                  </div>

                  {incident.caregiver_notified && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Caregiver was notified</span>
                    </div>
                  )}

                  {incident.conversation_log && incident.conversation_log.length > 0 && (
                    <div className="border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedIncident(
                          expandedIncident === incident.id ? null : incident.id
                        )}
                        className="w-full justify-between"
                      >
                        <span>View Full Conversation ({incident.conversation_log.length} messages)</span>
                        {expandedIncident === incident.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>

                      {expandedIncident === incident.id && (
                        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                          {incident.conversation_log.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg text-sm ${
                                msg.role === 'user'
                                  ? 'bg-blue-100 ml-4'
                                  : 'bg-slate-100 mr-4'
                              }`}
                            >
                              <div className="font-semibold text-xs text-slate-600 mb-1">
                                {msg.role === 'user' ? 'Loved One' : 'AI Companion'}
                              </div>
                              <p>{msg.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}