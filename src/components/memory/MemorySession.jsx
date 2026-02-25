import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Mic, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { speakWithRealisticVoice } from '../memory-mirror/voiceUtils';

export default function MemorySession({ sessionData, onBack, onComplete }) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentPrompt = sessionData?.prompts?.[currentPromptIndex];
  const progress = ((currentPromptIndex + 1) / (sessionData?.prompts?.length || 1)) * 100;

  useEffect(() => {
    if (currentPrompt) {
      speakPrompt(currentPrompt.opening_statement);
    }
  }, [currentPromptIndex]);

  const speakPrompt = (text) => {
    setIsSpeaking(true);
    speakWithRealisticVoice(text, {
      rate: 0.92,
      pitch: 1.05,
      volume: 1.0
    });
    setTimeout(() => setIsSpeaking(false), text.length * 50);
  };

  const handleNext = () => {
    if (currentPromptIndex < sessionData.prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    } else {
      speakWithRealisticVoice(sessionData.closing_statement);
      setTimeout(() => onComplete?.(), 3000);
    }
  };

  const handlePrevious = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
    }
  };

  const startVoiceResponse = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setResponses({
        ...responses,
        [currentPromptIndex]: transcript
      });
      setIsListening(false);
      
      // Provide encouraging feedback
      const encouragement = [
        "That's wonderful to hear about.",
        "Thank you for sharing that memory.",
        "What a lovely story.",
        "I appreciate you telling me about that."
      ];
      const feedback = encouragement[Math.floor(Math.random() * encouragement.length)];
      speakWithRealisticVoice(feedback);
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  if (!sessionData) {
    return <div className="text-center py-12">Loading session...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack} className="min-h-[44px] min-w-[44px]">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1 mx-4">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {sessionData.session_title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Prompt {currentPromptIndex + 1} of {sessionData.prompts.length}
            </p>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Memory Moment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentPrompt?.media && (
            <div className="rounded-xl overflow-hidden shadow-lg">
              {currentPrompt.media.media_type === 'photo' ? (
                <img 
                  src={currentPrompt.media.media_url} 
                  alt={currentPrompt.media.title}
                  className="w-full max-h-96 object-cover"
                />
              ) : (
                <video 
                  src={currentPrompt.media.media_url}
                  controls
                  className="w-full"
                />
              )}
              {currentPrompt.media.caption && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">
                  "{currentPrompt.media.caption}"
                </p>
              )}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-md">
            <div className="flex items-start gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => speakPrompt(currentPrompt.opening_statement)}
                className="min-h-[44px] min-w-[44px] flex-shrink-0"
              >
                <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-blue-500 animate-pulse' : ''}`} />
              </Button>
              <p className="text-lg text-slate-800 dark:text-slate-100 leading-relaxed">
                {currentPrompt.opening_statement}
              </p>
            </div>

            <div className="space-y-3 mt-6">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Let's explore together:
              </p>
              {currentPrompt.guiding_questions.map((question, idx) => (
                <div key={idx} className="flex items-start gap-2 ml-4">
                  <span className="text-blue-500 font-bold">•</span>
                  <p className="text-slate-700 dark:text-slate-300">{question}</p>
                </div>
              ))}
            </div>

            {currentPrompt.memory_triggers.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Memory Hints:
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentPrompt.memory_triggers.map((trigger, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                    >
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={startVoiceResponse}
              disabled={isListening}
              size="lg"
              className={`min-h-[64px] px-8 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              <Mic className={`w-6 h-6 mr-2 ${isListening ? 'animate-pulse' : ''}`} />
              {isListening ? 'Listening...' : 'Share Your Memory'}
            </Button>
          </div>

          {responses[currentPromptIndex] && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-300 dark:border-green-700">
              <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                You shared:
              </p>
              <p className="text-slate-700 dark:text-slate-300 italic">
                "{responses[currentPromptIndex]}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentPromptIndex === 0}
          variant="outline"
          className="min-h-[48px] flex-1"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          className="min-h-[48px] flex-1 bg-blue-500 hover:bg-blue-600"
        >
          {currentPromptIndex === sessionData.prompts.length - 1 ? 'Complete Session' : 'Next'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}