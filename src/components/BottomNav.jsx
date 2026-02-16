import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Phone, Shield, Moon, Music } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function BottomNav() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      path: '/chat',
      icon: MessageCircle,
      label: 'Chat',
      color: 'text-blue-500'
    },
    {
      path: '/phone',
      icon: Phone,
      label: 'Phone',
      color: 'text-green-500'
    },
    {
      path: '/security',
      icon: Shield,
      label: 'Security',
      color: 'text-purple-500'
    },
    {
      path: createPageUrl('NightWatch'),
      icon: Moon,
      label: 'Night Watch',
      color: 'text-indigo-500'
    },
    {
      path: createPageUrl('OfflineAudio'),
      icon: Music,
      label: 'Offline',
      color: 'text-orange-500'
    }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t-2 border-slate-700 z-50"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.4)'
      }}
    >
      <div className="flex justify-around items-center px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center gap-1 
                px-4 py-2 rounded-xl transition-all duration-200
                min-w-[72px] min-h-[60px]
                ${active 
                  ? 'bg-slate-800 scale-105' 
                  : 'hover:bg-slate-800/50'
                }
              `}
            >
              <Icon 
                className={`w-6 h-6 ${active ? item.color : 'text-slate-400'}`} 
                strokeWidth={active ? 2.5 : 2}
              />
              <span 
                className={`text-xs font-medium ${
                  active ? 'text-white' : 'text-slate-400'
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