import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Info, Star } from 'lucide-react';

const defaultQuickDialOptions = [
  { number: '911', name: 'Emergency', icon: AlertTriangle, color: 'from-red-600 to-red-700 border-red-500' },
  { number: '999', name: 'Police', icon: Shield, color: 'from-blue-600 to-blue-700 border-blue-500' },
];

export default function QuickDial({ onSelect, customContacts = [] }) {
  const quickDialOptions = [
    ...customContacts.slice(0, 4).map(contact => ({
      number: contact.phone,
      name: contact.name,
      icon: contact.is_primary ? Star : Info,
      color: contact.is_primary 
        ? 'from-yellow-500 to-yellow-600 border-yellow-400' 
        : 'from-indigo-600 to-indigo-700 border-indigo-500',
      subtitle: contact.relationship
    })),
    ...defaultQuickDialOptions
  ].slice(0, 4);

  const handlePress = (number, name) => {
    if (navigator.vibrate) navigator.vibrate(15);
    onSelect(number, name);
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-8 px-6">
      {quickDialOptions.map(({ number, name, icon: Icon, color, subtitle }) => (
        <motion.button
          key={number}
          onClick={() => handlePress(number, name)}
          whileTap={{ scale: 0.95 }}
          className={`p-5 bg-gradient-to-br ${color} border-2 rounded-2xl text-white transition-all shadow-lg hover:shadow-xl min-h-[100px] flex flex-col justify-between`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-6 h-6" />
            <span className="font-bold text-lg">{name}</span>
          </div>
          {subtitle && <div className="text-white/80 text-xs font-medium mb-1">{subtitle}</div>}
          <span className="text-white/70 text-sm font-semibold">{number}</span>
        </motion.button>
      ))}
    </div>
  );
}