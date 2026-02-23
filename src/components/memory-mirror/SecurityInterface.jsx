import React, { useState } from 'react';
import { Shield, Search, Lock, Lightbulb, MessageCircle, AlertTriangle, Loader2, BookHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import CameraView from './CameraView';
import SecurityLog from './SecurityLog';
import AnxietyAlert from './AnxietyAlert';
import PullToRefresh from '@/components/ui/pull-to-refresh';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { speakWithRealisticVoice, detectAnxiety } from './voiceUtils';
import { isOnline, getOfflineResponse, cacheOfflineResponse } from '../utils/offlineManager';

  const getSecurityPrompt = () => {
    const safeZoneContext = safeZones.length > 0 
      ? `\n\nSAFE TOPICS TO REDIRECT TO:\n${safeZones.map(z => `- ${z.title}: ${z.description}`).join('\n')}`
      : '';
    
    return `You're a professional security guard monitoring this person's home. They have dementia and may be experiencing paranoia about break-ins or theft. Your role:

1. Be professional and reassuring - like a real security guard
2. Report that all systems are secure and you're actively monitoring
3. If they report concerns (noises, people, missing items), take them seriously but reassure:
   - "I've checked all entry points - everything is secure"
   - "I've reviewed the camera footage - no unauthorized persons detected"
   - "Your valuables are all accounted for in the secure log"
   - "I'm watching the cameras in real-time - you're completely safe"
4. Use security terminology to sound authentic
5. Offer to do "additional patrols" or "enhanced monitoring"
6. Remind them family/caregivers have been notified you're on duty
7. If they're scared of the dark, mention lights and sensors${safeZoneContext}

After responses, output META: {"realThreat": true/false, "anxiety": 0-10, "concern": "..."}`;
  };

const initialLogs = [
  { time: '12:45 PM', message: 'All doors checked and secured', status: 'all_clear' },
  { time: '12:30 PM', message: 'Perimeter scan complete - No threats', status: 'all_clear' },
  { time: '12:15 PM', message: 'Window sensors all reporting normal', status: 'all_clear' },
  { time: '12:00 PM', message: 'Security system self-test passed', status: 'all_clear' },
];

const cameras = [
  { label: 'Front Door', status: 'No motion' },
  { label: 'Back Door', status: 'Locked' },
  { label: 'Windows', status: 'All closed' },
  { label: 'Perimeter', status: 'Clear' },
];

export default function SecurityInterface({ onModeSwitch, onMemoryGalleryOpen }) {
  const [logs, setLogs] = useState(initialLogs);
  const [isLoading, setIsLoading] = useState(false);
  const [securityHistory, setSecurityHistory] = useState([]);
  const [anxietyState, setAnxietyState] = useState({ level: 0, suggestedMode: null });
  const [showAnxietyAlert, setShowAnxietyAlert] = useState(false);
  const queryClient = useQueryClient();

  const { data: safeZones = [] } = useQuery({
    queryKey: ['safeZones'],
    queryFn: () => base44.entities.SafeMemoryZone.list(),
  });

  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ['safeZones'] });
    return new Promise(resolve => setTimeout(resolve, 500));
  };

  const addLog = (message, status = 'all_clear') => {
    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setLogs(prev => [{ time, message, status }, ...prev.slice(0, 7)]);
  };

  const speakResponse = (text) => {
    speakWithRealisticVoice(text, {
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0
    });
  };

  const runSecurityCheck = async () => {
    setIsLoading(true);
    addLog('Running comprehensive security check...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const message = 'Full security check complete - All 4 doors locked, all 12 windows secure, no motion detected, perimeter clear';
    addLog(message);
    speakResponse('Security check complete. All doors are locked. All windows are secure. No motion detected anywhere. Your home is completely safe.');
    setIsLoading(false);
  };

  const lockAllDoors = () => {
    addLog('All doors verified locked and bolted');
    speakResponse('All doors are now locked and secured. Front door, back door, and garage door are all locked and bolted.');
  };

  const lightCheck = () => {
    addLog('Exterior lights activated, motion sensors armed');
    speakResponse('All exterior lights are on. Motion sensors are active around the entire property. Any movement will be immediately detected.');
  };

  const talkToSecurity = async () => {
    const concern = prompt('What would you like to report to security?');
    if (!concern) return;

    // Track patient session
    const sessionData = sessionStorage.getItem('patientSession');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.patientId) {
          base44.functions.invoke('trackPatientSession', {
            patient_id: session.patientId,
            session_type: 'security_interaction'
          }).catch(() => {});
        }
      } catch {}
    }

    // Detect anxiety in security concern
    const anxietyDetection = detectAnxiety(concern);

    setIsLoading(true);
    setSecurityHistory(prev => [...prev, { role: 'user', content: concern }]);

    try {
      let message;
      
      if (isOnline()) {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `${getSecurityPrompt()}\n\nIMPORTANT: User anxiety detected at level ${anxietyDetection.level}. ${anxietyDetection.trigger ? `Concern about: "${anxietyDetection.trigger}".` : ''} Be extra reassuring.\n\nConversation:\n${securityHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\nuser: ${concern}\n\nRespond as the security guard with maximum reassurance.`,
        });

        message = typeof response === 'string' && response.includes('META:')
          ? response.split('META:')[0].trim()
          : response;
          
        // Cache response for offline use
        await cacheOfflineResponse(concern, message).catch(() => {});
      } else {
        // Use offline response
        const offlineResponse = await getOfflineResponse(concern);
        message = offlineResponse.text;
      }

      // Parse anxiety from META
      if (typeof response === 'string' && response.includes('META:')) {
        try {
          const meta = JSON.parse(response.split('META:')[1].trim());
          const anxiety = meta.anxiety || 0;
          setAnxietyState({ level: anxiety, suggestedMode: anxiety >= 8 ? 'phone' : null });
          if (anxiety >= 6) {
            setShowAnxietyAlert(true);
          }
        } catch (e) {
          // Ignore
        }
      }

      alert('Security Guard: ' + message);
      speakResponse(message);
      setSecurityHistory(prev => [...prev, { role: 'assistant', content: message }]);
      addLog('Security guard responded to concern - All clear');

      // Show anxiety alert if high anxiety detected
      if (anxietyDetection.level >= 7) {
        setAnxietyState({ level: anxietyDetection.level, suggestedMode: 'phone' });
        setShowAnxietyAlert(true);
      }

    } catch (error) {
      const fallback = "I've checked everything thoroughly. All systems show secure. No threats detected. You're safe.";
      alert('Security Guard: ' + fallback);
      speakResponse(fallback);
    }

    setIsLoading(false);
  };

  const contactFamily = () => {
    alert("Calling your family member now...\n\nIn a real deployment, this would immediately call or text the designated caregiver/family member.");
    speakResponse("Calling your family now. They'll be with you shortly.");
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} className="bg-slate-900 dark:bg-black min-h-screen">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => onMemoryGalleryOpen && onMemoryGalleryOpen()}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white border-slate-700 hover:bg-slate-700 min-h-[48px] sm:min-h-[52px] text-base sm:text-lg touch-manipulation"
          >
            <BookHeart className="w-5 h-5 sm:w-6 sm:h-6" />
            View Happy Memories
          </Button>
        </div>

        {showAnxietyAlert && (
          <AnxietyAlert
            anxietyLevel={anxietyState.level}
            suggestedMode={anxietyState.suggestedMode}
            onModeSwitch={() => {
              if (anxietyState.suggestedMode && onModeSwitch) {
                onModeSwitch(anxietyState.suggestedMode);
              }
              setShowAnxietyAlert(false);
            }}
            onDismiss={() => setShowAnxietyAlert(false)}
          />
        )}
        
        <div className="bg-gradient-to-b from-emerald-900/50 to-emerald-800/30 rounded-2xl p-5 sm:p-6 mb-4 sm:mb-6 text-center">
          <h2 className="text-emerald-400 text-xl sm:text-2xl md:text-3xl font-semibold flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
            Home Security System
          </h2>
          <div className="flex items-center justify-center gap-3 text-emerald-300 text-base sm:text-lg md:text-xl">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-400"
            />
            All Systems Secure
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {cameras.map((camera, idx) => (
            <CameraView key={idx} label={camera.label} status={camera.status} />
          ))}
        </div>

        <SecurityLog entries={logs} />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <Button
            onClick={runSecurityCheck}
            disabled={isLoading}
            className="bg-emerald-900 hover:bg-emerald-800 border-2 border-emerald-700 text-white p-4 sm:p-5 min-h-[64px] sm:min-h-[72px] flex flex-col sm:flex-row items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
          >
            {isLoading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Search className="w-5 h-5 sm:w-6 sm:h-6" />}
            <span className="font-semibold">Run Check</span>
          </Button>
          <Button
            onClick={lockAllDoors}
            className="bg-emerald-900 hover:bg-emerald-800 border-2 border-emerald-700 text-white p-4 sm:p-5 min-h-[64px] sm:min-h-[72px] flex flex-col sm:flex-row items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
          >
            <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-semibold">Lock All</span>
          </Button>
          <Button
            onClick={lightCheck}
            className="bg-emerald-900 hover:bg-emerald-800 border-2 border-emerald-700 text-white p-4 sm:p-5 min-h-[64px] sm:min-h-[72px] flex flex-col sm:flex-row items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
          >
            <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-semibold">Lights Check</span>
          </Button>
          <Button
            onClick={talkToSecurity}
            disabled={isLoading}
            className="bg-emerald-900 hover:bg-emerald-800 border-2 border-emerald-700 text-white p-4 sm:p-5 min-h-[64px] sm:min-h-[72px] flex flex-col sm:flex-row items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-semibold">Talk to Guard</span>
          </Button>
          <Button
            onClick={contactFamily}
            className="col-span-2 bg-red-900 hover:bg-red-800 border-2 border-red-600 text-white p-4 sm:p-5 min-h-[64px] sm:min-h-[72px] flex items-center justify-center gap-3 text-base sm:text-lg font-bold touch-manipulation"
          >
            <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />
            Call Family
          </Button>
        </div>
      </div>
    </PullToRefresh>
  );
}