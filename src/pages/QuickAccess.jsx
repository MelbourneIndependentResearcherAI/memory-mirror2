import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Settings } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

/**
 * Quick Access Page - Inspired by "Be My Eyes" app
 * Single BIG RED BUTTON for easy access by dementia patients
 * Addresses difficulty finding apps and answering phone
 */
export default function QuickAccess() {
  const navigate = useNavigate();
  const [pressing, setPressing] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user name from profile
    const loadUserName = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) {
          setUserName(profiles[0].preferred_name || profiles[0].loved_one_name || user.full_name);
        } else {
          setUserName(user.full_name || 'there');
        }
      } catch (error) {
        setUserName('there');
      }
    };
    loadUserName();
  }, []);

  const handleBigButtonPress = () => {
    setPressing(true);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Log access
    try {
      base44.analytics.track({
        eventName: 'quick_access_button_pressed',
        properties: { success: true }
      });
    } catch (error) {
      console.log('Analytics not available');
    }

    // Navigate to main interface after brief delay
    setTimeout(() => {
      navigate(createPageUrl('Home'));
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-orange-500 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Settings icon - small and subtle */}
      <button
        onClick={() => navigate(createPageUrl('CaregiverPortal'))}
        className="absolute top-6 right-6 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
      >
        <Settings className="w-6 h-6 text-white" />
      </button>

      {/* Welcome text */}
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
          Hello {userName}!
        </h1>
        <p className="text-2xl md:text-3xl text-white/90 drop-shadow-lg">
          Press the button to start
        </p>
      </div>

      {/* THE BIG RED BUTTON */}
      <button
        onClick={handleBigButtonPress}
        onTouchStart={() => setPressing(true)}
        onTouchEnd={() => setPressing(false)}
        className={`
          relative
          w-80 h-80 md:w-96 md:h-96
          rounded-full
          bg-white
          shadow-2xl
          transform transition-all duration-200
          ${pressing ? 'scale-95 shadow-xl' : 'scale-100 hover:scale-105 shadow-3xl'}
          border-8 border-red-700
          flex flex-col items-center justify-center
          gap-6
          select-none
          animate-fade-in-up animation-delay-100
        `}
        style={{
          boxShadow: pressing 
            ? '0 10px 40px rgba(0,0,0,0.3), inset 0 0 30px rgba(220,38,38,0.2)'
            : '0 20px 60px rgba(0,0,0,0.4), 0 0 100px rgba(255,255,255,0.3)'
        }}
      >
        <MessageCircle className="w-32 h-32 md:w-40 md:h-40 text-red-600" strokeWidth={2.5} />
        <div className="text-center">
          <div className="text-5xl md:text-6xl font-black text-red-600 leading-none mb-2">
            START
          </div>
          <div className="text-2xl md:text-3xl font-bold text-red-500">
            Memory Mirror
          </div>
        </div>
      </button>

      {/* Instruction text */}
      <div className="mt-12 text-center animate-fade-in-up animation-delay-200">
        <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg max-w-md">
          Just press the big button anytime you want to talk to your companion
        </p>
      </div>

      {/* Subtle hint about accessing this screen */}
      <div className="absolute bottom-6 text-center w-full px-4">
        <p className="text-sm text-white/70">
          💡 Tip: Ask your caregiver to add this page to your home screen for quick access
        </p>
      </div>
    </div>
  );
}