import React, { useState } from 'react';
import { MessageCircle, Music, Gamepad2, Map, Moon, Home, Settings, LogOut, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FakeBankInterface from '@/components/banking/FakeBankInterface';

export default function BigButtonMode() {
  const navigate = useNavigate();
  const [showBank, setShowBank] = useState(false);

  const buttons = [
    { icon: MessageCircle, label: 'AI Chat', color: 'from-blue-500 to-cyan-500', page: 'Home' },
    { icon: Music, label: 'Music', color: 'from-purple-500 to-pink-500', page: 'MusicTherapy' },
    { icon: Gamepad2, label: 'Games', color: 'from-orange-500 to-red-500', page: 'MemoryGames' },
    { icon: Map, label: 'GPS Safety', color: 'from-green-500 to-emerald-500', page: 'GeofenceTracking' },
    { icon: Moon, label: 'Night Watch', color: 'from-slate-600 to-indigo-700', page: 'NightWatch' },
    { icon: CreditCard, label: 'Banking', color: 'from-blue-600 to-indigo-600', page: 'MyBank' },
    { icon: Home, label: 'Home', color: 'from-yellow-500 to-orange-500', page: 'Home' },
  ];

  const handleNavigation = (page) => {
    navigate(createPageUrl(page));
  };

  if (showBank) {
    return <FakeBankInterface onClose={() => setShowBank(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-blue-950 dark:to-teal-950 p-6 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-4">
            Big Button Mode
          </h1>
          <p className="text-2xl text-slate-600 dark:text-slate-300">
            Easy access to everything
          </p>
        </div>

        {/* Giant Buttons Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {buttons.map((btn) => {
            const Icon = btn.icon;
            return (
              <motion.button
                key={btn.label}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation(btn.page)}
                className={`bg-gradient-to-br ${btn.color} hover:shadow-2xl transition-all duration-300 text-white rounded-3xl shadow-xl border-8 border-white/30 flex flex-col items-center justify-center gap-4 p-8 min-h-[200px]`}
              >
                <Icon className="w-16 h-16 drop-shadow-lg" />
                <span className="text-3xl font-bold text-center">{btn.label}</span>
              </motion.button>
            );
          })}

          {/* Banking Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBank(true)}
            className="bg-gradient-to-br from-blue-700 to-indigo-800 hover:shadow-2xl transition-all duration-300 text-white rounded-3xl shadow-xl border-8 border-white/30 flex flex-col items-center justify-center gap-4 p-8 min-h-[200px]"
          >
            <CreditCard className="w-16 h-16 drop-shadow-lg" />
            <span className="text-3xl font-bold text-center">My Bank</span>
          </motion.button>
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(createPageUrl('Settings'))}
            className="bg-gradient-to-br from-slate-600 to-slate-700 hover:shadow-lg text-white rounded-2xl shadow-lg border-4 border-white/20 flex flex-col items-center justify-center gap-2 p-6 min-h-[120px]"
          >
            <Settings className="w-10 h-10" />
            <span className="text-xl font-bold">Settings</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(createPageUrl('QuickAccess'))}
            className="bg-gradient-to-br from-red-500 to-red-600 hover:shadow-lg text-white rounded-2xl shadow-lg border-4 border-white/20 flex flex-col items-center justify-center gap-2 p-6 min-h-[120px]"
          >
            <span className="text-4xl">🔴</span>
            <span className="text-xl font-bold">Quick</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}