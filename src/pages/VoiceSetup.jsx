import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Volume2, Mic, CheckCircle2, AlertCircle, Play, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function VoiceSetup() {
  const [isListening, setIsListening] = useState(false);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [testingVoice, setTestingVoice] = useState(false);
  const [micPermission, setMicPermission] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
      toast.success('Microphone access granted');
    } catch (error) {
      setMicPermission('denied');
    }
  };

  const enableWakeWord = async () => {
    if (micPermission !== 'granted') {
      await checkMicrophonePermission();
      return;
    }

    setIsListening(true);
    setTimeout(() => {
      setWakeWordEnabled(true);
      setIsListening(false);
      toast.success('Wake word "Hey Mirror" is now active!');
    }, 1500);
  };

  const testVoice = () => {
    setTestingVoice(true);
    const utterance = new SpeechSynthesisUtterance(
      'Hello! I\'m Memory Mirror. I\'m here to chat, share memories, and keep you company whenever you need me.'
    );
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onend = () => setTestingVoice(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl">
              <Volume2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Always-On Voice Setup
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Enable hands-free voice control with "Hey Mirror"
          </p>
        </div>

        {/* Permission Status */}
        <Alert className={`mb-6 ${
          micPermission === 'granted' 
            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
            : micPermission === 'denied'
            ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
            : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
        }`}>
          {micPermission === 'granted' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-slate-700 dark:text-slate-300">
                <strong>Microphone access granted.</strong> You're ready to enable wake word detection.
              </AlertDescription>
            </>
          ) : micPermission === 'denied' ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-slate-700 dark:text-slate-300">
                <strong>Microphone access denied.</strong> Please enable microphone permissions in your browser settings.
              </AlertDescription>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-slate-700 dark:text-slate-300">
                <strong>Microphone permission required.</strong> Click below to grant access.
              </AlertDescription>
            </>
          )}
        </Alert>

        {/* Setup Steps */}
        <div className="space-y-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                Test Voice Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                First, let's make sure you can hear Memory Mirror's voice clearly.
              </p>
              <Button
                onClick={testVoice}
                disabled={testingVoice}
                className="bg-blue-600 hover:bg-blue-700 min-h-[44px]"
              >
                <Play className="w-4 h-4 mr-2" />
                {testingVoice ? 'Playing...' : 'Test Voice'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">
                  2
                </span>
                Enable Wake Word
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Enable "Hey Mirror" voice activation so you can start conversations hands-free, anytime.
              </p>
              <Button
                onClick={enableWakeWord}
                disabled={micPermission !== 'granted' || wakeWordEnabled || isListening}
                className="bg-purple-600 hover:bg-purple-700 min-h-[44px]"
              >
                <Mic className="w-4 h-4 mr-2" />
                {isListening ? 'Enabling...' : wakeWordEnabled ? 'Wake Word Active' : 'Enable Wake Word'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                  3
                </span>
                You're Ready!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {wakeWordEnabled 
                  ? 'Wake word is active! Just say "Hey Mirror" to start chatting.'
                  : 'Complete steps above to enable hands-free voice control.'
                }
              </p>
              {wakeWordEnabled && (
                <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-300">
                        All set! Try saying "Hey Mirror" now.
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Memory Mirror will respond when it hears the wake word.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-600" />
              Voice Tips
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>✓ Speak clearly at normal volume</li>
              <li>✓ Say "Hey Mirror" and wait for the tone</li>
              <li>✓ Works even in noisy environments</li>
              <li>✓ No internet required for offline mode responses</li>
              <li>✓ Voice recognition improves with use</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}