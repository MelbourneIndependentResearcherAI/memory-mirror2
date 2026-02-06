import React from 'react';
import { AlertTriangle, Shield, Info, HeartPulse } from 'lucide-react';

const quickDialOptions = [
  { number: '911', name: 'Emergency', icon: AlertTriangle, color: 'bg-red-900/30 border-red-700 hover:bg-red-900/50' },
  { number: '999', name: 'Police', icon: Shield, color: 'bg-blue-900/30 border-blue-700 hover:bg-blue-900/50' },
  { number: '411', name: 'Info', icon: Info, color: 'bg-amber-900/30 border-amber-700 hover:bg-amber-900/50' },
  { number: '211', name: 'Support', icon: HeartPulse, color: 'bg-emerald-900/30 border-emerald-700 hover:bg-emerald-900/50' },
];

export default function QuickDial({ onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {quickDialOptions.map(({ number, name, icon: Icon, color }) => (
        <button
          key={number}
          onClick={() => onSelect(number, name)}
          className={`p-4 ${color} border-2 rounded-xl text-white transition-all`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-5 h-5" />
            <span className="font-semibold">{name}</span>
          </div>
          <span className="text-slate-400 text-sm">{number}</span>
        </button>
      ))}
    </div>
  );
}