import React, { useState, useRef } from 'react';
import { ChevronDown, Mic, Square, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceSetup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('');
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      recorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setVoiceBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        setRecordingStatus('Voice recorded successfully!');
      };

      recorderRef.current.start();
      setIsRecording(true);
      setRecordingStatus('Recording...');
    } catch (error) {
      setRecordingStatus('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const testVoice = () => {
    if (voiceBlob) {
      new Audio(URL.createObjectURL(voiceBlob)).play();
    }
  };

  const clearVoice = () => {
    setVoiceBlob(null);
    setRecordingStatus('');
  };

  return (
    <div className="mx-4 mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-slate-700 font-medium">
          <Mic className="w-4 h-4" />
          Voice Setup (Optional)
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-blue-50 border border-blue-100 border-t-0 rounded-b-xl">
              <p className="text-slate-600 mb-2 font-medium">Add a familiar voice for extra comfort.</p>
              <p className="text-slate-500 text-sm mb-4">Record 30-60 seconds from a loved one or caregiver.</p>

              <div className="flex flex-wrap gap-2">
                {!isRecording ? (
                  <Button onClick={startRecording} variant="outline" size="sm" className="gap-2">
                    <Mic className="w-4 h-4" /> Record
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive" size="sm" className="gap-2">
                    <Square className="w-4 h-4" /> Stop
                  </Button>
                )}
                
                {voiceBlob && (
                  <>
                    <Button onClick={testVoice} variant="outline" size="sm" className="gap-2">
                      <Play className="w-4 h-4" /> Test
                    </Button>
                    <Button onClick={clearVoice} variant="ghost" size="sm" className="gap-2 text-red-600">
                      <Trash2 className="w-4 h-4" /> Clear
                    </Button>
                  </>
                )}
              </div>

              {isRecording && (
                <div className="flex items-center justify-center gap-1 mt-4 h-10">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-slate-600 rounded animate-pulse"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              )}

              {recordingStatus && !isRecording && (
                <div className="mt-3 p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded text-emerald-700 text-sm">
                  ✓ {recordingStatus}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}