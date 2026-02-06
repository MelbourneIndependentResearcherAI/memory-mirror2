import React from 'react';
import { MessageCircle, Phone, Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const modes = [
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function ModeHeader({ currentMode, onModeChange, detectedEra }) {
  const getEraLabel = () => {
    const labels = {
      '1940s': '1940s Era',
      '1960s': '1960s Era',
      '1980s': '1980s Era',
      'present': 'Present Day'
    };
    return labels[detectedEra] || 'Present Day';
  };

  return (
    <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-6 rounded-t-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1"></div>
        <Link to={createPageUrl('CaregiverPortal')}>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Settings className="w-4 h-4 mr-2" />
            Caregiver Portal
          </Button>
        </Link>
      </div>
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {modes.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={currentMode === id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onModeChange(id)}
            className={`
              flex items-center gap-2 transition-all duration-300
              ${currentMode === id 
                ? 'bg-white/30 text-white border-white/50' 
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'}
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>
      
      <div className="text-center">
        <h1 className="text-3xl font-light tracking-wide mb-2">Memory Mirror</h1>
        <p className="text-white/80 italic text-sm">Your companion, meeting you where you are</p>
        
        {currentMode === 'chat' && (
          <div className="mt-3 inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm">
            {getEraLabel()}
          </div>
        )}
      </div>
    </div>
  );
}