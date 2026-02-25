import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import CareJournal from '../components/caregiver/CareJournal';
import UserProfileSetup from '../components/caregiver/UserProfileSetup';
import MediaLibrary from '../components/caregiver/MediaLibrary';
import PlaylistManager from '../components/music/PlaylistManager';
import MemorySessionLauncher from '../components/memory/MemorySessionLauncher';
import InsightsDashboard from '../components/caregiver/InsightsDashboard';
import NightWatchLog from '../components/caregiver/NightWatchLog';
import AlwaysOnVoice from '../components/memory-mirror/AlwaysOnVoice';
import SmartDeviceManager from '../components/smartHome/SmartDeviceManager';
import SmartHomeRoutineBuilder from '../components/smartHome/SmartHomeRoutineBuilder';
import MoodAutomationConfig from '../components/smartHome/MoodAutomationConfig';
import ReminderManager from '../components/caregiver/ReminderManager';
import VoiceCloningManager from '../components/caregiver/VoiceCloningManager';
import AICareInsights from '../components/caregiver/AICareInsights';
import OfflineReadyIndicator from '@/components/memory-mirror/OfflineReadyIndicator';
import OfflineJournalReader from '@/components/caregiver/OfflineJournalReader';
import OfflineMemoryViewer from '@/components/memory-mirror/OfflineMemoryViewer';
import AgentSupport from '@/components/caregiver/AgentSupport';
import MonitoringDashboard from '@/components/admin/MonitoringDashboard';
import FamilyTreeBuilder from '@/components/family/FamilyTreeBuilder';
import ContentUploader from '@/components/caregiver/ContentUploader';
import AuditLogViewer from '@/components/admin/AuditLogViewer';
import BankSettingsManager from '@/components/caregiver/BankSettingsManager';
import EmergencyAlertSystem from '@/components/caregiver/EmergencyAlertSystem';
import PatientRegistration from '@/components/caregiver/PatientRegistration';
import CaregiverReports from '@/components/caregiver/CaregiverReports';
import OfflineContentManager from '@/components/caregiver/OfflineContentManager';
import OfflineContentTester from '@/components/caregiver/OfflineContentTester';
import CaregiverTeamManager from '@/components/caregiver/CaregiverTeamManager';
import CaregiverNotificationCenter from '@/components/caregiver/CaregiverNotificationCenter';
import SharedJournal from '@/components/caregiver/SharedJournal';
import AgentMonitor from '@/components/admin/AgentMonitor';
import ChatHistoryViewer from '@/components/caregiver/ChatHistoryViewer';

