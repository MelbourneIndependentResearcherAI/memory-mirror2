import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Volume2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvailableVoices, setUserVoicePreference, speakWithRealisticVoice } from './voiceUtils';

export default function VoiceSetup() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(() => {
    try {
      return localStorage.getItem('memoryMirrorVoice') || 'auto';
    } catch {
      return 'auto';
    }
  });
  const [voices, setVoices] = useState({ 
    warmComforting: [], 
    calm: [], 
    upbeat: [], 
    british: [], 
    american: [], 
    australian: [] 
  });

  useEffect(() => {
    // Load voices
    const loadVoices = () => {
      const availableVoices = getAvailableVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleVoiceChange = (voiceId) => {
    setSelectedVoice(voiceId);
    setUserVoicePreference(voiceId);
  };

  const testVoice = (voiceId) => {
    const allVoices = [
      ...voices.warmComforting, 
      ...voices.calm, 
      ...voices.upbeat, 
      ...voices.british, 
      ...voices.american, 
      ...voices.australian
    ];
    const tempVoice = allVoices.find(v => v.id === voiceId)?.voice;
    if (tempVoice) {
      const utterance = new SpeechSynthesisUtterance("Hello, I'm here to help you feel comfortable and safe.");
      utterance.voice = tempVoice;
      utterance.rate = 0.90;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="mx-4 mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[56px]"
      >
        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
          <Volume2 className="w-5 h-5" />
          Voice Settings
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
            <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 border border-blue-100 dark:border-slate-600 border-t-0 rounded-b-xl space-y-4">
              <div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold mb-1">Choose Your Preferred Voice</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Select a natural, comforting voice for conversations</p>
              </div>

              {/* Auto / Default */}
              <div className="space-y-2">
                <button
                  onClick={() => handleVoiceChange('auto')}
                  className={`w-full p-4 rounded-lg border-2 transition-all min-h-[60px] text-left ${
                    selectedVoice === 'auto'
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">🤖 Auto (Adaptive)</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Adapts voice to your emotional state</p>
                    </div>
                    {selectedVoice === 'auto' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </div>
                </button>
              </div>

              {/* Warm & Comforting */}
              {voices.warmComforting.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">🌸 Warm & Comforting</p>
                  {voices.warmComforting.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleVoiceChange(v.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all min-h-[56px] text-left ${
                        selectedVoice === v.id
                          ? 'border-pink-500 bg-pink-100 dark:bg-pink-900/30'
                          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-pink-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{v.label}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              testVoice(v.id);
                            }}
                            className="min-h-[36px] min-w-[36px]"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          {selectedVoice === v.id && (
                            <div className="w-3 h-3 rounded-full bg-pink-500" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Calm & Reassuring */}
              {voices.calm.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">🌊 Calm & Reassuring</p>
                  {voices.calm.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleVoiceChange(v.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all min-h-[56px] text-left ${
                        selectedVoice === v.id
                          ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{v.label}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              testVoice(v.id);
                            }}
                            className="min-h-[36px] min-w-[36px]"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          {selectedVoice === v.id && (
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Upbeat & Cheerful */}
              {voices.upbeat.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">☀️ Upbeat & Cheerful</p>
                  {voices.upbeat.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleVoiceChange(v.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all min-h-[56px] text-left ${
                        selectedVoice === v.id
                          ? 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900/30'
                          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-yellow-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{v.label}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              testVoice(v.id);
                            }}
                            className="min-h-[36px] min-w-[36px]"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          {selectedVoice === v.id && (
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* British Accents */}
              {voices.british.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">🇬🇧 British Accents</p>
                  {voices.british.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleVoiceChange(v.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all min-h-[56px] text-left ${
                        selectedVoice === v.id
                          ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30'
                          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{v.label}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              testVoice(v.id);
                            }}
                            className="min-h-[36px] min-w-[36px]"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          {selectedVoice === v.id && (
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* American Accents */}
              {voices.american.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">🇺🇸 American Accents</p>
                  {voices.american.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleVoiceChange(v.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all min-h-[56px] text-left ${
                        selectedVoice === v.id
                          ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/30'
                          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{v.label}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              testVoice(v.id);
                            }}
                            className="min-h-[36px] min-w-[36px]"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          {selectedVoice === v.id && (
                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Australian Accents */}
              {voices.australian.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 px-1">🇦🇺 Australian Accents</p>
                  {voices.australian.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleVoiceChange(v.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all min-h-[56px] text-left ${
                        selectedVoice === v.id
                          ? 'border-green-500 bg-green-100 dark:bg-green-900/30'
                          : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{v.label}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              testVoice(v.id);
                            }}
                            className="min-h-[36px] min-w-[36px]"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          {selectedVoice === v.id && (
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  💡 Tap the play button to preview each voice before selecting
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}