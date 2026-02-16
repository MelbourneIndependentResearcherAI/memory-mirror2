import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CareJournal from '../components/caregiver/CareJournal';

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
    title: 'Smart Alerts',
    icon: '🔔',
    description: 'Get notified of distress or unusual patterns',
    background: '#FFFBEB',
    darkBackground: '#4A3C1D'
  },
  {
    id: 3,
    title: 'Daily Routine',
    icon: '📅',
    description: 'Manage schedules and medication reminders',
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
    title: 'Family Portal',
    icon: '👥',
    description: 'Invite family members and share access',
    background: '#EEF2FF',
    darkBackground: '#252D4A'
  }
];

export default function CaregiverPortal() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('home');

  const handleCardClick = (cardId) => {
    if (cardId === 7) {
      setActiveView('journal');
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
      </div>
    </div>
  );
}