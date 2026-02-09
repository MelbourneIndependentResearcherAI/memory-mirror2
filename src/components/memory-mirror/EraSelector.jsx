import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Radio, Music, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const eras = [
  { 
    id: '1940s', 
    label: '1940s', 
    icon: Radio, 
    color: 'from-amber-500 to-orange-600',
    description: 'Post-war era, big band music'
  },
  { 
    id: '1960s', 
    label: '1960s', 
    icon: Music, 
    color: 'from-orange-500 to-pink-600',
    description: 'Rock & roll, cultural revolution'
  },
  { 
    id: '1980s', 
    label: '1980s', 
    icon: Radio, 
    color: 'from-purple-500 to-pink-600',
    description: 'Pop music, neon colors'
  },
  { 
    id: 'present', 
    label: 'Present', 
    icon: Smartphone, 
    color: 'from-blue-500 to-cyan-600',
    description: 'Current day'
  },
  {
    id: 'auto',
    label: 'Auto-Detect',
    icon: Clock,
    color: 'from-emerald-500 to-teal-600',
    description: 'AI adapts to mental state'
  }
];

export default function EraSelector({ selectedEra, onEraChange }) {
  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-b border-blue-200 dark:border-blue-800">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Communication Era
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {eras.map((era) => {
          const Icon = era.icon;
          const isSelected = selectedEra === era.id;
          return (
            <motion.button
              key={era.id}
              onClick={() => onEraChange(era.id)}
              whileTap={{ scale: 0.95 }}
              className={`
                relative overflow-hidden rounded-xl p-3 min-h-[80px]
                transition-all duration-300 border-2
                ${isSelected 
                  ? `bg-gradient-to-br ${era.color} text-white border-white shadow-lg` 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }
              `}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <Icon className={`w-5 h-5 ${isSelected ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-semibold">{era.label}</span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[10px] opacity-90"
                  >
                    {era.description}
                  </motion.div>
                )}
              </div>
              {isSelected && (
                <motion.div
                  layoutId="selected-era"
                  className="absolute inset-0 border-2 border-white rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}