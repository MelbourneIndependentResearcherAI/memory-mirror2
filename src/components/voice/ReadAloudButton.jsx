import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReadAloudButton({ text, className = '' }) {
  const [isReading, setIsReading] = useState(false);

  const toggleReadAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;
      
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleReadAloud}
      className={`min-h-[44px] min-w-[44px] ${className}`}
    >
      {isReading ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </Button>
  );
}