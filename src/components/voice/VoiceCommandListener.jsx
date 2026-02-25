import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../../utils';

export default function VoiceCommandListener({ onMemoryGalleryOpen, currentMode: _currentMode }) {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const speakFeedback = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleCommand = (command) => {
    const lowerCommand = command.toLowerCase();

    // Navigation commands
    if (lowerCommand.includes('chat') || lowerCommand.includes('talk') || lowerCommand.includes('conversation')) {
      navigate('/chat');
      speakFeedback('Switching to chat mode');
    } else if (lowerCommand.includes('phone') || lowerCommand.includes('call')) {
      navigate('/phone');
      speakFeedback('Switching to phone mode');
    } else if (lowerCommand.includes('security') || lowerCommand.includes('safe') || lowerCommand.includes('check')) {
      navigate('/SecurityMode');
      speakFeedback('Switching to security mode');
    } else if (lowerCommand.includes('memor') || lowerCommand.includes('happy') || lowerCommand.includes('photos')) {
      if (onMemoryGalleryOpen) {
        onMemoryGalleryOpen();
        speakFeedback('Opening memory gallery');
      }
    } else if (lowerCommand.includes('home') || lowerCommand.includes('main')) {
      navigate('/');
      speakFeedback('Going home');
    } else if (lowerCommand.includes('settings') || lowerCommand.includes('caregiver')) {
      navigate(createPageUrl('CaregiverPortal'));
      speakFeedback('Opening caregiver portal');
    } else if (lowerCommand.includes('read') || lowerCommand.includes('speak')) {
      readPageContent();
    }
  };

  const readPageContent = () => {
    window.speechSynthesis.cancel();
    
    const content = document.body.innerText;
    const cleanedContent = content
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 1000); // Limit to avoid very long reads
    
    const utterance = new SpeechSynthesisUtterance(cleanedContent);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice commands not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event) => {
      const command = event.results[event.results.length - 1][0].transcript;
      handleCommand(command);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isActive) {
        recognitionRef.current.start();
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsActive(false);
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setIsActive(true);
      startListening();
      speakFeedback('Voice commands activated');
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <Button
        size="icon"
        onClick={toggleListening}
        className={`h-14 w-14 rounded-full shadow-lg ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </Button>
    </div>
  );
}