const featureCards = [
  { id: 1, title: 'Health Monitor', icon: '❤️', description: 'View current emotional state and anxiety levels', path: '/HealthMonitor', background: '#FFF5F5' },
  { id: 2, title: 'Memory Sessions', icon: '✨', description: 'AI-guided interactive memory experiences', path: '/MemorySessions', background: '#FFFBEB' },
  { id: 3, title: 'Insights & Analytics', icon: '📊', description: 'Emotional trends and cognitive patterns', path: '/InsightsAnalytics', background: '#EFF6FF' },
  { id: 4, title: 'Photo Library', icon: '📸', description: 'Upload and organize memory photos', path: '/PhotoLibrary', background: '#FAF5FF' },
  { id: 5, title: 'Chat History', icon: '💬', description: 'Review conversations and key moments', path: '/CaregiverPortal/chat-history', background: '#F0FDF4' },
  { id: 6, title: 'Music Player', icon: '🎵', description: 'Era-specific songs and playlists', path: '/MusicPlayer', background: '#FFF7ED' },
  { id: 7, title: 'Care Journal', icon: '📖', description: 'Document observations and changes', path: '/CareJournalPage', background: '#F0FDFA' },
  { id: 8, title: 'Night Watch Log', icon: '🌙', description: 'Review nighttime incidents and patterns', path: '/NightWatchPage', background: '#1E1B4B' },
  { id: 9, title: 'Voice Setup', icon: '🎤', description: 'Configure always-on wake word detection', path: '/VoiceSetup', background: '#EFF6FF' },
  { id: 10, title: 'Smart Home', icon: '🏠', description: 'Manage smart devices and automations', path: '/SmartHome', background: '#F0F9FF' },
  { id: 11, title: 'Mood Automations', icon: '🧠', description: 'Configure mood-based smart home adjustments', path: '/MoodAutomations', background: '#F5EFFF' },
  { id: 12, title: 'Activate Bad Day Mode', icon: '💜', description: 'Remotely activate calming mode for your loved one', path: null, background: '#FDF2F8' },
  { id: 13, title: 'Activity Reminders', icon: '⏰', description: 'Set up gentle reminders for daily activities', path: '/ActivityReminders', background: '#FFFBEB' },
  { id: 14, title: 'Voice Cloning', icon: '🎤', description: 'Clone family voices for personalized comfort', path: '/VoiceCloning', background: '#FDF4FF' },
  { id: 15, title: 'AI Care Insights', icon: '✨', description: 'Personalized recommendations from intelligent analysis', path: '/AICareInsights', background: '#FAF5FF' },
  { id: 16, title: 'Read Offline', icon: '📖', description: 'Access journals and memories without internet', path: '/CaregiverPortal/offline-read', background: '#F0FDFA' },
  { id: 17, title: 'System Monitoring', icon: '🤖', description: '24/7 AI-powered health monitoring & auto-maintenance', path: '/CaregiverPortal/monitoring', background: '#EFF6FF' },
  { id: 18, title: 'Family Tree', icon: '🌳', description: 'Build a visual family tree with photos and memories', path: '/FamilyTree', background: '#FEF3C7' },
  { id: 19, title: 'Content Library', icon: '📚', description: 'Upload personalized stories, music, photos & activities', path: '/ContentLibrary', background: '#F3E8FF' },
  { id: 20, title: 'Audit Trail', icon: '🔍', description: 'View complete compliance audit logs (HIPAA/GDPR)', path: '/AuditTrail', background: '#DBEAFE' },
  { id: 21, title: 'Fake Bank Settings', icon: '🏦', description: 'Configure fake bank account balances for patient reassurance', path: '/FakeBankSettings', background: '#E0F2FE' },
  { id: 22, title: 'Emergency Alerts', icon: '🚨', description: 'Configure emergency contacts and automated alert conditions', path: '/EmergencyAlerts', background: '#FEE2E2' },
  { id: 23, title: 'Patient Registration', icon: '📋', description: 'Register patients and track their email addresses & usage', path: '/PatientRegistration', background: '#DBEAFE' },
  { id: 24, title: 'Activity Reports', icon: '📊', description: 'Generate daily/weekly/monthly summaries with mood trends & events', path: '/ActivityReports', background: '#E0E7FF' },
  { id: 25, title: 'Offline Content', icon: '💾', description: 'Manage offline storage, sync priorities, and device content', path: '/OfflineContent', background: '#DBEAFE' },
  { id: 26, title: 'Test Offline System', icon: '🧪', description: 'Run diagnostics to verify offline functionality', path: '/OfflineTest', background: '#F0FDF4' },
  { id: 27, title: 'Care Team', icon: '👥', description: 'Manage caregivers and collaboration', path: '/CareTeam', background: '#EFF6FF' },
  { id: 28, title: 'Shared Journal', icon: '📔', description: 'Collaborative care notes and observations', path: '/SharedJournal', background: '#F0F9FF' },
  { id: 29, title: 'Team Notifications', icon: '🔔', description: 'Alerts and updates for care team', path: '/TeamNotifications', background: '#FEF3C7' },
  { id: 30, title: 'AI Agent Team', icon: '🤖', description: 'Autonomous maintenance and monitoring agents', path: '/AIAgentTeam', background: '#F0FDF4' }
];

