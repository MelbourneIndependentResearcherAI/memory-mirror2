import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Radio, Music, Smartphone } from 'lucide-react';

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
    <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Communication Era
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {eras.map((era) => {
          const Icon = era.icon;
          const isSelected = selectedEra === era.id;
          return (
            <motion.button
              key={era.id}
              onClick={() => onEraChange(era.id)}
              whileTap={{ scale: 0.95 }}
              className={`
                relative overflow-hidden rounded-xl p-3 h-20
                transition-all duration-300 border-2 flex flex-col items-center justify-center gap-1
                ${isSelected 
                  ? `bg-gradient-to-br ${era.color} text-white border-transparent shadow-lg` 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'
                }
              `}
            >
              <Icon className={`w-7 h-7 ${isSelected ? 'animate-pulse' : ''}`} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wide">{era.label}</span>
              {isSelected && (
                <motion.div
                  layoutId="selected-era"
                  className="absolute inset-0 border-3 border-white/50 rounded-xl"
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