import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
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

export default function CaregiverPortalCore({ userProfile }) {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="journal" element={
        <ErrorBoundary>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <CareJournal onBack={() => navigate('/CaregiverPortal')} />
          </div>
        </ErrorBoundary>
      } />
      <Route path="profile" element={
        <ErrorBoundary>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <UserProfileSetup onBack={() => navigate('/CaregiverPortal')} />
          </div>
        </ErrorBoundary>
      } />
      <Route path="media" element={
        <ErrorBoundary>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <MediaLibrary onBack={() => navigate('/CaregiverPortal')} />
          </div>
        </ErrorBoundary>
      } />
      <Route path="playlists" element={
        <ErrorBoundary>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <PlaylistManager onBack={() => navigate('/CaregiverPortal')} />
          </div>
        </ErrorBoundary>
      } />
      <Route path="memory-session" element={
        <ErrorBoundary>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <MemorySessionLauncher onBack={() => navigate('/CaregiverPortal')} />
          </div>
        </ErrorBoundary>
      } />
      <Route path="insights" element={
        <ErrorBoundary>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <InsightsDashboard onBack={() => navigate('/CaregiverPortal')} />
          </div>
        </ErrorBoundary>
      } />
      <Route path="nightwatch" element={
        <ErrorBoundary>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <NightWatchLog onBack={() => navigate('/CaregiverPortal')} />
          </div>
        </ErrorBoundary>
      } />
      <Route path="voice-setup" element={
        <ErrorBoundary>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <AlwaysOnVoice userProfile={userProfile} onClose={() => navigate('/CaregiverPortal')} />
          </div>
        </ErrorBoundary>
      } />
      <Route path="smart-home" element={
        <ErrorBoundary>
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
        </ErrorBoundary>
      } />
      <Route path="mood-automations" element={
        <ErrorBoundary>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
              <ArrowLeft className="w-5 h-5" />Back to Portal
            </button>
            <MoodAutomationConfig />
          </div>
        </ErrorBoundary>
      } />
      <Route path="reminders" element={
        <ErrorBoundary>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <ReminderManager onBack={() => navigate('/CaregiverPortal')} />
          </div>
        </ErrorBoundary>
      } />
      <Route path="voice-cloning" element={
        <ErrorBoundary>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
              <ArrowLeft className="w-5 h-5" />Back to Portal
            </button>
            <VoiceCloningManager />
          </div>
        </ErrorBoundary>
      } />
      <Route path="ai-insights" element={
        <ErrorBoundary>
          <div>
            <button onClick={() => navigate('/CaregiverPortal')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]">
              <ArrowLeft className="w-5 h-5" />Back to Portal
            </button>
            <AICareInsights />
          </div>
        </ErrorBoundary>
      } />
    </Routes>
  );
}