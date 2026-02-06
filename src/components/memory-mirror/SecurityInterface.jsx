import React, { useState } from 'react';
import { Shield, Search, Lock, Lightbulb, MessageCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import CameraView from './CameraView';
import SecurityLog from './SecurityLog';
import AnxietyAlert from './AnxietyAlert';
import { base44 } from '@/api/base44Client';
import { speakWithRealisticVoice, detectAnxiety, getCalmingRedirect } from '@/utils/voiceUtils';

const securityPrompt = `You're a professional security guard monitoring this person's home. They have dementia and may be experiencing paranoia about break-ins or theft. Your role:

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
7. If they're scared of the dark, mention lights and sensors

After responses, output META: {"realThreat": true/false, "anxiety": 0-10, "concern": "..."}`;

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

export default function SecurityInterface({ onModeSwitch }) {
  const [logs, setLogs] = useState(initialLogs);
  const [isLoading, setIsLoading] = useState(false);
  const [securityHistory, setSecurityHistory] = useState([]);
  const [anxietyState, setAnxietyState] = useState({ level: 0, suggestedMode: null });
  const [showAnxietyAlert, setShowAnxietyAlert] = useState(false);

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

    // Detect anxiety in security concern
    const anxietyDetection = detectAnxiety(concern);

    setIsLoading(true);
    setSecurityHistory(prev => [...prev, { role: 'user', content: concern }]);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${securityPrompt}\n\nIMPORTANT: User anxiety detected at level ${anxietyDetection.level}. ${anxietyDetection.trigger ? `Concern about: "${anxietyDetection.trigger}".` : ''} Be extra reassuring.\n\nConversation:\n${securityHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\nuser: ${concern}\n\nRespond as the security guard with maximum reassurance.`,
      });

      let message = typeof response === 'string' && response.includes('META:')
        ? response.split('META:')[0].trim()
        : response;

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
    <div className="bg-slate-900 min-h-[500px] p-4">
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
      
      <div className="bg-gradient-to-b from-emerald-900/50 to-emerald-800/30 rounded-2xl p-5 mb-4 text-center">
        <h2 className="text-emerald-400 text-2xl font-semibold flex items-center justify-center gap-2 mb-2">
          <Shield className="w-6 h-6" />
          Home Security System
        </h2>
        <div className="flex items-center justify-center gap-3 text-emerald-300 text-lg">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-4 h-4 rounded-full bg-emerald-400"
          />
          All Systems Secure
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {cameras.map((camera, idx) => (
          <CameraView key={idx} label={camera.label} status={camera.status} />
        ))}
      </div>

      <SecurityLog entries={logs} />

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Button
          onClick={runSecurityCheck}
          disabled={isLoading}
          className="bg-emerald-900 hover:bg-emerald-800 border-2 border-emerald-700 text-white p-4 h-auto flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Run Check
        </Button>
        <Button
          onClick={lockAllDoors}
          className="bg-emerald-900 hover:bg-emerald-800 border-2 border-emerald-700 text-white p-4 h-auto flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Lock All
        </Button>
        <Button
          onClick={lightCheck}
          className="bg-emerald-900 hover:bg-emerald-800 border-2 border-emerald-700 text-white p-4 h-auto flex items-center justify-center gap-2"
        >
          <Lightbulb className="w-4 h-4" />
          Lights Check
        </Button>
        <Button
          onClick={talkToSecurity}
          disabled={isLoading}
          className="bg-emerald-900 hover:bg-emerald-800 border-2 border-emerald-700 text-white p-4 h-auto flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Talk to Guard
        </Button>
        <Button
          onClick={contactFamily}
          className="col-span-2 bg-red-900 hover:bg-red-800 border-2 border-red-600 text-white p-4 h-auto flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Call Family
        </Button>
      </div>
    </div>
  );
}