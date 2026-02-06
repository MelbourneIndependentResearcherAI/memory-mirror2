import React from 'react';
import { AlertTriangle, Shield, Info, HeartPulse, Star } from 'lucide-react';

const defaultQuickDialOptions = [
  { number: '911', name: 'Emergency', icon: AlertTriangle, color: 'bg-red-900/30 border-red-700 hover:bg-red-900/50' },
  { number: '999', name: 'Police', icon: Shield, color: 'bg-blue-900/30 border-blue-700 hover:bg-blue-900/50' },
];

export default function QuickDial({ onSelect, customContacts = [] }) {
  const quickDialOptions = [
    ...customContacts.slice(0, 4).map(contact => ({
      number: contact.phone,
      name: contact.name,
      icon: contact.is_primary ? Star : Info,
      color: contact.is_primary 
        ? 'bg-yellow-900/30 border-yellow-700 hover:bg-yellow-900/50' 
        : 'bg-indigo-900/30 border-indigo-700 hover:bg-indigo-900/50',
      subtitle: contact.relationship
    })),
    ...defaultQuickDialOptions
  ].slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {quickDialOptions.map(({ number, name, icon: Icon, color, subtitle }) => (
        <button
          key={number}
          onClick={() => onSelect(number, name)}
          className={`p-4 ${color} border-2 rounded-xl text-white transition-all`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-5 h-5" />
            <span className="font-semibold">{name}</span>
          </div>
          {subtitle && <div className="text-slate-300 text-xs mb-1">{subtitle}</div>}
          <span className="text-slate-400 text-sm">{number}</span>
        </button>
      ))}
    </div>
  );
}