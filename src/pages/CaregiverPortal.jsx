import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const featureCards = [
  {
    id: 1,
    title: 'Health Monitor',
    icon: '❤️',
    description: 'View current emotional state and anxiety levels',
    background: '#FFF5F5',
    darkBackground: '#4A1D1D'
  },
  {
    id: 2,
    title: 'Memory Sessions',
    icon: '✨',
    description: 'AI-guided interactive memory experiences',
    background: '#FFFBEB',
    darkBackground: '#4A3C1D'
  },
  {
    id: 3,
    title: 'Insights & Analytics',
    icon: '📊',
    description: 'Emotional trends and cognitive patterns',
    background: '#EFF6FF',
    darkBackground: '#1E293B'
  },
  {
    id: 4,
    title: 'Photo Library',
    icon: '📸',
    description: 'Upload and organize memory photos',
    background: '#FAF5FF',
    darkBackground: '#3B1F4A'
  },
  {
    id: 5,
    title: 'Chat History',
    icon: '💬',
    description: 'Review conversations and key moments',
    background: '#F0FDF4',
    darkBackground: '#1E4A2D'
  },
  {
    id: 6,
    title: 'Music Player',
    icon: '🎵',
    description: 'Era-specific songs and playlists',
    background: '#FFF7ED',
    darkBackground: '#4A2D1D'
  },
  {
    id: 7,
    title: 'Care Journal',
    icon: '📖',
    description: 'Document observations and changes',
    background: '#F0FDFA',
    darkBackground: '#1D4A4A'
  },
  {
    id: 8,
    title: 'Night Watch Log',
    icon: '🌙',
    description: 'Review nighttime incidents and patterns',
    background: '#1E1B4B',
    darkBackground: '#1E1B4B'
  },
  {
    id: 9,
    title: 'Voice Setup',
    icon: '🎤',
    description: 'Configure always-on wake word detection',
    background: '#EFF6FF',
    darkBackground: '#1E3A8A'
  },
  {
    id: 10,
    title: 'Smart Home',
    icon: '🏠',
    description: 'Manage smart devices and automations',
    background: '#F0F9FF',
    darkBackground: '#1A3D5C'
  },
  {
    id: 11,
    title: 'Mood Automations',
    icon: '🧠',
    description: 'Configure mood-based smart home adjustments',
    background: '#F5EFFF',
    darkBackground: '#3A2A4A'
  },
  {
    id: 12,
    title: 'Activate Bad Day Mode',
    icon: '💜',
    description: 'Remotely activate calming mode for your loved one',
    background: '#FDF2F8',
    darkBackground: '#4A1D3B'
  },
  {
    id: 13,
    title: 'Activity Reminders',
    icon: '⏰',
    description: 'Set up gentle reminders for daily activities',
    background: '#FFFBEB',
    darkBackground: '#4A3C1D'
  }
];

export default function CaregiverPortal() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('home');
  const [badDayActivated, setBadDayActivated] = React.useState(false);

  const [userProfile, setUserProfile] = React.useState(null);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) {
          setUserProfile(profiles[0]);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  const handleCardClick = async (cardId) => {
    if (cardId === 12) {
      // Activate Bad Day Mode remotely
      setBadDayActivated(true);
      
      // Create alert log
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
    
    const viewMap = {
      1: 'profile',        // Health Monitor -> Profile Setup
      2: 'memory-session', // Memory Sessions
      3: 'insights',       // Insights & Analytics
      4: 'media',          // Photo Library -> Media Library
      6: 'playlists',      // Music Player -> Playlist Manager
      7: 'journal',        // Care Journal
      8: 'nightwatch',     // Night Watch Log
      9: 'voice-setup',    // Voice Setup
      10: 'smart-home',    // Smart Home
      11: 'mood-automations', // Mood-Based Automations
      13: 'reminders'      // Activity Reminders
    };
    
    if (viewMap[cardId]) {
      setActiveView(viewMap[cardId]);
    } else {
      alert(`${featureCards.find(c => c.id === cardId)?.title} - Coming soon!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 pb-16">
      <div className="max-w-7xl mx-auto">
        {activeView === 'home' && (
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featureCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className="text-left p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer min-h-[160px] flex flex-col items-start"
                  style={{
                    backgroundColor: card.background,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  <div className="text-4xl mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {card.description}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}

        {activeView === 'journal' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <CareJournal onBack={() => setActiveView('home')} />
          </div>
        )}

        {activeView === 'profile' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <UserProfileSetup onBack={() => setActiveView('home')} />
          </div>
        )}

        {activeView === 'media' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <MediaLibrary onBack={() => setActiveView('home')} />
          </div>
        )}

        {activeView === 'playlists' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <PlaylistManager onBack={() => setActiveView('home')} />
          </div>
        )}

        {activeView === 'memory-session' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <MemorySessionLauncher onBack={() => setActiveView('home')} />
          </div>
        )}

        {activeView === 'insights' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <InsightsDashboard onBack={() => setActiveView('home')} />
          </div>
        )}

        {activeView === 'nightwatch' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <NightWatchLog onBack={() => setActiveView('home')} />
          </div>
        )}

        {activeView === 'voice-setup' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <AlwaysOnVoice 
              userProfile={userProfile}
              onClose={() => setActiveView('home')}
            />
          </div>
        )}

        {activeView === 'smart-home' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <button
                onClick={() => setActiveView('home')}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Portal
              </button>
              <SmartDeviceManager />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
              <SmartHomeRoutineBuilder />
            </div>
          </div>
        )}

        {activeView === 'mood-automations' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Portal
            </button>
            <MoodAutomationConfig />
          </div>
        )}

        {activeView === 'reminders' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
            <ReminderManager onBack={() => setActiveView('home')} />
          </div>
        )}
      </div>
    </div>
  );
}