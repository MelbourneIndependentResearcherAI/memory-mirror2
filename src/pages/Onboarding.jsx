import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome';
import OnboardingRole from '@/components/onboarding/OnboardingRole';
import OnboardingPreferences from '@/components/onboarding/OnboardingPreferences';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import OnboardingComplete from '@/components/onboarding/OnboardingComplete';

const STEPS = ['welcome', 'role', 'preferences', 'tour', 'complete'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState({
    role: '',           // 'patient_family', 'caregiver', 'care_professional'
    lovedOneName: '',
    era: '',
    interests: [],
    communicationStyle: 'warm',
    primaryConcern: '',
  });

  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user) { navigate('/'); return; }
      // If onboarding already done, redirect
      if (user.onboarding_complete) { navigate(createPageUrl('Home')); return; }
      setCurrentUser(user);
    }).catch(() => navigate('/'));
  }, [navigate]);

  const updateData = (updates) => setData(prev => ({ ...prev, ...updates }));

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const finish = async () => {
    // Save preferences to user profile and mark onboarding done
    await base44.auth.updateMe({ onboarding_complete: true, onboarding_role: data.role });
    // Save loved one profile if they provided info
    if (data.lovedOneName) {
      await base44.entities.UserProfile.create({
        loved_one_name: data.lovedOneName,
        favorite_era: data.era || 'present',
        interests: data.interests,
        communication_style: data.communicationStyle,
      });
    }
    navigate(createPageUrl('Home'));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const stepComponents = [
    <OnboardingWelcome key="welcome" user={currentUser} onNext={next} />,
    <OnboardingRole key="role" data={data} onUpdate={updateData} onNext={next} onBack={back} />,
    <OnboardingPreferences key="prefs" data={data} onUpdate={updateData} onNext={next} onBack={back} />,
    <OnboardingTour key="tour" data={data} onNext={next} onBack={back} />,
    <OnboardingComplete key="complete" data={data} user={currentUser} onFinish={finish} onBack={back} />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-200">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex justify-center gap-2 pt-6">
        {STEPS.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= step ? 'bg-blue-500 w-6' : 'bg-slate-300'}`} />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {stepComponents[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}