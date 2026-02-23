import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageCircle, Lock, Mic, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientAccess() {
  const [accessMode, setAccessMode] = useState(null);
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: patients = [] } = useQuery({
    queryKey: ['patientProfiles'],
    queryFn: () => base44.entities.PatientProfile.list(),
  });

  // Handle QR code access
  useEffect(() => {
    const qrKey = searchParams.get('qr');
    if (qrKey) {
      const patient = patients.find(p => p.qr_code_access_key === qrKey);
      if (patient) {
        sessionStorage.setItem('patientSession', JSON.stringify({
          type: 'qr',
          patientId: patient.id,
          patientName: patient.patient_name,
          startedAt: new Date().toISOString()
        }));
        toast.success(`Welcome ${patient.patient_name}!`);
        setTimeout(() => navigate(createPageUrl('ChatMode')), 1000);
      } else {
        toast.error('Invalid access code');
      }
    }
  }, [searchParams, patients, navigate]);

  const handleDirectAccess = () => {
    sessionStorage.setItem('patientSession', JSON.stringify({
      type: 'anonymous',
      startedAt: new Date().toISOString()
    }));
    
    // Log anonymous access
    base44.entities.ActivityLog.create({
      activity_type: 'anonymous_access',
      details: { access_method: 'quick_start' }
    }).catch(() => {});
    
    toast.success('Welcome! Starting your AI companion...');
    setTimeout(() => {
      navigate(createPageUrl('ChatMode'));
    }, 1000);
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin.length === 4) {
      // Verify PIN against patient profiles
      const matchingPatient = patients.find(p => p.access_pin === pin);
      
      sessionStorage.setItem('patientSession', JSON.stringify({
        type: 'pin',
        pin: pin,
        patientId: matchingPatient?.id,
        patientName: matchingPatient?.patient_name,
        startedAt: new Date().toISOString()
      }));
      
      toast.success(matchingPatient ? `Welcome ${matchingPatient.patient_name}!` : 'PIN verified!');
      setTimeout(() => {
        navigate(createPageUrl('ChatMode'));
      }, 1000);
    } else {
      toast.error('Please enter a 4-digit PIN');
    }
  };

  const handleVoiceIdentification = async () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      if (name) {
        // Find patient by voice name
        const matchingPatient = patients.find(p => 
          p.voice_name?.toLowerCase() === name.toLowerCase()
        );
        
        sessionStorage.setItem('patientSession', JSON.stringify({
          type: 'voice',
          name: name,
          patientId: matchingPatient?.id,
          patientName: matchingPatient?.patient_name || name,
          startedAt: new Date().toISOString()
        }));
        
        toast.success(`Welcome ${matchingPatient?.patient_name || name}! Starting your companion...`);
        setTimeout(() => {
          navigate(createPageUrl('ChatMode'));
        }, 1000);
      }
    }, 2000);
  };

  if (!accessMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 p-6 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Welcome to Memory Mirror
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Choose how you'd like to start
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Direct Access */}
            <button
              onClick={handleDirectAccess}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 text-left"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Quick Start
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Start immediately, no setup needed
                  </p>
                </div>
              </div>
            </button>

            {/* PIN Access */}
            <button
              onClick={() => setAccessMode('pin')}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 text-left"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl group-hover:scale-110 transition-transform">
                  <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    PIN Access
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Enter your 4-digit PIN
                  </p>
                </div>
              </div>
            </button>

            {/* Voice Access */}
            <button
              onClick={() => setAccessMode('voice')}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-green-200 dark:border-green-800 hover:border-green-400 text-left"
            >
              <div className="flex flex-col items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl group-hover:scale-110 transition-transform">
                  <Mic className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Voice ID
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Tell us your name
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate(createPageUrl('Landing'))}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (accessMode === 'pin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Lock className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <CardTitle className="text-3xl">Enter Your PIN</CardTitle>
            <CardDescription>Enter the 4-digit PIN set by your caregiver</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="text-center text-3xl tracking-widest font-bold h-16"
                autoFocus
              />
              <Button type="submit" className="w-full h-14 text-lg" disabled={pin.length !== 4}>
                Start Companion
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAccessMode(null)}
                className="w-full"
              >
                Choose different method
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accessMode === 'voice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-green-950 dark:to-teal-950 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${isListening ? 'bg-green-600 animate-pulse' : 'bg-green-100 dark:bg-green-900'}`}>
                <Mic className={`w-12 h-12 ${isListening ? 'text-white' : 'text-green-600 dark:text-green-400'}`} />
              </div>
            </div>
            <CardTitle className="text-3xl">Voice Identification</CardTitle>
            <CardDescription>
              {isListening ? 'Listening...' : 'Type your name or click the microphone'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="text-center text-xl h-14"
              autoFocus
            />
            <Button
              onClick={handleVoiceIdentification}
              className="w-full h-14 text-lg"
              disabled={!name || isListening}
            >
              {isListening ? 'Identifying...' : 'Continue'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAccessMode(null)}
              className="w-full"
              disabled={isListening}
            >
              Choose different method
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}