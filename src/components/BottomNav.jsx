import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Phone, Shield, Moon, Music, Cloud, Star } from 'lucide-react';
import { createPageUrl } from '../utils';
import { useLanguage } from '@/components/i18n/LanguageContext';

export default function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();
  
  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      path: '/chat',
      icon: MessageCircle,
      label: t('chat'),
      color: 'text-blue-500'
    },
    {
      path: '/phone',
      icon: Phone,
      label: t('phone'),
      color: 'text-green-500'
    },
    {
      path: '/security',
      icon: Shield,
      label: t('security'),
      color: 'text-purple-500'
    },
    {
      path: createPageUrl('NightWatch'),
      icon: Moon,
      label: t('nightWatch'),
      color: 'text-indigo-500'
    },
    {
      path: createPageUrl('OfflineAudio'),
      icon: Music,
      label: t('offline'),
      color: 'text-orange-500'
    },
    {
      path: createPageUrl('SyncBackup'),
      icon: Cloud,
      label: t('sync'),
      color: 'text-cyan-500'
    },
    {
      path: createPageUrl('Feedback'),
      icon: Star,
      label: 'Feedback',
      color: 'text-yellow-500'
    }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 z-50 shadow-lg"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)'
      }}
    >
      <div className="flex justify-around items-center px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center gap-1.5 
                px-3 py-2 rounded-xl transition-all duration-200
                min-w-[68px] min-h-[64px]
                ${active 
                  ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-300 dark:border-blue-700' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }
              `}
            >
              <Icon 
                className={`w-7 h-7 ${active ? item.color : 'text-slate-500 dark:text-slate-400'}`} 
                strokeWidth={active ? 2.5 : 2}
              />
              <span 
                className={`text-[10px] font-bold uppercase tracking-wide ${
                  active ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}