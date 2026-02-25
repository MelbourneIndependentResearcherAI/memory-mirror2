import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function CaregiverDashboardPage() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: patientProfiles = [] } = useQuery({
    queryKey: ['patientProfiles'],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.PatientProfile.filter({ caregiver_email: user?.email });
    },
    enabled: !!user?.email
  });

  const dashboardOptions = [
    { id: 1, title: 'Dashboard Overview', icon: '📊', description: 'View patient status and key metrics', path: '/CaregiverPortal/patient-dashboard', background: '#EFF6FF' },
    { id: 2, title: 'Patient Status', icon: '👤', description: 'Monitor patient wellbeing in detail', path: '/PatientRegistration', background: '#FEF3C7' },
    { id: 3, title: 'Care Plans', icon: '📋', description: 'Create and manage care plans', path: '/CarePlans', background: '#DBEAFE' },
    { id: 4, title: 'Upcoming Tasks', icon: '⏰', description: 'View and assign tasks and reminders', path: '/ActivityReminders', background: '#FCD34D' },
    { id: 5, title: 'Care Team', icon: '👥', description: 'Manage caregiver team members', path: '/CareTeam', background: '#E0E7FF' },
    { id: 6, title: 'Journal Entries', icon: '📖', description: 'Review care journal and notes', path: '/CareJournalPage', background: '#F0FDFA' },
    { id: 7, title: 'Insights & Analytics', icon: '📊', description: 'View emotional trends and patterns', path: '/InsightsAnalytics', background: '#F0FDF4' },
    { id: 8, title: 'Emergency Alerts', icon: '🚨', description: 'Configure alert conditions', path: '/EmergencyAlerts', background: '#FEE2E2' },
    { id: 9, title: 'Activity Reports', icon: '📈', description: 'Generate care reports', path: '/ActivityReports', background: '#E0E7FF' },
    { id: 10, title: 'Care Settings', icon: '⚙️', description: 'Configure care preferences', path: '/CaregiverPortal/settings', background: '#F3F4F6' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 pb-16">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Caregiver Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Access all your caregiver tools and features
          </p>
        </div>

        {patientProfiles.length > 0 && (
          <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              Select Patient
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patientProfiles.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPatient === patient.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{patient.patient_name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{patient.diagnosis}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardOptions.map(option => (
            <button
              key={option.id}
              onClick={() => navigate(option.path)}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-left hover:scale-105"
              style={{ borderTop: `4px solid ${option.background}` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br from-blue-500 to-purple-500" />
              
              <div className="relative z-10">
                <div className="text-4xl mb-3">{option.icon}</div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {option.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {option.description}
                </p>
              </div>

              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}