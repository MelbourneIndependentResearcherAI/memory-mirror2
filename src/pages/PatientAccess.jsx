import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, User, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function PatientAccess() {
  const navigate = useNavigate();
  const [accessMode, setAccessMode] = useState(null); // 'pin', 'voice', or 'instant'
  const [pin, setPin] = useState('');
  const [voiceName, setVoiceName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: patientProfiles = [] } = useQuery({
    queryKey: ['patientProfiles'],
    queryFn: () => base44.entities.PatientProfile.list()
  });

  const handleInstantAccess = async () => {
    // Track session
    try {
      await base44.functions.invoke('trackPatientSession', {
        access_method: 'instant',
        patient_name: 'Guest User'
      });
    } catch (error) {
      console.log('Session tracking skipped:', error.message);
    }
    
    navigate('/ChatMode');
  };

  const handlePinAccess = async () => {
    if (!pin || pin.length !== 4) {
      toast.error('Please enter a 4-digit PIN');
      return;
    }

    setIsVerifying(true);
    
    // Find patient with matching PIN
    const patient = patientProfiles.find(p => p.access_pin === pin);
    
    if (patient) {
      try {
        await base44.entities.PatientProfile.update(patient.id, {
          last_active: new Date().toISOString(),
          session_count: (patient.session_count || 0) + 1
        });
        
        await base44.functions.invoke('trackPatientSession', {
          access_method: 'pin',
          patient_name: patient.patient_name,
          patient_id: patient.id
        });
      } catch (error) {
        console.log('Session update skipped:', error.message);
      }
      
      toast.success(`Welcome back, ${patient.patient_name}!`);
      navigate('/ChatMode');
    } else {
      toast.error('Invalid PIN. Try again or use Instant Access.');
    }
    
    setIsVerifying(false);
  };

  const handleVoiceAccess = async () => {
    if (!voiceName.trim()) {
      toast.error('Please say your name');
      return;
    }

    setIsVerifying(true);
    
    // Find patient with matching voice name
    const patient = patientProfiles.find(
      p => p.voice_name?.toLowerCase() === voiceName.toLowerCase()
    );
    
    if (patient) {
      try {
        await base44.entities.PatientProfile.update(patient.id, {
          last_active: new Date().toISOString(),
          session_count: (patient.session_count || 0) + 1
        });
        
        await base44.functions.invoke('trackPatientSession', {
          access_method: 'voice',
          patient_name: patient.patient_name,
          patient_id: patient.id
        });
      } catch (error) {
        console.log('Session update skipped:', error.message);
      }
      
      toast.success(`Hello ${patient.patient_name}!`);
      navigate('/ChatMode');
    } else {
      toast.error('Name not recognized. Try Instant Access.');
    }
    
    setIsVerifying(false);
  };

  if (!accessMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950 dark:via-cyan-950 dark:to-sky-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mb-6 min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Welcome
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              How would you like to access Memory Mirror?
            </p>
          </div>

          <div className="space-y-4">
            <Card 
              onClick={handleInstantAccess}
              className="cursor-pointer hover:shadow-xl transition-all hover:scale-102 border-2 hover:border-blue-400"
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      Instant Access
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      Start chatting immediately - no login required
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {patientProfiles.some(p => p.access_pin) && (
              <Card 
                onClick={() => setAccessMode('pin')}
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-102 border-2 hover:border-purple-400"
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Lock className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        PIN Access
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">
                        Enter your personal 4-digit PIN
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {patientProfiles.some(p => p.voice_name) && (
              <Card 
                onClick={() => setAccessMode('voice')}
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-102 border-2 hover:border-green-400"
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Mic className="w-7 h-7 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Voice Access
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">
                        Say your name to get started
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (accessMode === 'pin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950 dark:via-pink-950 dark:to-purple-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAccessMode(null)}
              className="mb-4 min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <CardTitle className="text-3xl text-center">Enter Your PIN</CardTitle>
            <CardDescription className="text-center">
              Type your 4-digit personal PIN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="text-center text-3xl tracking-widest h-16"
              placeholder="••••"
              autoFocus
            />
            <Button
              onClick={handlePinAccess}
              disabled={isVerifying || pin.length !== 4}
              className="w-full h-14 text-lg"
            >
              {isVerifying ? 'Verifying...' : 'Access Memory Mirror'}
            </Button>
            <Button
              onClick={handleInstantAccess}
              variant="outline"
              className="w-full h-12"
            >
              Use Instant Access Instead
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accessMode === 'voice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAccessMode(null)}
              className="mb-4 min-h-[44px] min-w-[44px]"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <CardTitle className="text-3xl text-center">What's Your Name?</CardTitle>
            <CardDescription className="text-center">
              Say or type your name to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value)}
              className="text-center text-2xl h-16"
              placeholder="Your name..."
              autoFocus
            />
            <Button
              onClick={handleVoiceAccess}
              disabled={isVerifying || !voiceName.trim()}
              className="w-full h-14 text-lg"
            >
              {isVerifying ? 'Checking...' : 'Continue'}
            </Button>
            <Button
              onClick={handleInstantAccess}
              variant="outline"
              className="w-full h-12"
            >
              Use Instant Access Instead
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}