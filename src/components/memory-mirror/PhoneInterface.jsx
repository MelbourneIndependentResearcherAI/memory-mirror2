import React, { useState } from 'react';
import { Phone, X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DialPad from './DialPad';
import QuickDial from './QuickDial';
import HandsFreeCallScreen from './HandsFreeCallScreen';

export default function PhoneInterface() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [isInCall, setIsInCall] = useState(false);

  const { data: contacts = [] } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: async () => {
      try {
        return await base44.entities.EmergencyContact.list();
      } catch (error) {
        console.error('Error loading contacts:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const formatPhoneNumber = (number) => {
    if (!number) return '';
    if (number.length <= 3) return number;
    if (number.length <= 6) return `${number.slice(0,3)}-${number.slice(3)}`;
    return `${number.slice(0,3)}-${number.slice(3,6)}-${number.slice(6)}`;
  };

  const detectContact = (number) => {
    const contacts = {
      '911': '🚨 Emergency Services',
      '999': '👮 Police Department',
      '411': 'ℹ️ Information',
      '211': '🏥 Support Services'
    };
    return contacts[number] || '';
  };

  const handleDialPress = (digit) => {
    if (phoneNumber.length < 15) {
      const newNumber = phoneNumber + digit;
      setPhoneNumber(newNumber);
      setContactName(detectContact(newNumber));
    }
  };

  const handleQuickDial = (number, name) => {
    setPhoneNumber(number);
    setContactName(name);
  };

  const handleClear = () => {
    setPhoneNumber('');
    setContactName('');
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const handleCall = () => {
    if (phoneNumber.length >= 3) {
      if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
      setIsInCall(true);
      
      // Log phone call activity
      base44.entities.ActivityLog.create({
        activity_type: 'phone_call',
        details: { number: phoneNumber, contact: contactName }
      }).catch(() => {});
    }
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setPhoneNumber('');
    setContactName('');
  };

  if (isInCall) {
    return (
      <HandsFreeCallScreen
        phoneNumber={formatPhoneNumber(phoneNumber)}
        contactName={contactName || 'Unknown'}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 dark:from-black dark:via-slate-950 dark:to-black min-h-screen pb-32">
      <div className="p-6">
        <Alert className="mb-6 bg-amber-900/20 border-amber-600/50 text-amber-200 backdrop-blur-sm">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-sm">
            <strong>Caregiver Note:</strong> Safe phone redirects to AI support
          </AlertDescription>
        </Alert>

        <div className="bg-slate-800/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-2xl p-6 mb-8 text-center border border-slate-700/50">
          <div className="text-white text-5xl font-light tracking-wider mb-3 h-16 flex items-center justify-center">
            {phoneNumber ? formatPhoneNumber(phoneNumber) : <span className="text-slate-600 dark:text-slate-700 text-3xl">Enter Number</span>}
          </div>
          {contactName && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-400 text-lg font-medium"
            >
              {contactName}
            </motion.div>
          )}
        </div>

        <QuickDial onSelect={handleQuickDial} customContacts={contacts} />

        <div className="mb-8">
          <DialPad onPress={handleDialPress} />
        </div>

        <div className="flex justify-center gap-6 max-w-sm mx-auto px-6 mb-12">
          <motion.button
            onClick={handleCall}
            disabled={phoneNumber.length < 3}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-800 shadow-2xl disabled:opacity-50 transition-all flex items-center justify-center border-4 border-emerald-400/30 disabled:border-slate-600/30"
          >
            <Phone className="w-8 h-8 text-white" />
          </motion.button>
          <motion.button
            onClick={handleClear}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl transition-all flex items-center justify-center border-4 border-red-400/30"
          >
            <X className="w-8 h-8 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}