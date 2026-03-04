import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import ErrorBoundary from '@/components/ErrorBoundary';

import CaregiverPortalCore from './CaregiverPortalCore';
import CaregiverPortalAdmin from './CaregiverPortalAdmin';
import OfflineReadyIndicator from '@/components/memory-mirror/OfflineReadyIndicator';
import OfflineJournalReader from '@/components/caregiver/OfflineJournalReader';
import OfflineMemoryViewer from '@/components/memory-mirror/OfflineMemoryViewer';
import AgentSupport from '@/components/caregiver/AgentSupport';

import FamilyTreeBuilder from '@/components/family/FamilyTreeBuilder';
import CaregiverTrialGate from '@/components/caregiver/CaregiverTrialGate';




const categories = [
  {
    label: 'Patient Care',
    items: [
      { id: 1, title: 'Health Monitor', icon: '❤️', path: '/HealthMonitor' },
      { id: 2, title: 'Memory Sessions', icon: '✨', path: '/MemorySessions' },
      { id: 13, title: 'Activity Reminders', icon: '⏰', path: '/ActivityReminders' },
    ]
  },
  {
    label: 'Monitoring & Reports',
    items: [
      { id: 3, title: 'Insights & Analytics', icon: '📊', path: '/InsightsAnalytics' },
      { id: 15, title: 'AI Care Insights', icon: '🤖', path: '/AICareInsights' },
      { id: 8, title: 'Night Watch Log', icon: '🌙', path: '/NightWatchPage' },
      { id: 24, title: 'Activity Reports', icon: '📋', path: '/ActivityReports' },
      { id: 5, title: 'Chat History', icon: '💬', path: '/ChatHistory' },
    ]
  },
  {
    label: 'Media & Memories',
    items: [
      { id: 33, title: 'Memory Library', icon: '💝', path: '/FamilyMemoryLibrary', isNew: true },
      { id: 4, title: 'Photo Library', icon: '📸', path: '/PhotoLibrary' },
      { id: 6, title: 'Music Player', icon: '🎵', path: '/MusicPlayer' },
      { id: 19, title: 'Content Library', icon: '📚', path: '/ContentLibrary' },
      { id: 18, title: 'Family Tree', icon: '🌳', path: '/FamilyTree' },
    ]
  },
  {
    label: 'Journals & Team',
    items: [
      { id: 7, title: 'Care Journal', icon: '📖', path: '/CareJournalPage' },
      { id: 28, title: 'Shared Journal', icon: '📔', path: '/SharedJournal' },
      { id: 27, title: 'Care Team', icon: '👥', path: '/CareTeam' },
      { id: 35, title: 'Carer Messaging', icon: '💬', path: '/CarerMessaging', isNew: true },
      { id: 29, title: 'Team Notifications', icon: '🔔', path: '/TeamNotifications' },
      { id: 34, title: 'Family Admin Portal', icon: '👨‍👩‍👧', path: '/FamilyAdminPortal', isNew: true },
    ]
  },
  {
    label: 'Settings & Safety',
    items: [
      { id: 31, title: 'User Profile', icon: '👤', path: '/UserProfile' },
      { id: 9, title: 'Voice Setup', icon: '🎤', path: '/VoiceSetup' },
      { id: 14, title: 'Voice Cloning', icon: '🔊', path: '/VoiceCloning' },
      { id: 32, title: 'Location Safety', icon: '📍', path: '/GeofenceTracking' },
      { id: 22, title: 'Emergency Alerts', icon: '🚨', path: '/EmergencyAlerts' },
      { id: 21, title: 'Fake Bank Settings', icon: '🏦', path: '/FakeBankSettings' },
    ]
  },
];

function CaregiverPortalHome() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    base44.auth.me().then(user => setIsAdmin(user?.role === 'admin')).catch(() => {});
  }, []);

  const handleCardClick = async (card) => {
    if (card.id === 12) {
      try {
        await base44.entities.ActivityLog.create({
          activity_type: 'anxiety_detected',
          details: { trigger: 'caregiver_activated_bad_day_mode', severity: 'medium' },
          anxiety_level: 6
        });
        const { toast } = await import('sonner');
        toast.success('💜 Bad Day Mode activated!');
      } catch {
        const { toast } = await import('sonner');
        toast.error('Failed to activate Bad Day Mode.');
      }
      return;
    }
    if (card.path) navigate(card.path);
  };

  const allCategories = isAdmin
    ? [...categories, { label: 'Admin', items: [{ id: 17, title: 'System Monitoring', icon: '🖥️', path: '/CaregiverPortal/monitoring' }, { id: 30, title: 'AI Agent Team', icon: '🤖', path: '/AIAgentTeam' }] }]
    : categories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px]">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Caregiver Portal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage care and monitor wellbeing</p>
        </div>
      </div>

      <OfflineReadyIndicator />

      {/* PIN reminder - compact */}
      <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm">
        <span>🔒</span>
        <p className="text-amber-800 dark:text-amber-300">Lock Mode PIN: <code className="font-mono font-bold">1234</code></p>
      </div>

      {/* Categorised sections */}
      {allCategories.map((cat) => (
        <div key={cat.label}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">{cat.label}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cat.items.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-left hover:shadow-md active:scale-95 transition-all duration-150"
              >
                {card.isNew && (
                  <span className="absolute top-2 right-2 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                )}
                <span className="text-2xl block mb-2">{card.icon}</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">{card.title}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CaregiverPortalRouter() {
  const navigate = useNavigate();
  const _location = useLocation();
  const [userProfile, setUserProfile] = React.useState(null);
  const [showOfflineOptions, setShowOfflineOptions] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [adminChecked, setAdminChecked] = React.useState(false);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) setUserProfile(profiles[0]);
      } catch (error) {
        console.error('Profile load failed:', error);
      }
    };
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.role === 'admin');
      } catch {}
      setAdminChecked(true);
    };
    loadProfile();
    checkAdmin();
  }, []);

  if (!adminChecked) return null;

  return (
    <CaregiverTrialGate isAdmin={isAdmin}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <Routes>
             <Route index element={<CaregiverPortalHome />} />
             <Route path="/*" element={<CaregiverPortalCore userProfile={userProfile} />} />
             <Route path="admin/*" element={
               <ErrorBoundary>
                 <CaregiverPortalAdmin />
               </ErrorBoundary>
             } />

            <Route path="family-tree" element={
              <ErrorBoundary>
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
                  <FamilyTreeBuilder onBack={() => navigate('/CaregiverPortal')} />
                </div>
              </ErrorBoundary>
            } />
            <Route path="offline-read" element={
              <ErrorBoundary>
                <div className="space-y-6">
                  <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 min-h-[44px]">
                    <ArrowLeft className="w-5 h-5" />Back to Portal
                  </button>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <button onClick={() => setShowOfflineOptions(false)} className={`p-6 rounded-xl font-semibold transition-all min-h-[44px] ${!showOfflineOptions ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}`}>
                        📖 Journal Entries
                      </button>
                      <button onClick={() => setShowOfflineOptions(true)} className={`p-6 rounded-xl font-semibold transition-all min-h-[44px] ${showOfflineOptions ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'}`}>
                        ✨ Memories
                      </button>
                    </div>
                    {!showOfflineOptions ? <OfflineJournalReader onBack={() => navigate('/CaregiverPortal')} /> : <OfflineMemoryViewer onBack={() => navigate('/CaregiverPortal')} />}
                  </div>
                </div>
              </ErrorBoundary>
            } />
          </Routes>
        </div>
        <AgentSupport />
      </div>
    </CaregiverTrialGate>
  );
}