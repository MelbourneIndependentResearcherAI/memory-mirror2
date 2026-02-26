import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import RegistrationModal from '@/components/RegistrationModal';

export default function EnhancedEmergencyButton() {
  const [clicked, setClicked] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has completed registration
  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
          setUserProfile(profiles?.[0] || null);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserProfile();
  }, []);

  const handleFirstClick = () => {
    // Check if user is registered before allowing emergency button use
    if (!userProfile) {
      setShowRegistration(true);
      return;
    }
    setClicked(true);
    setTimeout(() => setClicked(false), 3000);
  };

  const handleSecondClick = async () => {
    setConfirmed(true);

    try {
      // Log emergency alert
      await base44.entities.CaregiverAlert.create({
        alert_type: 'emergency_button',
        severity: 'critical',
        message: 'Patient pressed emergency button',
        requires_immediate_attention: true
      });

      // Get emergency contacts and call first one
      const contacts = await base44.entities.EmergencyContact.list('-priority', 10);
      
      if (contacts.length > 0 && contacts[0].phone_number) {
        window.location.href = `tel:${contacts[0].phone_number}`;
        toast.success(`Calling ${contacts[0].name}...`);
      } else {
        toast.error('No emergency contact configured');
      }
    } catch (error) {
      console.error('Emergency button error:', error);
      toast.error('Failed to send alert');
    }

    setTimeout(() => {
      setClicked(false);
      setConfirmed(false);
    }, 5000);
  };

  return (
    <div className="relative">
      <button
        onClick={clicked ? handleSecondClick : handleFirstClick}
        className={`w-full h-32 rounded-3xl flex flex-col items-center justify-center gap-2 text-white font-bold text-xl transition-all shadow-2xl ${
          confirmed
            ? 'bg-red-600 animate-pulse'
            : clicked
            ? 'bg-red-500 hover:bg-red-600 scale-105'
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        <Phone className="w-12 h-12" />
        <span>{clicked ? 'CONFIRM EMERGENCY' : 'EMERGENCY CALL'}</span>
      </button>
      {clicked && !confirmed && (
        <p className="text-center mt-3 text-sm font-semibold text-red-600 animate-pulse">
          ⚠️ Tap again to confirm and alert carer
        </p>
      )}
      {confirmed && (
        <p className="text-center mt-3 text-sm font-semibold text-green-600">
          ✓ Alert sent to carer
        </p>
      )}
    </div>
  );
}