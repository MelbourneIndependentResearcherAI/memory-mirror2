import React from 'react';
import { ArrowLeft, Moon, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NightWatchDashboardPage() {
  const navigate = useNavigate();

  const nightWatchOptions = [
    { id: 1, title: 'Night Watch Mode', icon: '🌙', description: 'Activate 24/7 monitoring with AI protection', path: '/NightWatch', background: '#1E1B4B' },
    { id: 2, title: 'Incident Log', icon: '📋', description: 'View all recorded nighttime incidents', path: '/NightWatchPage', background: '#1F2937' },
    { id: 3, title: 'Location Tracking', icon: '📍', description: 'Set safe zones and track patient location in real-time', path: '/GeofenceTracking', background: '#065F46' },
    { id: 4, title: 'Alert Settings', icon: '🚨', description: 'Configure alert conditions and notifications', path: '/EmergencyAlerts', background: '#7C2D12' },
    { id: 5, title: 'Activity Monitor', icon: '📊', description: 'Track movement and activity patterns', path: '/InsightsAnalytics', background: '#164E63' },
    { id: 6, title: 'Smart Home Control', icon: '⚙️', description: 'Manage lights, locks, and temperature', path: '/SmartHome', background: '#292524' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 pb-16">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 min-h-[44px] text-lg"
        >
          <ArrowLeft className="w-6 h-6" />
          Back
        </button>

        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Moon className="w-12 h-12 text-yellow-300" />
            Night Watch Dashboard
          </h1>
          <p className="text-xl text-slate-400">
            24/7 monitoring and safety management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nightWatchOptions.map(option => (
            <button
              key={option.id}
              onClick={() => navigate(option.path)}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-left hover:scale-105 border border-slate-700 hover:border-yellow-500"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-yellow-400" />
              
              <div className="relative z-10">
                <div className="text-5xl mb-4">{option.icon}</div>
                <h3 className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors">
                  {option.title}
                </h3>
                <p className="text-slate-400 mt-3 text-lg">
                  {option.description}
                </p>
              </div>

              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-300" />
            </button>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            About Night Watch
          </h2>
          <ul className="space-y-3 text-lg text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">✓</span>
              <span>Real-time motion and sound detection using device sensors</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">✓</span>
              <span>AI-powered analysis for distress, confusion, and emergencies</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">✓</span>
              <span>Intelligent bed status tracking - knows when person is active</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">✓</span>
              <span>Automatic alerts for fall detection and exit attempts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">✓</span>
              <span>Smart home automation - lights, locks, temperature control</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">✓</span>
              <span>Voice-enabled friendly AI companion for nighttime support</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 mt-1">✓</span>
              <span>Detailed incident logging for caregiver review and insights</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}