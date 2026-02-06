import React, { useState } from 'react';
import { Phone, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DialPad from './DialPad';
import QuickDial from './QuickDial';
import CallScreen from './CallScreen';

export default function PhoneInterface() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [isInCall, setIsInCall] = useState(false);

  const { data: contacts = [] } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: () => base44.entities.EmergencyContact.list(),
  });

  const formatPhoneNumber = (number) => {
    if (!number) return '_';
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
  };

  const handleCall = () => {
    if (phoneNumber.length >= 3) {
      setIsInCall(true);
    }
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setPhoneNumber('');
    setContactName('');
  };

  if (isInCall) {
    return (
      <CallScreen
        phoneNumber={formatPhoneNumber(phoneNumber)}
        contactName={contactName || 'Unknown'}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <div className="bg-slate-900 min-h-[500px] p-6">
      <Alert className="mb-4 bg-amber-900/30 border-amber-600 text-amber-200">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>Caregiver Note:</strong> Safe phone redirects to AI support
        </AlertDescription>
      </Alert>

      <div className="bg-slate-800 rounded-2xl p-4 mb-6 text-center">
        <div className="text-white text-3xl font-mono tracking-widest mb-2">
          {formatPhoneNumber(phoneNumber)}
        </div>
        {contactName && (
          <div className="text-emerald-400 text-lg">{contactName}</div>
        )}
      </div>

      <QuickDial onSelect={handleQuickDial} customContacts={contacts} />

      <DialPad onPress={handleDialPress} />

      <div className="flex justify-center gap-6 mt-6">
        <Button
          onClick={handleCall}
          disabled={phoneNumber.length < 3}
          className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg disabled:opacity-50"
        >
          <Phone className="w-6 h-6" />
        </Button>
        <Button
          onClick={handleClear}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}