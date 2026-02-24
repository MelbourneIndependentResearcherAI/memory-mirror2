import React from 'react';
import { ArrowLeft, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function NightWatchIncidentsPage() {
  const navigate = useNavigate();

  const { data: incidents = [] } = useQuery({
    queryKey: ['nightIncidents'],
    queryFn: () => base44.entities.NightIncident.list()
  });

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-900/40 border-red-700 text-red-300';
      case 'high': return 'bg-orange-900/40 border-orange-700 text-orange-300';
      case 'medium': return 'bg-yellow-900/40 border-yellow-700 text-yellow-300';
      default: return 'bg-blue-900/40 border-blue-700 text-blue-300';
    }
  };

  const getIncidentIcon = (type) => {
    switch(type) {
      case 'fall_detected': return '🚨';
      case 'exit_attempt': return '🚪';
      case 'distress': return '😟';
      case 'movement_detected': return '🚶';
      case 'bathroom_need': return '🚽';
      case 'night_incident': return '🌙';
      default: return '📝';
    }
  };

  const getIncidentTypeLabel = (type) => {
    return type.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 pb-16">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 min-h-[44px] text-lg"
        >
          <ArrowLeft className="w-6 h-6" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-yellow-400" />
            Incident Log
          </h1>
          <p className="text-slate-400 text-lg">
            View all recorded nighttime incidents and events
          </p>
        </div>

        {incidents.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">✓</div>
            <p className="text-white text-xl font-semibold mb-2">No incidents recorded</p>
            <p className="text-slate-400">Your loved one has had a peaceful night!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map(incident => (
              <div
                key={incident.id}
                className={`border rounded-xl p-6 transition-all hover:shadow-lg ${getSeverityColor(incident.severity)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{getIncidentIcon(incident.incident_type)}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {getIncidentTypeLabel(incident.incident_type)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(incident.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    incident.severity === 'critical' ? 'bg-red-600 text-white' :
                    incident.severity === 'high' ? 'bg-orange-600 text-white' :
                    incident.severity === 'medium' ? 'bg-yellow-600 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {incident.severity?.toUpperCase() || 'MEDIUM'}
                  </div>
                </div>

                {incident.user_statement && (
                  <div className="mb-4 p-4 bg-black/20 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Person said</p>
                    <p className="text-white italic">"{incident.user_statement}"</p>
                  </div>
                )}

                {incident.ai_response && (
                  <div className="mb-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                    <p className="text-xs text-blue-300 mb-1 uppercase tracking-wider">AI Response</p>
                    <p className="text-slate-200">{incident.ai_response}</p>
                  </div>
                )}

                {incident.duration_minutes !== undefined && (
                  <div className="text-sm text-slate-300">
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    Duration: {incident.duration_minutes} minutes
                  </div>
                )}

                {incident.outcome && (
                  <div className="mt-3 text-xs text-slate-400">
                    <strong>Outcome:</strong> {incident.outcome.replace(/_/g, ' ').toLowerCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {incidents.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{incidents.length}</div>
                <p className="text-slate-400 text-sm mt-1">Total Incidents</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">
                  {incidents.filter(i => i.severity === 'critical').length}
                </div>
                <p className="text-slate-400 text-sm mt-1">Critical</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">
                  {incidents.filter(i => i.severity === 'high').length}
                </div>
                <p className="text-slate-400 text-sm mt-1">High</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {incidents.filter(i => ['low', 'medium'].includes(i.severity)).length}
                </div>
                <p className="text-slate-400 text-sm mt-1">Low-Medium</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}