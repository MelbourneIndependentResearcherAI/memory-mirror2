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
          const p = profiles[0];
          setUserName(p.greeting_name || p.preferred_name || p.loved_one_name || user.full_name);
        } else {
          setUserName(user.full_name || 'there');
        }
      } catch {
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
    } catch {
      console.log('Analytics not available');
    }

    // Navigate to main interface after brief delay
    setTimeout(() => {
      navigate(createPageUrl('Home'));
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-orange-500 dark:from-red-900 dark:via-red-800 dark:to-orange-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-orange-600/20 animate-gradient-slow" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Settings icon - Premium */}
      <button
        onClick={() => navigate(createPageUrl('CaregiverPortal'))}
        className="absolute top-6 right-6 w-14 h-14 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm border border-white/30 shadow-lg z-10"
      >
        <Settings className="w-7 h-7 text-white drop-shadow-lg" />
      </button>

      {/* Welcome text - Premium */}
      <div className="relative text-center mb-16 animate-fade-in-up z-10">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 tracking-tight" style={{
          textShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.2)'
        }}>
          Hello {userName}!
        </h1>
        <p className="text-2xl md:text-3xl lg:text-4xl text-white/95 font-semibold" style={{
          textShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          Press the button to start
        </p>
      </div>

      {/* THE BIG RED BUTTON - Premium Design */}
      <button
        onClick={handleBigButtonPress}
        onTouchStart={() => setPressing(true)}
        onTouchEnd={() => setPressing(false)}
        className={`
          relative z-10
          w-80 h-80 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem]
          rounded-full
          bg-gradient-to-br from-white via-red-50 to-white
          shadow-2xl
          transform transition-all duration-300
          ${pressing ? 'scale-90 shadow-xl' : 'scale-100 hover:scale-105'}
          border-[12px] border-red-700
          flex flex-col items-center justify-center
          gap-8
          select-none
          animate-fade-in-up animation-delay-100
          group
        `}
        style={{
          boxShadow: pressing 
            ? '0 15px 50px rgba(0,0,0,0.4), inset 0 0 40px rgba(220,38,38,0.3)'
            : '0 30px 80px rgba(0,0,0,0.5), 0 0 120px rgba(255,255,255,0.4), inset 0 -10px 30px rgba(220,38,38,0.1)'
        }}
      >
        {/* Pulsing ring effect */}
        <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping" style={{ animationDuration: '3s' }} />
        
        <MessageCircle className="w-36 h-36 md:w-48 md:h-48 text-red-600 drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" strokeWidth={3} />
        <div className="text-center">
          <div className="text-6xl md:text-7xl lg:text-8xl font-black text-red-600 leading-none mb-3 tracking-tighter" style={{
            textShadow: '0 4px 15px rgba(220,38,38,0.3)'
          }}>
            START
          </div>
          <div className="text-3xl md:text-4xl font-bold text-red-500">
            Memory Mirror
          </div>
        </div>
      </button>

      {/* Instruction text - Premium */}
      <div className="relative mt-16 text-center animate-fade-in-up animation-delay-200 z-10">
        <p className="text-2xl md:text-3xl lg:text-4xl text-white font-bold drop-shadow-2xl max-w-2xl leading-relaxed">
          Just press the big button anytime you want to talk to your companion
        </p>
      </div>

      {/* Enhanced Tip */}
      <div className="absolute bottom-8 text-center w-full px-4 z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 max-w-md mx-auto border border-white/20">
          <p className="text-base text-white font-medium drop-shadow-lg">
            💡 Tip: Ask your caregiver to add this page to your home screen for quick access
          </p>
        </div>
      </div>
    </div>
  );
}