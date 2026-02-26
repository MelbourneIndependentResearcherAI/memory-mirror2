import React, { useState } from 'react';
import { Phone, MessageCircle, AlertCircle, Home, Volume2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PageLoadTip from '@/components/tips/PageLoadTip';

export default function BigButtonMode() {
  const navigate = useNavigate();
  const [calling, setCalling] = useState(false);

  const { data: contacts = [] } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: () => base44.entities.EmergencyContact.list(),
    initialData: []
  });

  const primaryContact = contacts.find(c => c.is_primary) || contacts[0];

  const handleEmergencyCall = async () => {
    setCalling(true);
    try {
      await base44.entities.ActivityLog.create({
        activity_type: 'emergency_call',
        details: { 
          trigger: 'big_button_mode',
          contact: primaryContact?.name || 'No contact set'
        }
      });
      
      // In real implementation, this would trigger actual call
      alert(`Calling ${primaryContact?.name || 'Emergency Contact'}: ${primaryContact?.phone || 'No number set'}\n\nNote: This is a demo. In production, this would make a real call.`);
    } catch (error) {
      console.error('Emergency call failed:', error);
    } finally {
      setTimeout(() => setCalling(false), 2000);
    }
  };

  const buttons = [
    {
      id: 'emergency',
      icon: AlertCircle,
      label: 'CALL FOR HELP',
      sublabel: primaryContact?.name || 'Emergency',
      color: 'from-red-500 to-red-600',
      action: handleEmergencyCall,
      size: 'extra-large'
    },
    {
      id: 'chat',
      icon: MessageCircle,
      label: 'TALK TO COMPANION',
      sublabel: 'Chat with AI friend',
      color: 'from-blue-500 to-blue-600',
      action: () => navigate(createPageUrl('Home'))
    },
    {
      id: 'phone',
      icon: Phone,
      label: 'PHONE',
      sublabel: 'Make a call',
      color: 'from-green-500 to-green-600',
      action: () => navigate(createPageUrl('PhoneMode'))
    },
    {
      id: 'voice',
      icon: Volume2,
      label: 'VOICE MODE',
      sublabel: 'Talk hands-free',
      color: 'from-purple-500 to-purple-600',
      action: () => navigate(createPageUrl('VoiceSetup'))
    },
    {
      id: 'family',
      icon: Users,
      label: 'FAMILY',
      sublabel: 'See family messages',
      color: 'from-pink-500 to-pink-600',
      action: () => navigate(createPageUrl('FamilyConnect'))
    },
    {
      id: 'home',
      icon: Home,
      label: 'HOME',
      sublabel: 'Go to main menu',
      color: 'from-slate-500 to-slate-600',
      action: () => navigate(createPageUrl('Home'))
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
            Easy Access
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Tap any button below
          </p>
        </div>

        {/* Emergency Button - Featured */}
        <div className="mb-8">
          <button
            onClick={buttons[0].action}
            disabled={calling}
            className={`w-full bg-gradient-to-r ${buttons[0].color} rounded-3xl shadow-2xl hover:shadow-3xl active:scale-95 transition-all duration-200 p-12 text-white border-8 border-white dark:border-slate-800`}
            style={{ minHeight: '300px' }}
          >
            <div className="flex flex-col items-center justify-center gap-6">
              <AlertCircle className="w-32 h-32 animate-pulse" />
              <div className="text-center">
                <div className="text-6xl font-bold mb-3">
                  {calling ? 'CALLING...' : 'CALL FOR HELP'}
                </div>
                <div className="text-3xl opacity-90">
                  {buttons[0].sublabel}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Other Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {buttons.slice(1).map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.id}
                onClick={button.action}
                className={`bg-gradient-to-r ${button.color} rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 p-10 text-white border-4 border-white dark:border-slate-800`}
                style={{ minHeight: '200px' }}
              >
                <div className="flex flex-col items-center justify-center gap-4">
                  <Icon className="w-20 h-20" />
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {button.label}
                    </div>
                    <div className="text-xl opacity-90">
                      {button.sublabel}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-8 py-4 rounded-2xl shadow-lg">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            <p className="text-xl text-slate-700 dark:text-slate-300">
              Press the red button anytime for help
            </p>
          </div>
        </div>
      </div>

      <PageLoadTip pageName="BigButtonMode" />
    </div>
  );
}