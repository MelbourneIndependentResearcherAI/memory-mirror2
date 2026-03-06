import React, { useState, useRef, useEffect } from 'react';
import { Mic, CheckCircle2, ChevronRight, RotateCcw, X, Award, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { voicePatternAnalyzer } from '@/components/utils/voicePatternAnalyzer';

// Short, phonetically diverse script covering common sounds, accents, and sentence patterns
const TRAINING_PHRASES = [
  { id: 1, text: "Good morning, I'd like to have a cup of tea please.", focus: "Common daily request" },
  { id: 2, text: "My name is important to me and I remember it well.", focus: "Self-identification" },
  { id: 3, text: "I used to love walking in the garden on sunny days.", focus: "Nostalgic phrasing" },
  { id: 4, text: "Can you help me? I'm not sure where I put that.", focus: "Question & uncertainty" },
  { id: 5, text: "The weather today is beautiful, isn't it wonderful?", focus: "Observation & agreement" },
  { id: 6, text: "I feel happy when my family comes to visit me.", focus: "Emotional expression" },
  { id: 7, text: "Yes, no, maybe, I think so, I'm not sure, that's right.", focus: "Common short responses" },
  { id: 8, text: "What time is it? Is it time for lunch or dinner already?", focus: "Time-related questions" },
];

const PHRASE_STATES = { idle: 'idle', listening: 'listening', success: 'success', error: 'error' };

export default function VoiceTrainingModule({ onClose, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phraseState, setPhraseState] = useState(PHRASE_STATES.idle);
  const [transcript, setTranscript] = useState('');
  const [completedPhrases, setCompletedPhrases] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [matchScore, setMatchScore] = useState(null);

  const recognitionRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopListening();
    };
  }, []);

  const currentPhrase = TRAINING_PHRASES[currentIndex];
  const progress = (completedPhrases.length / TRAINING_PHRASES.length) * 100;

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
  };

  const computeMatchScore = (said, target) => {
    const saidWords = said.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
    const targetWords = target.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
    const matches = saidWords.filter(w => targetWords.includes(w)).length;
    return Math.round((matches / targetWords.length) * 100);
  };

  const startListening = async () => {
    setErrorMsg('');
    setTranscript('');
    setMatchScore(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Voice recognition not supported. Please use Chrome or Edge.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
    } catch {
      setErrorMsg('Microphone access denied. Please allow microphone use.');
      return;
    }

    stopListening();
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-AU';
    recognition.maxAlternatives = 3;
    recognitionRef.current = recognition;

    setPhraseState(PHRASE_STATES.listening);

    let finalResult = '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalResult += t;
        else interim += t;
      }
      setTranscript(finalResult || interim);
    };

    recognition.onend = () => {
      if (!isMountedRef.current) return;
      const result = finalResult.trim();
      if (result.length < 3) {
        setPhraseState(PHRASE_STATES.idle);
        setErrorMsg("Didn't catch that. Please try again.");
        return;
      }
      const score = computeMatchScore(result, currentPhrase.text);
      setMatchScore(score);
      setTranscript(result);

      // Feed into voice pattern analyzer for learning
      voicePatternAnalyzer.analyzeVoiceInput(result);

      if (score >= 40) {
        setPhraseState(PHRASE_STATES.success);
        setCompletedPhrases(prev => [...prev, { phraseId: currentPhrase.id, transcript: result, score }]);
      } else {
        setPhraseState(PHRASE_STATES.error);
        setErrorMsg(`Only ${score}% matched. Please try again more clearly.`);
      }
    };

    recognition.onerror = (event) => {
      if (!isMountedRef.current) return;
      if (event.error === 'no-speech') {
        setErrorMsg('No speech detected. Please speak clearly and try again.');
      } else if (event.error !== 'aborted') {
        setErrorMsg('Recognition error. Please try again.');
      }
      setPhraseState(PHRASE_STATES.idle);
    };

    recognition.start();
  };

  const handleNext = () => {
    stopListening();
    setTranscript('');
    setMatchScore(null);
    setErrorMsg('');
    setPhraseState(PHRASE_STATES.idle);

    if (currentIndex + 1 >= TRAINING_PHRASES.length) {
      // Save learned patterns
      voicePatternAnalyzer.updateUserProfile({});
      voicePatternAnalyzer.persistPatterns();
      setIsFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    stopListening();
    setTranscript('');
    setMatchScore(null);
    setErrorMsg('');
    setPhraseState(PHRASE_STATES.idle);
    if (currentIndex + 1 >= TRAINING_PHRASES.length) {
      voicePatternAnalyzer.persistPatterns();
      setIsFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setTranscript('');
    setMatchScore(null);
    setErrorMsg('');
    setPhraseState(PHRASE_STATES.idle);
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <Card className="w-full max-w-md p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Award className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">Training Complete!</h2>
            <p className="text-slate-600">
              The AI has learned from <strong>{completedPhrases.length}</strong> of your voice samples. 
              Hands-free recognition will now be more accurate for your accent and speech patterns.
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800">
            ✓ Vocabulary patterns saved<br />
            ✓ Speech style analysed<br />
            ✓ Accent calibration stored
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { if (onComplete) onComplete(); onClose(); }}>
              Start Hands-Free
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-lg p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">🎤 Voice Training</h2>
            <p className="text-sm text-slate-500">Phrase {currentIndex + 1} of {TRAINING_PHRASES.length}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-slate-500 text-right">{completedPhrases.length} completed</p>
        </div>

        {/* Focus label */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg px-4 py-2">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
            Focus: {currentPhrase.focus}
          </p>
        </div>

        {/* Phrase to read */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border-2 border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 mb-2">Please read aloud:</p>
          <p className="text-xl font-semibold leading-relaxed text-slate-800 dark:text-slate-100">
            "{currentPhrase.text}"
          </p>
        </div>

        {/* Transcript display */}
        {transcript && (
          <div className={`rounded-lg p-4 border-2 ${
            phraseState === PHRASE_STATES.success
              ? 'bg-green-50 border-green-300 dark:bg-green-950/30'
              : phraseState === PHRASE_STATES.error
              ? 'bg-red-50 border-red-300 dark:bg-red-950/30'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <p className="text-xs text-slate-500 mb-1">I heard:</p>
            <p className="font-medium italic">"{transcript}"</p>
            {matchScore !== null && (
              <p className={`text-xs mt-1 font-semibold ${matchScore >= 40 ? 'text-green-600' : 'text-red-600'}`}>
                {matchScore}% match
              </p>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">{errorMsg}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {phraseState === PHRASE_STATES.idle && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold"
              onClick={startListening}
            >
              <Mic className="w-6 h-6 mr-2" />
              Tap to Speak
            </Button>
          )}

          {phraseState === PHRASE_STATES.listening && (
            <Button
              className="w-full bg-red-500 hover:bg-red-600 h-14 text-lg font-bold animate-pulse"
              onClick={stopListening}
              disabled
            >
              <div className="relative mr-2">
                <Mic className="w-6 h-6" />
                <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
              </div>
              Listening...
            </Button>
          )}

          {phraseState === PHRASE_STATES.success && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold"
              onClick={handleNext}
            >
              <CheckCircle2 className="w-6 h-6 mr-2 text-green-300" />
              {currentIndex + 1 >= TRAINING_PHRASES.length ? 'Finish Training' : 'Next Phrase'}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}

          {phraseState === PHRASE_STATES.error && (
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={handleRetry}>
                <RotateCcw className="w-4 h-4 mr-2" /> Try Again
              </Button>
              <Button variant="outline" className="flex-1 h-12" onClick={handleSkip}>
                Skip <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {phraseState === PHRASE_STATES.idle && (
            <Button variant="ghost" className="w-full text-sm text-slate-500" onClick={handleSkip}>
              Skip this phrase
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}