function CaregiverPortalHome() {
  const navigate = useNavigate();
  const [badDayActivated, setBadDayActivated] = React.useState(false);

  const handleCardClick = async (card) => {
    if (card.id === 12) {
      setBadDayActivated(true);
      try {
        await base44.entities.ActivityLog.create({
          activity_type: 'anxiety_detected',
          details: { trigger: 'caregiver_activated_bad_day_mode', severity: 'medium' },
          anxiety_level: 6
        });
        alert('Bad Day Mode activated remotely. Your loved one will receive gentle comfort and support.');
      } catch (error) {
        console.error('Failed to activate:', error);
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
        {featureCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            className="text-left p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer min-h-[160px] flex flex-col items-start"
            style={{
              backgroundColor: card.background,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
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
  const location = useLocation();
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
          <Route path="journal" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <CareJournal onBack={() => navigate('/CaregiverPortal')} />
            </div>
          } />
          <Route path="profile" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <UserProfileSetup onBack={() => navigate('/CaregiverPortal')} />
            </div>
          } />
          <Route path="media" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <MediaLibrary onBack={() => navigate('/CaregiverPortal')} />
            </div>
          } />
          <Route path="playlists" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <PlaylistManager onBack={() => navigate('/CaregiverPortal')} />
            </div>
          } />
          <Route path="memory-session" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <MemorySessionLauncher onBack={() => navigate('/CaregiverPortal')} />
            </div>
          } />
          <Route path="insights" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <InsightsDashboard onBack={() => navigate('/CaregiverPortal')} />
            </div>
          } />
          <Route path="nightwatch" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <NightWatchLog onBack={() => navigate('/CaregiverPortal')} />
            </div>
          } />
          <Route path="voice-setup" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <AlwaysOnVoice userProfile={userProfile} onClose={() => navigate('/CaregiverPortal')} />
            </div>
          } />
          <Route path="smart-home" element={
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
                <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                  <ArrowLeft className="w-5 h-5" />Back to Portal
                </button>
                <SmartDeviceManager />
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
                <SmartHomeRoutineBuilder />
              </div>
            </div>
          } />
          <Route path="mood-automations" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <MoodAutomationConfig />
            </div>
          } />
          <Route path="reminders" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <ReminderManager onBack={() => navigate('/CaregiverPortal')} />
            </div>
          } />
          <Route path="voice-cloning" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <VoiceCloningManager />
            </div>
          } />
          <Route path="ai-insights" element={
            <div>
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <AICareInsights />
            </div>
          } />
          <Route path="monitoring" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <MonitoringDashboard />
            </div>
          } />
          <Route path="family-tree" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <FamilyTreeBuilder onBack={() => navigate('/CaregiverPortal')} />
            </div>
          } />
          <Route path="offline-read" element={
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
          } />
          <Route path="content" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <ContentUploader />
            </div>
          } />
          <Route path="audit-logs" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <AuditLogViewer />
            </div>
          } />
          <Route path="bank-settings" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <BankSettingsManager onBack={() => navigate('/CaregiverPortal')} />
            </div>
          } />
          <Route path="emergency-alerts" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <EmergencyAlertSystem />
            </div>
          } />
          <Route path="patient-registration" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <PatientRegistration />
            </div>
          } />
          <Route path="reports" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <CaregiverReports />
            </div>
          } />
          <Route path="offline-content" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <OfflineContentManager onBack={() => navigate('/CaregiverPortal')} />
            </div>
          } />
          <Route path="offline-test" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <OfflineContentTester />
            </div>
          } />
          <Route path="care-team" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <CaregiverTeamManager patientProfileId={userProfile?.id} />
            </div>
          } />
          <Route path="shared-journal" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <SharedJournal patientProfileId={userProfile?.id} />
            </div>
          } />
          <Route path="notifications" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <CaregiverNotificationCenter patientProfileId={userProfile?.id} />
            </div>
          } />
          <Route path="agents" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <AgentMonitor />
            </div>
          } />
          <Route path="chat-history" element={
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />Back to Portal
              </button>
              <ChatHistoryViewer />
            </div>
          } />
        </Routes>
      </div>
      <AgentSupport />
    </div>
  );
}