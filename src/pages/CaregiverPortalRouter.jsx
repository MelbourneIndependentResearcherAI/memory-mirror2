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




const adminOnlyCards = [
  { id: 17, title: 'System Monitoring', icon: '🤖', description: '24/7 AI-powered health monitoring & auto-maintenance', path: '/CaregiverPortal/monitoring', background: '#EFF6FF', adminOnly: true },
];

const regularCards = [
  { id: 31, title: 'User Profile', icon: '👤', description: 'View and edit the personalization profile for your loved one', path: '/UserProfile', background: '#F0F9FF' },
  { id: 33, title: 'Family Memory Library', icon: '💝', description: 'Share memories, photos, audio & collaborate with family', path: '/FamilyMemoryLibrary', background: '#FCE7F3', isNew: true },
  { id: 1, title: 'Health Monitor', icon: '❤️', description: 'View current emotional state and anxiety levels', path: '/HealthMonitor', background: '#FFF5F5' },
  { id: 2, title: 'Memory Sessions', icon: '✨', description: 'AI-guided interactive memory experiences', path: '/MemorySessions', background: '#FFFBEB' },
  { id: 3, title: 'Insights & Analytics', icon: '📊', description: 'Emotional trends and cognitive patterns', path: '/InsightsAnalytics', background: '#EFF6FF' },
  { id: 4, title: 'Photo Library', icon: '📸', description: 'Upload and organize memory photos', path: '/PhotoLibrary', background: '#FAF5FF' },
  { id: 5, title: 'Chat History', icon: '💬', description: 'Review conversations and key moments', path: '/ChatHistory', background: '#F0FDF4' },
  { id: 6, title: 'Music Player', icon: '🎵', description: 'Era-specific songs and playlists', path: '/MusicPlayer', background: '#FFF7ED' },
  { id: 7, title: 'Care Journal', icon: '📖', description: 'Document observations and changes', path: '/CareJournalPage', background: '#F0FDFA' },
  { id: 8, title: 'Night Watch Log', icon: '🌙', description: 'Review nighttime incidents and patterns', path: '/NightWatchPage', background: '#1E1B4B' },
  { id: 9, title: 'Voice Setup', icon: '🎤', description: 'Configure always-on wake word detection', path: '/VoiceSetup', background: '#EFF6FF' },
  { id: 12, title: 'Activate Bad Day Mode', icon: '💜', description: 'Remotely activate calming mode for your loved one', path: null, background: '#FDF2F8' },
  { id: 13, title: 'Activity Reminders', icon: '⏰', description: 'Set up gentle reminders for daily activities', path: '/ActivityReminders', background: '#FFFBEB' },
  { id: 14, title: 'Voice Cloning', icon: '🎤', description: 'Clone family voices for personalized comfort', path: '/VoiceCloning', background: '#FDF4FF' },
  { id: 15, title: 'AI Care Insights', icon: '✨', description: 'Personalized recommendations from intelligent analysis', path: '/AICareInsights', background: '#FAF5FF' },
  { id: 18, title: 'Family Tree', icon: '🌳', description: 'Build a visual family tree with photos and memories', path: '/FamilyTree', background: '#FEF3C7' },
  { id: 19, title: 'Content Library', icon: '📚', description: 'Upload personalized stories, music, photos & activities', path: '/ContentLibrary', background: '#F3E8FF' },
  { id: 21, title: 'Fake Bank Settings', icon: '🏦', description: 'Configure fake bank account balances for patient reassurance', path: '/FakeBankSettings', background: '#E0F2FE' },
  { id: 32, title: 'Location Safety', icon: '📍', description: 'Set up safe zones and track patient location in real-time', path: '/GeofenceTracking', background: '#D1FAE5' },
  { id: 22, title: 'Emergency Alerts', icon: '🚨', description: 'Configure emergency contacts and automated alert conditions', path: '/EmergencyAlerts', background: '#FEE2E2' },
  { id: 24, title: 'Activity Reports', icon: '📊', description: 'Generate daily/weekly/monthly summaries with mood trends & events', path: '/ActivityReports', background: '#E0E7FF' },
  { id: 27, title: 'Care Team', icon: '👥', description: 'Manage caregivers and collaboration', path: '/CareTeam', background: '#EFF6FF' },
  { id: 28, title: 'Shared Journal', icon: '📔', description: 'Collaborative care notes and observations', path: '/SharedJournal', background: '#F0F9FF' },
  { id: 29, title: 'Team Notifications', icon: '🔔', description: 'Alerts and updates for care team', path: '/TeamNotifications', background: '#FEF3C7' },
  { id: 30, title: 'AI Agent Team', icon: '🤖', description: 'Autonomous maintenance and monitoring agents', path: '/AIAgentTeam', background: '#F0FDF4' },
];

const getFeatureCards = (admin) => admin ? [...regularCards, ...adminOnlyCards] : regularCards;

function CaregiverPortalHome() {
  const navigate = useNavigate();
  const [_badDayActivated, setBadDayActivated] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.role === 'admin');
      } catch (error) {
        console.error('Failed to check admin status:', error);
      }
    };
    checkAdmin();
  }, []);

  const handleCardClick = async (card) => {
    if (card.id === 12) {
      setBadDayActivated(true);
      try {
        await base44.entities.ActivityLog.create({
          activity_type: 'anxiety_detected',
          details: { trigger: 'caregiver_activated_bad_day_mode', severity: 'medium' },
          anxiety_level: 6
        });
        // Use toast instead of alert for better UX
        const { toast } = await import('sonner');
        toast.success('💜 Bad Day Mode activated! Your loved one will receive gentle comfort and support.');
      } catch (error) {
        console.error('Failed to activate:', error);
        const { toast } = await import('sonner');
        toast.error('Failed to activate Bad Day Mode. Please try again.');
      }
      setTimeout(() => setBadDayActivated(false), 3000);
      return;
    }
    
    if (card.path) {
      navigate(card.path);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="min-h-[44px] min-w-[44px] hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
              Caregiver Portal
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage care, monitor wellbeing, and access insights
            </p>
          </div>
        </div>
        
        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-2">
                Lock Mode Feature - Keep Patients Safe
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-400 mb-3">
                You can lock Phone Mode or Security Mode to prevent patients from exiting these screens.
              </p>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Default PIN:</span>
                  <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-blue-600 dark:text-blue-400 font-mono">1234</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OfflineReadyIndicator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {getFeatureCards(isAdmin).map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            className="text-left p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer min-h-[160px] flex flex-col items-start relative"
            style={{
              backgroundColor: card.background,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            {card.isNew && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                NEW
              </div>
            )}
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-3" style={{ color: '#1e293b' }}>
              {card.title}
            </h3>
            <p className="text-base font-medium text-slate-700" style={{ color: '#475569' }}>
              {card.description}
            </p>
          </button>
        ))}
      </div>
    </>
  );
}

export default function CaregiverPortalRouter() {
  const navigate = useNavigate();
  const _location = useLocation();
  const [userProfile, setUserProfile] = React.useState(null);
  const [showOfflineOptions, setShowOfflineOptions] = React.useState(false);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) setUserProfile(profiles[0]);
      } catch (error) {
        console.error('Profile load failed:', error);
      }
    };
    loadProfile();
  }, []);

  return (
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
  );
}