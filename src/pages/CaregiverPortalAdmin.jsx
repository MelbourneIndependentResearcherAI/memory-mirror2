import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import MonitoringDashboard from '@/components/admin/MonitoringDashboard';
import AuditLogViewer from '@/components/admin/AuditLogViewer';
import AgentMonitor from '@/components/admin/AgentMonitor';
import OfflineContentTester from '@/components/caregiver/OfflineContentTester';

export default function CaregiverPortalAdmin() {
  const navigate = useNavigate();

  const adminRoutes = [
    { path: 'monitoring', title: 'System Monitoring', component: MonitoringDashboard },
    { path: 'audit-logs', title: 'Audit Trail', component: AuditLogViewer },
    { path: 'offline-test', title: 'Test Offline System', component: OfflineContentTester },
    { path: 'agents', title: 'AI Agent Team', component: AgentMonitor },
  ];

  return (
    <Routes>
      {adminRoutes.map(({ path, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={
            <ErrorBoundary>
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
                <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                  <ArrowLeft className="w-5 h-5" />
                  Back to Portal
                </button>
                <Component />
              </div>
            </ErrorBoundary>
          }
        />
      ))}
    </Routes>
  );
}